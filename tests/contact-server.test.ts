import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contactBodyLimit,
  contactBodyTimeoutMs,
  handleContactRequest,
  type ContactEmail,
  type ContactEnvironment,
  type ContactSender,
} from '../src/lib/contact-server.ts';

const environment: ContactEnvironment = {
  apiKey: 'mock-api-key-not-a-credential',
  fromEmail: 'website@example.invalid',
  toEmail: 'owner@example.invalid',
  deliveryEnabled: 'true',
};
const validFields = {
  name: 'Synthetic visitor',
  email: 'visitor@example.invalid',
  phone: '',
  preferredContact: 'email',
  city: 'Cambridge',
  projectType: 'residential',
  description: 'Please paint the living room.\nWalls and ceiling.',
  website: '',
  source: 'website-estimate',
  timestamp: '2026-10-06T12:00:00.000Z',
  status: 'new',
};

function form(values: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...validFields, ...values }))
    data.append(key, value);
  return data;
}

function request(data: FormData = form(), headers: HeadersInit = {}) {
  return new Request('https://unshakenpainting.example/api/contact', {
    method: 'POST',
    headers,
    body: data,
  });
}

function sender() {
  const sent: ContactEmail[] = [];
  const keys: string[] = [];
  const send: ContactSender = async (email, apiKey) => {
    sent.push(email);
    keys.push(apiKey);
    return { data: { id: 'mock-message-id' }, error: null };
  };
  return { sent, keys, send };
}

async function expectRejection(
  input: Request,
  status: number,
  code: string,
  config = environment,
) {
  const mock = sender();
  const response = await handleContactRequest(input, config, mock.send);
  assert.equal(response.status, status);
  const result = await response.json();
  assert.equal(result.accepted, false);
  assert.equal(result.code, code);
  assert.equal(mock.sent.length, 0);
}

test('valid multipart request uses configured addresses and visitor Reply-To', async () => {
  const mock = sender();
  const response = await handleContactRequest(
    request(form(), { Origin: 'https://unshakenpainting.example' }),
    environment,
    mock.send,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { accepted: true });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(mock.sent.length, 1);
  assert.deepEqual(mock.keys, [environment.apiKey]);
  assert.equal(
    mock.sent[0].from,
    'Unshaken Painting <website@example.invalid>',
  );
  assert.deepEqual(mock.sent[0].to, ['owner@example.invalid']);
  assert.equal(mock.sent[0].replyTo, validFields.email);
  assert.equal(mock.sent[0].subject, 'New Unshaken Painting inquiry');
  for (const value of [
    validFields.name,
    validFields.email,
    validFields.city,
    'Residential',
    'Preferred contact:\nEmail',
    validFields.description,
    'Website estimate form',
  ])
    assert.ok(mock.sent[0].text.includes(value));
  assert.equal('attachments' in mock.sent[0], false);
});

test('phone contact can omit email and has no Reply-To', async () => {
  const mock = sender();
  const data = form({ preferredContact: 'phone', phone: '763-555-0100' });
  data.delete('email');
  const response = await handleContactRequest(
    request(data),
    environment,
    mock.send,
  );
  assert.equal(response.status, 200);
  assert.equal('replyTo' in mock.sent[0], false);
  assert.ok(mock.sent[0].text.includes('763-555-0100'));
  assert.ok(mock.sent[0].text.includes('Preferred contact:\nPhone'));
});

test('HTML is escaped while plain text preserves project details', async () => {
  const mock = sender();
  const name = 'Alex & Robin <family> "friends"';
  const description = "<script>alert('synthetic')</script>\nPaint & trim";
  const response = await handleContactRequest(
    request(form({ name, description })),
    environment,
    mock.send,
  );
  assert.equal(response.status, 200);
  assert.ok(
    mock.sent[0].html.includes(
      'Alex &amp; Robin &lt;family&gt; &quot;friends&quot;',
    ),
  );
  assert.ok(
    mock.sent[0].html.includes(
      '&lt;script&gt;alert(&#39;synthetic&#39;)&lt;/script&gt;<br>Paint &amp; trim',
    ),
  );
  assert.ok(!mock.sent[0].html.includes('<script>'));
  assert.ok(mock.sent[0].text.includes(description));
});

