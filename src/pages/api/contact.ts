import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { sendContactEmail } from '../../lib/contact-resend';
import {
  handleContactRequest,
  rejectContactMethod,
} from '../../lib/contact-server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    return await handleContactRequest(
      request,
      {
        apiKey: getSecret('RESEND_API_KEY'),
        fromEmail: getSecret('CONTACT_FROM_EMAIL'),
        toEmail: getSecret('CONTACT_TO_EMAIL'),
        deliveryEnabled: getSecret('CONTACT_DELIVERY_ENABLED'),
      },
      sendContactEmail,
      (code) => console.error(`[contact] ${code}`),
    );
  } catch {
    console.error('[contact] contact_handler_unavailable');
    return Response.json(
      {
        accepted: false,
        code: 'delivery_unavailable',
        message:
          'We could not accept your request. Please call Grant or try again later.',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      },
    );
  }
};

export const ALL: APIRoute = () => rejectContactMethod();
