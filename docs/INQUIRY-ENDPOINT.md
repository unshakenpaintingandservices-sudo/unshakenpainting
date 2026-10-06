# Inquiry endpoint contract

The Astro contact form sends text inquiries through Resend using a Vercel function. Ordinary pages remain static. Default configuration is a non-sending preview; no verified sender, recipient inbox, or production delivery should be inferred from a successful build or mocked test.

## Implementation map

- [InquiryForm.astro](../src/components/InquiryForm.astro): existing fields, empty `website` honeypot, accessible feedback, and phone fallback.
- [contact.ts](../src/scripts/contact.ts): browser validation, pending controls, multipart submission, retained input on errors, reset only after acceptance.
- [inquiry.ts](../src/lib/inquiry.ts): shared field validation, restricted endpoint resolution, safe frontend errors, and injectable transport.
- [api/contact.ts](../src/pages/api/contact.ts): `prerender = false`, runtime `getSecret()` lookups, Resend SDK call, and non-POST rejection.
- [contact-server.ts](../src/lib/contact-server.ts): bounded parsing, independent server validation, email composition, and provider acceptance checks.
- [contact-resend.ts](../src/lib/contact-resend.ts): Resend SDK serialization with a private transport that discards raw provider errors, rejects redirects, and limits the provider request to 10 seconds.

The compatible `@astrojs/vercel` adapter is configured in [astro.config.mjs](../astro.config.mjs). Build output is `.vercel/output/`, including `static/`, generated routing, and `functions/`. Serving static files alone cannot run the API. Use `npm run dev` for local pages/API; the adapter does not support `npm run preview`.

## Request

**`POST /api/contact/`**, with `multipart/form-data` from the form. `application/x-www-form-urlencoded` text is also accepted. JSON is unsupported. Keep the trailing slash: Vercel redirects the slashless path under this site's existing trailing-slash policy, and the browser deliberately rejects redirects.

| Field                           | Rule                                                                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                          | Required nonblank string; at most 100 characters.                                                                                                                                                 |
| `preferredContact`              | Required `email` or `phone`.                                                                                                                                                                      |
| `email`                         | Required for email replies; otherwise optional. A supplied value must be one valid bare address, at most 254 characters and a local part no longer than 64.                                       |
| `phone`                         | Required for phone replies; otherwise optional. Supplied values require 10–15 digits with only supported separators. The form allows 30 characters; the server additionally caps raw input at 64. |
| `city`                          | Required nonblank string; at most 100 characters.                                                                                                                                                 |
| `projectType`                   | Required `residential`, `commercial`, or `not-sure`.                                                                                                                                              |
| `description`                   | Required nonblank string; at most 3,000 characters. Line breaks are permitted.                                                                                                                    |
| `website`                       | Exactly one empty string. Filled, missing, or duplicate honeypot fields fail.                                                                                                                     |
| `source`, `timestamp`, `status` | Optional compatibility metadata sent by the existing browser form. Bounded and checked, but ignored for authority; the email source is fixed by the server.                                       |
| `photos`                        | No uploads. The browser removes this field; nonempty or named file parts are rejected. An empty unnamed browser file placeholder is ignored.                                                      |

Body reading has a **five-second total deadline** and cancels on client abort. Slow bodies return 408 without calling Resend. Total body size is **64 KiB**, enforced while reading the stream before multipart parsing, even without or despite an incorrect `Content-Length`. Malformed multipart, unreadable streams, unknown fields, duplicate text fields, and file values in text fields fail. Raw field lengths are checked before trimming. Control characters are rejected; line breaks are disallowed outside the description. Sender, recipient, subject, CC/BCC, and Reply-To cannot be chosen through extra request fields.

The handler rejects an explicit Origin mismatch or `Sec-Fetch-Site: cross-site`. Astro's default origin checks remain enabled and can reject form POSTs before the handler, including missing-Origin command-line requests. For an authorized HTTP smoke test, provide the actual page origin. Origin/honeypot validation does not authenticate a direct automated client.

## Email and server configuration

The API reads `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, and `CONTACT_DELIVERY_ENABLED` at request time through `getSecret()` from `astro:env/server`. These must remain server-only, never `PUBLIC_*`. See [the README environment guide](../README.md#environment-variables) and [.env.example](../.env.example) for secure local setup and placeholders.

Sending requires `CONTACT_DELIVERY_ENABLED=true`, a nonempty key, and valid configured bare sender/recipient addresses. The From header is always `Unshaken Painting <configured-sender>`. Its domain must be verified in Grant's Resend account. The recipient must be Grant's separately confirmed, working inbox; no address is invented or defaulted. `resend.dev` sender addresses are rejected in every environment.

Resend SDK **6.32.1** uses `replyTo` (camelCase) for a validated visitor email; phone-only inquiries omit it. Visitors never become the From address. Subject is fixed to **New Unshaken Painting inquiry**. HTML escapes submitted values; plain text preserves readable details. Name, supplied contact details, preferred method, project city/type, description, and a fixed website-source label are included. There are no attachments, autoresponders, marketing subscriptions, database writes, or application browser-storage persistence.

The handler awaits `resend.emails.send()`, handles both a returned SDK error and a thrown exception, and requires a nonempty `data.id`. Missing IDs fail even when no SDK error is present. The contact client overrides the SDK’s public `fetchRequest()` hook, uses the fixed official `https://api.resend.com` address, rejects redirects, applies a 10-second request timeout, and does not retry automatically. This prevents the SDK’s development-only raw error logging without changing global console or environment behavior. [SDK transport tests](../tests/contact-resend.test.ts) exercise the real SDK with mocked fetch. Provider acceptance is not inbox delivery. The application logs only fixed diagnostic codes; it omits raw provider errors, secret values, email addresses, and customer messages. Resend/mailbox retention and access remain external operational decisions.

