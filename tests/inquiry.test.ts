import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInquiry,
  resolveEndpoint,
  deliverInquiry,
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
  launchReady: false,
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
test('both launch and delivery switches are needed', () => {
  assert.equal(resolveEndpoint({ ...config, mode: 'live' }), null);
  assert.equal(resolveEndpoint({ ...config, launchReady: true }), null);
});
test('live delivery fails closed for insecure or cross-origin endpoints', () => {
  const live: DeliveryConfig = {
    ...config,
    launchReady: true,
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
  assert.throws(() => resolveEndpoint({ ...live, origin: config.origin }));
  assert.equal(
    resolveEndpoint(live),
    'https://unshakenpainting.com/api/inquiries',
  );
});
test('HTTP or unacknowledged delivery errors never appear successful', async () => {
  const live: DeliveryConfig = {
    ...config,
    mode: 'live',
    launchReady: true,
    endpoint: '/api/inquiries',
    origin: 'https://unshakenpainting.com',
  };
  for (const response of [
    new Response('Unavailable', { status: 503 }),
    Response.json({}),
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