test('server independently rejects missing, invalid, or overlong field data', async () => {
  const invalidValues: Record<string, string>[] = [
    { name: '' },
    { name: 'x'.repeat(101) },
    { email: '' },
    { email: 'incomplete@' },
    { email: 'Display <visitor@example.invalid>' },
    { email: 'a..b@example.invalid' },
    { phone: 'invalid-phone' },
    { phone: ' '.repeat(65) },
    { preferredContact: 'sms' },
    { preferredContact: 'phone', phone: '' },
    { city: '' },
    { city: 'x'.repeat(101) },
    { projectType: 'unknown' },
    { description: '' },
    { description: 'x'.repeat(3001) },
  ];
  for (const values of invalidValues)
    await expectRejection(request(form(values)), 422, 'invalid_request');
  for (const key of [
    'name',
    'preferredContact',
    'city',
    'projectType',
    'description',
  ]) {
    const data = form();
    data.delete(key);
    await expectRejection(request(data), 422, 'invalid_request');
  }
});

test('duplicate, file-valued, and unknown fields cannot select email routing', async () => {
  const duplicate = form();
  duplicate.append('email', 'second@example.invalid');
  await expectRejection(request(duplicate), 400, 'invalid_request');
  const fileField = form();
  fileField.set('name', new Blob(['synthetic']), 'name.txt');
  await expectRejection(request(fileField), 400, 'invalid_request');
  for (const key of ['from', 'to', 'replyTo', 'cc', 'bcc', 'subject'])
    await expectRejection(
      request(form({ [key]: 'injected@example.invalid' })),
      400,
      'invalid_request',
    );
});

test('honeypot rejects filled, missing, or duplicate fields without sending', async () => {
  await expectRejection(
    request(form({ website: 'https://spam.example.invalid' })),
    422,
    'honeypot',
  );
  await expectRejection(request(form({ website: ' ' })), 422, 'honeypot');
  const missing = form();
  missing.delete('website');
  await expectRejection(request(missing), 400, 'invalid_request');
  const duplicate = form();
  duplicate.append('website', '');
  await expectRejection(request(duplicate), 400, 'invalid_request');
});

test('photos are rejected with a recoverable code and never sent as attachments', async () => {
  for (const size of [0, 10]) {
    const data = form();
    data.append(
      'photos',
      new Blob(['x'.repeat(size)], { type: 'image/jpeg' }),
      'synthetic.jpg',
    );
    await expectRejection(request(data), 422, 'photos_not_supported');
  }
  const empty = form();
  empty.append('photos', new Blob([]), '');
  const mock = sender();
  assert.equal(
    (await handleContactRequest(request(empty), environment, mock.send)).status,
    200,
  );
  assert.equal('attachments' in mock.sent[0], false);
});

test('email configuration fails closed and never falls back to a Resend sender', async () => {
  for (const values of [
    { apiKey: undefined },
    { apiKey: '' },
    { fromEmail: undefined },
    { toEmail: undefined },
    { deliveryEnabled: undefined },
    { deliveryEnabled: 'false' },
    { deliveryEnabled: 'TRUE' },
    { fromEmail: 'onboarding@resend.dev' },
    { fromEmail: 'onboarding@sub.resend.dev' },
    { fromEmail: 'Name <sender@example.invalid>' },
    { toEmail: 'one@example.invalid,two@example.invalid' },
    { toEmail: 'owner@example.invalid\r\nBcc: another@example.invalid' },
  ])
    await expectRejection(request(), 503, 'delivery_unavailable', {
      ...environment,
      ...values,
    });
});

