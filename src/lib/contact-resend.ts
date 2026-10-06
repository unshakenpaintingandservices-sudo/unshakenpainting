import { Resend, type Response as ResendResponse } from 'resend';
import type { ContactEmail } from './contact-server.ts';

/**
 * The SDK logs raw provider errors outside production. Override its public
 * transport hook so the application's fixed diagnostic codes are the only logs.
 * Payload serialization and authentication still come from the pinned SDK.
 */
class ContactResend extends Resend {
  private readonly transport: typeof fetch;

  constructor(apiKey: string, transport: typeof fetch) {
    super(apiKey, { baseUrl: 'https://api.resend.com' });
    this.transport = transport;
  }

  override async fetchRequest<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ResendResponse<T>> {
    try {
      const response = await this.transport(`${this.baseUrl}${path}`, {
        ...options,
        redirect: 'error',
      });
      if (!response.ok) {
        // Do not parse, return, or log provider error bodies containing PII.
        void response.body?.cancel().catch(() => {});
        return {
          data: null,
          error: {
            name: 'application_error',
            message: 'The email provider rejected the request.',
            statusCode: response.status,
          },
          headers: null,
        };
      }
      const data: unknown = await response.json();
      // The contact handler independently requires a nonblank data.id.
      return { data: data as T, error: null, headers: null };
    } catch {
      return {
        data: null,
        error: {
          name: 'application_error',
          message: 'The email provider could not be reached.',
          statusCode: null,
        },
        headers: null,
      };
    }
  }
}

export function sendContactEmail(
  email: ContactEmail,
  apiKey: string,
  transport: typeof fetch = fetch,
) {
  return new ContactResend(apiKey, transport).emails.send(email, {
    signal: AbortSignal.timeout(10000),
  });
}
