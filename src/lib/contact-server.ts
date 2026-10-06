import { validateInquiry, type InquiryFields } from './inquiry.ts';

export const contactBodyLimit = 64 * 1024;
export const contactBodyTimeoutMs = 5000;

export interface ContactEnvironment {
  apiKey?: string;
  fromEmail?: string;
  toEmail?: string;
  deliveryEnabled?: string;
}

export interface ContactEmail {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export interface ContactSendResult {
  data: { id: string } | null;
  error: unknown;
}

export type ContactSender = (
  email: ContactEmail,
  apiKey: string,
) => Promise<ContactSendResult>;

type DiagnosticCode =
  | 'contact_configuration_unavailable'
  | 'contact_provider_rejected'
  | 'contact_provider_missing_id'
  | 'contact_provider_exception';

const failureMessage =
  'We could not accept your request. Your details are still here. Please call Grant or try again later.';
const fieldNames = [
  'name',
  'email',
  'phone',
  'preferredContact',
  'city',
  'projectType',
  'description',
] as const;
const metadataNames = ['source', 'timestamp', 'status'] as const;
const allowedFields = new Set<string>([
  ...fieldNames,
  ...metadataNames,
  'website',
  'photos',
]);
const fieldLimits: Record<keyof InquiryFields, number> = {
  name: 100,
  email: 254,
  phone: 64,
  preferredContact: 10,
  city: 100,
  projectType: 20,
  description: 3000,
};

function json(body: object, status: number, headers: HeadersInit = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

function reject(status: number, code: string, message = failureMessage) {
  return json({ accepted: false, code, message }, status);
}

export function rejectContactMethod() {
  return json(
    { accepted: false, code: 'method_not_allowed', message: failureMessage },
    405,
    { Allow: 'POST' },
  );
}

// Bare addresses only: display names, lists, and header delimiters are forbidden.
function isEmail(value: string) {
  if (value.length > 254) return false;
  const [local] = value.split('@');
  return (
    local.length <= 64 &&
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(
      value,
    )
  );
}

function configured(environment: ContactEnvironment) {
  const { apiKey, fromEmail, toEmail, deliveryEnabled } = environment;
  return (
    deliveryEnabled === 'true' &&
    typeof apiKey === 'string' &&
    apiKey.length > 0 &&
    apiKey.length <= 1024 &&
    !/\s/.test(apiKey) &&
    typeof fromEmail === 'string' &&
    isEmail(fromEmail) &&
    !/@(?:[^@]+\.)?resend\.dev$/i.test(fromEmail) &&
    typeof toEmail === 'string' &&
    isEmail(toEmail)
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function hasUnsafeControl(value: string) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code === 127 || (code < 32 && ![9, 10, 13].includes(code));
  });
}

function composeEmail(
  fields: InquiryFields,
  environment: ContactEnvironment,
): ContactEmail {
  const projectLabels: Record<string, string> = {
    residential: 'Residential',
    commercial: 'Commercial',
    'not-sure': 'Not sure yet',
  };
  const details = [
    ['Name', fields.name],
    ['Email', fields.email || 'Not provided'],
    ['Phone', fields.phone || 'Not provided'],
    [
      'Preferred contact',
      fields.preferredContact === 'email' ? 'Email' : 'Phone',
    ],
    ['Project city', fields.city],
    ['Project type', projectLabels[fields.projectType]],
    ['Project description', fields.description],
    ['Source', 'Website estimate form'],
  ];
  return {
    from: `Unshaken Painting <${environment.fromEmail!}>`,
    to: [environment.toEmail!],
    ...(fields.email ? { replyTo: fields.email } : {}),
    subject: 'New Unshaken Painting inquiry',
    text: `New Unshaken Painting inquiry\n\n${details
      .map(([label, value]) => `${label}:\n${value}`)
      .join('\n\n')}`,
    html: `<h1>New Unshaken Painting inquiry</h1><dl>${details
      .map(
        ([label, value]) =>
          `<dt><strong>${label}</strong></dt><dd>${escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>')}</dd>`,
      )
      .join('')}</dl>`,
  };
}

async function readBody(
  request: Request,
): Promise<Uint8Array<ArrayBuffer> | Response> {
  const declaredLength = request.headers.get('content-length');
  if (declaredLength !== null) {
    if (!/^\d+$/.test(declaredLength)) return reject(400, 'invalid_request');
    if (Number(declaredLength) > contactBodyLimit)
      return reject(413, 'body_too_large');
  }
  if (!request.body) return reject(400, 'invalid_request');
  if (request.signal.aborted) {
    void request.body.cancel().catch(() => {});
    return reject(400, 'invalid_request');
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let interruption: Response | undefined;
  let interrupt: (response: Response) => void;
  const interrupted = new Promise<Response>((resolve) => {
    interrupt = resolve;
  });
  const stop = (response: Response) => {
    if (interruption) return;
    interruption = response;
    // Resolve first: cancellation also settles an outstanding read as done.
    interrupt(response);
    // A slow/uncooperative stream must not delay the rejection response.
    void reader.cancel().catch(() => {});
  };
  const onAbort = () => stop(reject(400, 'invalid_request'));
  const timer = setTimeout(
    () => stop(reject(408, 'request_timeout')),
    contactBodyTimeoutMs,
  );
  request.signal.addEventListener('abort', onAbort, { once: true });
  try {
    while (true) {
      const part = await Promise.race([reader.read(), interrupted]);
      if (interruption) return interruption;
      if (part instanceof Response) return part;
      const { value, done } = part;
      if (done) break;
      size += value.byteLength;
      if (size > contactBodyLimit) {
        void reader.cancel().catch(() => {});
        return reject(413, 'body_too_large');
      }
      chunks.push(value);
    }
  } catch {
    return reject(400, 'invalid_request');
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener('abort', onAbort);
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

/** Accept an inquiry only after the injected provider confirms a message ID. */
export async function handleContactRequest(
  request: Request,
  environment: ContactEnvironment,
  send: ContactSender,
  log: (code: DiagnosticCode) => void = () => {},
): Promise<Response> {
  if (request.method !== 'POST') return rejectContactMethod();
  const origin = request.headers.get('origin');
  if (
    request.headers.get('sec-fetch-site') === 'cross-site' ||
    (origin !== null && origin !== new URL(request.url).origin)
  )
    return reject(403, 'forbidden_origin');

  const contentType = request.headers.get('content-type') || '';
  if (
    !/^(?:multipart\/form-data|application\/x-www-form-urlencoded)(?:;|$)/i.test(
      contentType,
    )
  )
    return reject(415, 'unsupported_media_type');
  const body = await readBody(request);
  if (body instanceof Response) return body;
  let form: FormData;
  try {
    form = await new Response(body, {
      headers: { 'Content-Type': contentType },
    }).formData();
  } catch {
    return reject(400, 'invalid_request');
  }

  for (const [key, value] of form) {
    if (!allowedFields.has(key)) return reject(400, 'invalid_request');
    if (key === 'photos') {
      // Browsers/parsers may represent an unselected file control as empty text.
      if (value === '') continue;
      if (typeof value === 'string') return reject(400, 'invalid_request');
      if (value.size > 0 || value.name)
        return reject(
          422,
          'photos_not_supported',
          'Photos cannot be sent with this form yet. Remove the selected photos or call Grant to discuss sharing them.',
        );
    } else if (typeof value !== 'string' || form.getAll(key).length !== 1) {
      return reject(400, 'invalid_request');
    }
  }
  if (form.getAll('website').length !== 1)
    return reject(400, 'invalid_request');
  if (form.get('website') !== '') return reject(422, 'honeypot');

  const fields = {} as InquiryFields;
  for (const key of fieldNames) {
    const raw = form.get(key) ?? '';
    if (typeof raw !== 'string') return reject(422, 'invalid_request');
    const value = raw.replace(/\r\n?/g, '\n');
    if (
      value.length > fieldLimits[key] ||
      hasUnsafeControl(value) ||
      (key !== 'description' && /[\r\n]/.test(value))
    )
      return reject(422, 'invalid_request');
    fields[key] = value.trim();
  }
  for (const key of metadataNames) {
    const raw = form.get(key);
    if (typeof raw === 'string' && (raw.length > 100 || /[\r\n]/.test(raw)))
      return reject(422, 'invalid_request');
  }
  if (
    Object.keys(validateInquiry(fields)).length ||
    (fields.email && !isEmail(fields.email))
  )
    return reject(422, 'invalid_request');

  if (!configured(environment)) {
    log('contact_configuration_unavailable');
    return reject(503, 'delivery_unavailable');
  }

  if (request.signal.aborted) return reject(400, 'invalid_request');

  try {
    const result = await send(
      composeEmail(fields, environment),
      environment.apiKey!,
    );
    if (result.error !== null && result.error !== undefined) {
      log('contact_provider_rejected');
      return reject(502, 'delivery_failed');
    }
    if (typeof result.data?.id !== 'string' || !result.data.id.trim()) {
      log('contact_provider_missing_id');
      return reject(502, 'delivery_failed');
    }
    return json({ accepted: true }, 200);
  } catch {
    log('contact_provider_exception');
    return reject(502, 'delivery_failed');
  }
}
