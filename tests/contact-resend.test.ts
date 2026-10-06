import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendContactEmail } from '../src/lib/contact-resend.ts';
import {
  handleContactRequest,
  type ContactEmail,
} from '../src/lib/contact-server.ts';

const email: ContactEmail = {
  from: 'Unshaken Painting <website@example.invalid>',
  to: ['owner@example.invalid'],
  replyTo: 'visitor@example.invalid',
  subject: 'New Unshaken Painting inquiry',
  text: 'Synthetic project details.',
  html: '<p>Synthetic project details.</p>',
};
const apiKey = 'mock-api-key-not-a-credential';

function request() {
  const form = new FormData();
  for (const [name, value] of Object.entries({
    name: 'Synthetic visitor',
    email: 'visitor@example.invalid',
    preferredContact: 'email',
    phone: '',
    city: 'Cambridge',
    projectType: 'residential',
    description: 'Synthetic project details.',
    website: '',
  }))
    form.set(name, value);
  return new Request('https://unshakenpainting.example/api/contact/', {
    method: 'POST',
    body: form,
  });
}

test('real SDK serializes configured headers and Reply-To through the private transport', async () => {
  let calls = 0;
  const result = await sendContactEmail(
    email,
    apiKey,
    async (input, options) => {
      calls++;
      assert.equal(input, 'https://api.resend.com/emails');
      assert.equal(options?.method, 'POST');
      assert.equal(options?.redirect, 'error');
      assert.ok(options?.signal instanceof AbortSignal);
      assert.equal(options.signal.aborted, false);
      const headers = new Headers(options.headers);
      assert.equal(headers.get('Authorization'), `Bearer ${apiKey}`);
      assert.equal(headers.get('Content-Type'), 'application/json');
      assert.deepEqual(JSON.parse(String(options.body)), {
        from: email.from,
        to: email.to,
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
      return Response.json({ id: 'mock-provider-id' });
    },
  );
  assert.equal(calls, 1);
  assert.equal(result.error, null);
  assert.equal(result.data?.id, 'mock-provider-id');
});

test('SDK HTTP errors discard raw provider data and produce only sanitized application diagnostics', async (context) => {
  const consoleError = context.mock.method(console, 'error', () => {});
  const privateText =
    'PRIVATE visitor@example.invalid synthetic project details';
  const diagnostics: string[] = [];
  let calls = 0;
  const response = await handleContactRequest(
    request(),
    {
      apiKey,
      fromEmail: 'website@example.invalid',
      toEmail: 'owner@example.invalid',
      deliveryEnabled: 'true',
    },
    (message, key) =>
      sendContactEmail(message, key, async () => {
        calls++;
        return Response.json(
          { name: 'validation_error', message: privateText },
          { status: 422 },
        );
      }),
    (code) => diagnostics.push(code),
  );
  assert.equal(response.status, 502);
  assert.equal((await response.json()).accepted, false);
  assert.equal(calls, 1);
  assert.equal(consoleError.mock.callCount(), 0);
  assert.deepEqual(diagnostics, ['contact_provider_rejected']);
});

test('invalid success JSON, absent IDs, network errors, and timeouts cannot report acceptance or retry', async (context) => {
  const consoleError = context.mock.method(console, 'error', () => {});
  const transports: (typeof fetch)[] = [
    async () => new Response('invalid provider JSON'),
    async () => Response.json({}),
    async () => Response.json({ id: '' }),
    async () => {
      throw new Error('PRIVATE visitor@example.invalid network details');
    },
    async () => {
      throw new DOMException('Synthetic timeout', 'TimeoutError');
    },
  ];
  for (const transport of transports) {
    let calls = 0;
    const response = await handleContactRequest(
      request(),
      {
        apiKey,
        fromEmail: 'website@example.invalid',
        toEmail: 'owner@example.invalid',
        deliveryEnabled: 'true',
      },
      (message, key) =>
        sendContactEmail(message, key, async (...args) => {
          calls++;
          return transport(...args);
        }),
    );
    assert.equal(response.status, 502);
    const result = await response.json();
    assert.equal(result.accepted, false);
    assert.equal(result.code, 'delivery_failed');
    assert.equal(calls, 1);
  }
  assert.equal(consoleError.mock.callCount(), 0);
});