test('Resend returned errors, missing IDs, and network exceptions never acknowledge acceptance', async () => {
  const cases: { send: ContactSender; diagnostic: string }[] = [
    {
      send: async () => ({
        data: null,
        error: { message: 'PRIVATE provider details' },
      }),
      diagnostic: 'contact_provider_rejected',
    },
    {
      send: async () => ({
        data: { id: 'mock-id' },
        error: { message: 'PRIVATE provider details' },
      }),
      diagnostic: 'contact_provider_rejected',
    },
    {
      send: async () => ({ data: null, error: null }),
      diagnostic: 'contact_provider_missing_id',
    },
    {
      send: async () => ({ data: { id: '   ' }, error: null }),
      diagnostic: 'contact_provider_missing_id',
    },
    {
      send: async () => {
        throw new Error('PRIVATE network details');
      },
      diagnostic: 'contact_provider_exception',
    },
  ];
  for (const { send, diagnostic } of cases) {
    const logs: string[] = [];
    const response = await handleContactRequest(
      request(),
      environment,
      send,
      (code) => logs.push(code),
    );
    assert.equal(response.status, 502);
    const body = await response.text();
    assert.equal(JSON.parse(body).accepted, false);
    assert.equal(JSON.parse(body).code, 'delivery_failed');
    assert.ok(!body.includes('PRIVATE'));
    assert.ok(!body.includes(validFields.email));
    assert.deepEqual(logs, [diagnostic]);
  }
});

test('acceptance waits for the provider response', async () => {
  let release: (() => void) | undefined;
  let providerEntered: (() => void) | undefined;
  const entered = new Promise<void>((resolve) => {
    providerEntered = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let accepted = false;
  const response = handleContactRequest(request(), environment, async () => {
    providerEntered!();
    await gate;
    return { data: { id: 'mock-message-id' }, error: null };
  }).then((result) => {
    accepted = true;
    return result;
  });
  await entered;
  assert.equal(accepted, false);
  release!();
  assert.equal((await response).status, 200);
});

test('header injection is rejected and incoming workflow metadata has no authority', async () => {
  for (const key of ['name', 'email', 'phone', 'city'])
    await expectRejection(
      request(form({ [key]: 'Visitor\r\nBcc: injected@example.invalid' })),
      422,
      'invalid_request',
    );
  await expectRejection(
    request(form({ description: 'Project\u0000hidden' })),
    422,
    'invalid_request',
  );
  const mock = sender();
  const response = await handleContactRequest(
    request(
      form({
        source: 'untrusted source',
        status: 'approved',
        timestamp: 'untrusted timestamp',
      }),
    ),
    environment,
    mock.send,
  );
  assert.equal(response.status, 200);
  assert.ok(!mock.sent[0].text.includes('untrusted'));
  assert.ok(!mock.sent[0].text.includes('approved'));
});

test('cross-origin and cross-site submissions are rejected', async () => {
  const invalidHeaders: HeadersInit[] = [
    { Origin: 'https://other.example.invalid' },
    { Origin: 'null' },
    {
      Origin: 'https://unshakenpainting.example/',
      'Sec-Fetch-Site': 'same-origin',
    },
    { 'Sec-Fetch-Site': 'cross-site' },
  ];
  for (const headers of invalidHeaders)
    await expectRejection(request(form(), headers), 403, 'forbidden_origin');
});

test('unsupported methods and payload types have explicit failure statuses', async () => {
  const mock = sender();
  for (const method of ['GET', 'PUT', 'OPTIONS', 'DELETE']) {
    const response = await handleContactRequest(
      new Request('https://unshakenpainting.example/api/contact', { method }),
      environment,
      mock.send,
    );
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'POST');
    assert.equal((await response.json()).accepted, false);
  }
  await expectRejection(
    new Request('https://unshakenpainting.example/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validFields),
    }),
    415,
    'unsupported_media_type',
  );
  assert.equal(mock.sent.length, 0);
});