## Response and frontend behavior

The handler's responses use JSON, `Cache-Control: no-store`, and `X-Content-Type-Options: nosniff`. Success is exactly HTTP 200 with `{ "accepted": true }`. Failures include `accepted: false`, a safe `code`, and safe explanatory text. Provider IDs are not returned publicly.

| Status | Meaning / code                                                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 200    | Resend returned a nonempty message ID with no error.                                                                         |
| 400    | Malformed body, duplicate/unknown/file-valued text fields, or missing honeypot: `invalid_request`.                           |
| 403    | Cross-origin/cross-site request: `forbidden_origin`; Astro may instead return its own safe text response before the handler. |
| 405    | Unsupported method: `method_not_allowed`, with `Allow: POST`.                                                                |
| 408    | Body-read deadline exceeded: `request_timeout`.                                                                              |
| 413    | Body exceeds 64 KiB: `body_too_large`.                                                                                       |
| 415    | Unsupported payload content type: `unsupported_media_type`.                                                                  |
| 422    | Invalid fields, filled honeypot, or attempted upload: `invalid_request`, `honeypot`, or `photos_not_supported`.              |
| 502    | Provider error, exception, or missing message ID: `delivery_failed`.                                                         |
| 503    | Disabled/missing/invalid configuration or handler failure: `delivery_unavailable`.                                           |

The form resolves its mode and endpoint once at build time. `VERCEL_TARGET_ENV` takes precedence when present, otherwise `VERCEL_ENV` is used. Only exact `production` automatically renders the real form and selects `/api/contact/`, regardless of a missing or stale public mode/endpoint. Other targets or absent metadata retain the explicit `PUBLIC_INQUIRY_MODE=live` testing/fallback opt-in and optional `PUBLIC_INQUIRY_ENDPOINT`; otherwise they use preview and make no network request. The browser reads only the resolved form data attribute/action, not deployment metadata. Absent metadata does not verify the deployment target. `PUBLIC_SITE_LAUNCH_READY` still controls indexing independently. The runtime `CONTACT_DELIVERY_ENABLED` switch and valid private configuration are required regardless of frontend mode; rejection never falls back to demo success.

The browser allows same-origin `/api/` paths only, rejects redirects and credentials, disables caching, and applies a 20-second timeout. HTTPS is required except for exact loopback hosts `localhost`, `127.0.0.1`, and `[::1]`. Controls are disabled while pending. Only a successful HTTP response containing `accepted: true` clears the form; invalid JSON, provider failures, or other failures preserve input and offer calling Grant. The frontend maps known safe codes and never displays arbitrary provider/server messages. Without JavaScript, submission remains disabled and the approved phone alternative is visible.

An infrastructure firewall may reject a request before this handler runs. HTTP **429** always produces a fixed “temporarily limited” message asking the visitor to try later or call Grant, whether its body is JSON, HTML, or empty. Other HTML/empty/unacknowledged responses remain safe failures, including an HTML page returned with HTTP 200. Inputs are retained, raw response bodies are never shown, and the browser does not retry automatically. This response handling does not itself implement or verify a production rate-limit policy.

The existing photo selector retains local preview validation (five JPEG/PNG/WebP files, 8 MiB each / 20 MiB combined). Live mode explains that photos cannot be sent and rejects selected photos before networking. They are never silently dropped from an otherwise successful submission.

## Abuse controls and verification limits

There is no reliable distributed rate limiter, CAPTCHA, or approved production firewall policy in the repository. No in-memory counter is presented as cross-instance protection. Confirm host-level controls for `/api/contact/` before public activation; origin, body, and honeypot checks alone cannot prevent direct spam. No paid service or database was introduced.

[Server tests](../tests/contact-server.test.ts) inject a mock sender and cover success, configured recipient/Reply-To, phone-only contact, escaping, invalid/malformed/duplicate fields, files, honeypot, configuration failures, returned/thrown provider errors, missing IDs, awaited acceptance, origin, methods, body size, and broken streams. [Browser transport tests](../tests/inquiry.test.ts) cover preview isolation, path/protocol guards, photos, honeypot, safe errors, and false-success prevention. Automated tests never send real email. Browser accessibility, deployed runtime behavior, provider delivery, and actual inbox receipt require separate verification.

Use the [README Vercel instructions](../README.md#configure-the-confirmed-vercel-project) to identify the correct project and scope configuration to Production, trusted branch previews, or Development. An environment change requires a new deployment. Untrusted previews must not inherit production keys or live sending. Confirm the sender's verified-domain status in Resend's dashboard; a sending-only key may not allow account/domain inspection and need not be broadened for that purpose.

Only after configuration and the recipient are confirmed, perform at most one authorized **[WEBSITE TEST]** through the actual form/backend using synthetic details and no photos. Label the name/description clearly; the subject remains fixed. Separately record the application acknowledgment, Resend acceptance/message ID, provider delivery event, and user/Grant inbox confirmation. The public response does not expose the provider ID; inspect the matching email in Resend's dashboard. A timeout can occur after provider acceptance, so investigate before retrying. If any prerequisite is missing, stop short of sending and report the live test as unverified.

## Primary references

- [Astro runtime environment API](https://docs.astro.build/en/reference/modules/astro-env/)
- [Astro Vercel adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/)
- [Resend Node SDK guide](https://resend.com/docs/send-with-nodejs)
- [Resend SDK email option types](https://github.com/resend/resend-node/blob/main/src/emails/interfaces/create-email-options.interface.ts)
- [Vercel environment-variable management](https://vercel.com/docs/environment-variables/managing-environment-variables)
