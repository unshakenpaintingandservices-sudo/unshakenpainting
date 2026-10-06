import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInquiry,
  resolveEndpoint,
  deliverInquiry,
  inquiryFailureMessage,
  InquiryDeliveryError,
  photoLimits,
  type InquiryFields,
  type DeliveryConfig,
} from '../src/lib/inquiry.ts';
const fields: InquiryFields = {
  name: 'Local test',
  email: 'test@example.invalid',
  phone: '',
  preferredContact: 'email',
  city: 'Cambridge',
  projectType: 'residential',
  description: 'Local validation check.',
};
const config: DeliveryConfig = {
  mode: 'preview',
  endpoint: '',
  origin: 'http://127.0.0.1:4321',
};
test('an email request does not require a phone or photos', () =>
  assert.deepEqual(validateInquiry(fields), {}));
test('a phone request does not require email', () =>
  assert.deepEqual(
    validateInquiry({
      ...fields,
      email: '',
      phone: '+1 (763) 336-5174',
      preferredContact: 'phone',
    }),
    {},
  ));
test('empty, malformed, and missing contact data receive field-specific errors', () => {
  assert.ok(
    validateInquiry({
      ...fields,
      name: ' ',
      email: 'invalid',
      city: '',
      projectType: '',
      description: '',
    }).email,
  );
  assert.ok(validateInquiry({ ...fields, email: '' }).email);
  assert.ok(validateInquiry({ ...fields, preferredContact: 'phone' }).phone);
  assert.ok(validateInquiry({ ...fields, phone: 'abcdefghij' }).phone);
  assert.ok(
    validateInquiry({ ...fields, preferredContact: 'text' }).preferredContact,
  );
});
test('optional photos enforce MIME type, count, individual and combined size limits', () => {
  const photo = { name: 'local-test.jpg', type: 'image/jpeg', size: 1024 };
  assert.deepEqual(validateInquiry(fields, [photo]), {});
  assert.ok(
    validateInquiry(fields, [{ ...photo, type: 'image/svg+xml' }]).photos,
  );
  assert.ok(validateInquiry(fields, Array(6).fill(photo)).photos);
  assert.ok(
    validateInquiry(fields, [{ ...photo, size: photoLimits.bytesPerFile + 1 }])
      .photos,
  );
  assert.ok(
    validateInquiry(
      fields,
      Array(3).fill({ ...photo, size: photoLimits.bytesPerFile }),
    ).photos,
  );
});
test('preview never calls a network transport even with an endpoint present', async () => {
  let calls = 0;
  const transport: typeof fetch = async () => {
    calls++;
    throw new Error('Must not send');
  };
  assert.deepEqual(
    await deliverInquiry(
      new FormData(),
      { ...config, endpoint: '/api/inquiries' },
      transport,
    ),
    { status: 'preview' },
  );
  assert.equal(calls, 0);
});
test('delivery mode defaults to preview and is independent of public indexing', () => {
  assert.equal(resolveEndpoint(config), null);
  assert.equal(
    resolveEndpoint({ ...config, mode: 'live' }),
    'http://127.0.0.1:4321/api/contact/',
  );
});
test('live delivery fails closed for insecure or cross-origin endpoints', () => {
  const live: DeliveryConfig = {
    ...config,
    mode: 'live',
    endpoint: '/api/inquiries',
    origin: 'https://unshakenpainting.com',
  };
  for (const endpoint of [
    'https://example.invalid/api/inquiries',
    '//example.invalid/api/inquiries',
    '/api/../outside',
    '/api/inquiries?token=unsafe',
    '/contact/',
  ])
    assert.throws(() => resolveEndpoint({ ...live, endpoint }));
  for (const origin of [
    'http://unshakenpainting.com',
    'http://localhost.example.invalid',
    'http://192.168.1.10',
    'ftp://localhost',
    'https://user:password@unshakenpainting.com',
    'https://unshakenpainting.com/path',
    'https://unshakenpainting.com?value=1',
  ])
    assert.throws(() => resolveEndpoint({ ...live, origin }));
  assert.equal(
    resolveEndpoint(live),
    'https://unshakenpainting.com/api/inquiries',
  );
});
test('HTTP live delivery is limited to the exact loopback hosts', () => {
  for (const origin of [
    'http://localhost:4321',
    'http://127.0.0.1:4321',
    'http://[::1]:4321',
  ])
    assert.equal(
      resolveEndpoint({ ...config, mode: 'live', origin }),
      `${origin}/api/contact/`,
    );
});
test('HTTP or unacknowledged delivery errors never appear successful', async () => {
  const live: DeliveryConfig = {
    ...config,
    mode: 'live',
    endpoint: '/api/inquiries',
    origin: 'https://unshakenpainting.com',
  };
  for (const response of [
    new Response('Unavailable', { status: 503 }),
    Response.json({}),
    Response.json({ accepted: false }),
    Response.json({ accepted: 'true' }),
    Response.json({ accepted: true }, { status: 500 }),
    new Response('invalid JSON'),
  ]) {
    await assert.rejects(
      deliverInquiry(new FormData(), live, async () => response),
    );
  }
  assert.deepEqual(
    await deliverInquiry(new FormData(), live, async () =>
      Response.json({ accepted: true }),
    ),
    { status: 'accepted' },
  );
});
test('network failures preserve the submitted payload and produce a safe failure message', async () => {
  const data = new FormData();
  data.set('name', fields.name);
  data.set('description', fields.description);
  const error = new Error('Sensitive provider or transport details');
  await assert.rejects(
    deliverInquiry(data, { ...config, mode: 'live' }, async () => {
      throw error;
    }),
    error,
  );
  assert.equal(data.get('name'), fields.name);
  assert.equal(data.get('description'), fields.description);
  assert.match(inquiryFailureMessage(error), /Your details are still here/);
  assert.doesNotMatch(inquiryFailureMessage(error), /Sensitive/);
});
test('honeypot values cannot trigger preview or live success or a network call', async () => {
  let calls = 0;
  for (const mode of ['preview', 'live'] as const) {
    for (const website of ['https://spam.example.invalid', ' ']) {
      const data = new FormData();
      data.set('website', website);
      await assert.rejects(
        deliverInquiry(data, { ...config, mode }, async () => {
          calls++;
          return Response.json({ accepted: true });
        }),
        (error) =>
          error instanceof InquiryDeliveryError && error.code === 'honeypot',
      );
    }
  }
  assert.equal(calls, 0);
});
test('live transport rejects any file data without uploading it', async () => {
  let calls = 0;
  for (const key of ['photos', 'unexpectedFile']) {
    const data = new FormData();
    data.set(
      key,
      new Blob(['synthetic image'], { type: 'image/jpeg' }),
      'test.jpg',
    );
    await assert.rejects(
      deliverInquiry(data, { ...config, mode: 'live' }, async () => {
        calls++;
        return Response.json({ accepted: true });
      }),
      (error) =>
        error instanceof InquiryDeliveryError &&
        error.code === 'photos_not_supported',
    );
  }
  assert.equal(calls, 0);
});
test('safe server errors are shown without exposing arbitrary response messages', async () => {
  for (const code of [
    'honeypot',
    'photos_not_supported',
    'invalid_request',
    'delivery_unavailable',
    'rate_limited',
    'delivery_failed',
  ]) {
    await assert.rejects(
      deliverInquiry(new FormData(), { ...config, mode: 'live' }, async () =>
        Response.json(
          { code, message: 'Private provider details' },
          { status: 400 },
        ),
      ),
      (error) => {
        assert.ok(error instanceof InquiryDeliveryError);
        assert.equal(error.code, code);
        assert.match(inquiryFailureMessage(error), /Grant/);
        assert.doesNotMatch(inquiryFailureMessage(error), /Private provider/);
        return true;
      },
    );
  }
  for (const code of ['unknown_error', 'constructor', 'toString']) {
    await assert.rejects(
      deliverInquiry(new FormData(), { ...config, mode: 'live' }, async () =>
        Response.json(
          { code, message: 'Private provider details' },
          { status: 503 },
        ),
      ),
      (error) =>
        error instanceof InquiryDeliveryError &&
        error.code === 'delivery_failed',
    );
  }
});
test('infrastructure 429 responses retain input and use a fixed message without retrying', async () => {
  for (const response of [
    Response.json(
      {
        accepted: true,
        code: 'invalid_request',
        message: 'Private infrastructure details',
      },
      { status: 429 },
    ),
    new Response('<html>Private infrastructure details</html>', {
      status: 429,
      headers: { 'Content-Type': 'text/html' },
    }),
    new Response(null, { status: 429 }),
  ]) {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    data.set('website', '');
    const original = [...data.entries()];
    let calls = 0;
    await assert.rejects(
      deliverInquiry(data, { ...config, mode: 'live' }, async () => {
        calls++;
        return response;
      }),
      (error) => {
        assert.ok(error instanceof InquiryDeliveryError);
        assert.equal(error.code, 'rate_limited');
        const message = inquiryFailureMessage(error);
        assert.match(message, /temporarily limited/);
        assert.match(message, /Your details are still here/);
        assert.match(message, /try again later, or call Grant/);
        assert.doesNotMatch(message, /Private|<html>|invalid_request/);
        return true;
      },
    );
    assert.equal(calls, 1);
    assert.deepEqual([...data.entries()], original);
  }
});
test('HTML and unacknowledged responses preserve input and fail safely without retrying', async () => {
  for (const response of [
    new Response('<html>Private infrastructure details</html>', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    }),
    new Response('<html>Private infrastructure details</html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }),
    Response.json({ message: 'Private infrastructure details' }),
    new Response(null, { status: 204 }),
  ]) {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    data.set('website', '');
    const original = [...data.entries()];
    let calls = 0;
    await assert.rejects(
      deliverInquiry(data, { ...config, mode: 'live' }, async () => {
        calls++;
        return response;
      }),
      (error) => {
        assert.ok(error instanceof InquiryDeliveryError);
        assert.equal(error.code, 'delivery_failed');
        const message = inquiryFailureMessage(error);
        assert.match(message, /couldn’t confirm/);
        assert.match(message, /Your details are still here/);
        assert.match(message, /call Grant/);
        assert.doesNotMatch(message, /Private|<html>/);
        return true;
      },
    );
    assert.equal(calls, 1);
    assert.deepEqual([...data.entries()], original);
  }
});
test('accepted live delivery uses the same-origin endpoint and guarded request options', async () => {
  const data = new FormData();
  data.set('website', '');
  data.set('name', fields.name);
  assert.deepEqual(
    await deliverInquiry(
      data,
      { ...config, mode: 'live' },
      async (url, options) => {
        assert.equal(url, 'http://127.0.0.1:4321/api/contact/');
        assert.equal(options?.body, data);
        assert.equal(options?.method, 'POST');
        assert.equal(options?.credentials, 'omit');
        assert.equal(options?.cache, 'no-store');
        assert.equal(options?.redirect, 'error');
        assert.ok(options?.signal instanceof AbortSignal);
        return Response.json({ accepted: true });
      },
    ),
    { status: 'accepted' },
  );
});