test('malformed multipart bodies and broken request streams fail without sending', async () => {
  for (const contentType of [
    'multipart/form-data',
    'multipart/form-data; boundary=missing',
  ])
    await expectRejection(
      new Request('https://unshakenpainting.example/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: 'malformed',
      }),
      400,
      'invalid_request',
    );
  const broken = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.error(new Error('PRIVATE stream details'));
    },
  });
  await expectRejection(
    new Request('https://unshakenpainting.example/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=test' },
      body: broken,
      duplex: 'half',
    } as RequestInit),
    400,
    'invalid_request',
  );
});

test('body size is bounded with, without, and despite an incorrect Content-Length', async () => {
  await expectRejection(
    request(form(), { 'Content-Length': String(contactBodyLimit + 1) }),
    413,
    'body_too_large',
  );
  await expectRejection(
    request(form(), { 'Content-Length': 'invalid' }),
    400,
    'invalid_request',
  );
  for (const declared of [undefined, '1']) {
    const chunks = [new Uint8Array(contactBodyLimit), new Uint8Array(1)];
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        const chunk = chunks.shift();
        if (chunk) controller.enqueue(chunk);
        else controller.close();
      },
    });
    await expectRejection(
      new Request('https://unshakenpainting.example/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; boundary=test',
          ...(declared ? { 'Content-Length': declared } : {}),
        },
        body,
        duplex: 'half',
      } as RequestInit),
      413,
      'body_too_large',
    );
  }
});

test('URL-encoded text fields preserve the same validation boundary', async () => {
  const mock = sender();
  const response = await handleContactRequest(
    new Request('https://unshakenpainting.example/api/contact', {
      method: 'POST',
      body: new URLSearchParams(validFields),
    }),
    environment,
    mock.send,
  );
  assert.equal(response.status, 200);
  assert.equal(mock.sent.length, 1);
});

test('stalled bodies have a total deadline even when stream cancellation never resolves', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let cancellations = 0;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('name=partial'));
    },
    cancel() {
      cancellations++;
      return new Promise<void>(() => {});
    },
  });
  const input = new Request('https://unshakenpainting.example/api/contact/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    duplex: 'half',
  } as RequestInit);
  const mock = sender();
  const operation = handleContactRequest(input, environment, mock.send);
  context.mock.timers.tick(contactBodyTimeoutMs);
  const response = await operation;
  assert.equal(response.status, 408);
  assert.equal((await response.json()).code, 'request_timeout');
  assert.equal(cancellations, 1);
  assert.equal(mock.sent.length, 0);
});

test('aborted requests cancel pending body work before any provider call', async () => {
  for (const alreadyAborted of [true, false]) {
    const aborter = new AbortController();
    let cancellations = 0;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('name=partial'));
      },
      cancel() {
        cancellations++;
      },
    });
    const input = new Request('https://unshakenpainting.example/api/contact/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      duplex: 'half',
      signal: aborter.signal,
    } as RequestInit);
    const mock = sender();
    if (alreadyAborted) aborter.abort();
    const operation = handleContactRequest(input, environment, mock.send);
    if (!alreadyAborted) aborter.abort();
    const response = await operation;
    assert.equal(response.status, 400);
    assert.equal((await response.json()).accepted, false);
    assert.equal(cancellations, 1);
    assert.equal(mock.sent.length, 0);
  }
});

test('completed body reads remove their deadline and abort listener', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const aborter = new AbortController();
  const data = new URLSearchParams(validFields);
  let cancellations = 0;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(data.toString()));
      controller.close();
    },
    cancel() {
      cancellations++;
    },
  });
  const input = new Request('https://unshakenpainting.example/api/contact/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    duplex: 'half',
    signal: aborter.signal,
  } as RequestInit);
  const mock = sender();
  assert.equal(
    (await handleContactRequest(input, environment, mock.send)).status,
    200,
  );
  context.mock.timers.tick(contactBodyTimeoutMs);
  aborter.abort();
  assert.equal(cancellations, 0);
  assert.equal(mock.sent.length, 1);
});
