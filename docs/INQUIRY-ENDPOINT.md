# Inquiry delivery contract — future integration

Version 1 is a static site with no backend, mail provider, CRM, or upload service. Local validation makes **no network call**, saves nothing to browser storage, and does not acknowledge a sent email.

The only client module is the contact form. `src/lib/inquiry.ts` handles validation and the delivery boundary. These three build-time public settings contain no secrets:

- `PUBLIC_INQUIRY_MODE=preview` (default; change to `live` only after endpoint approval).
- `PUBLIC_SITE_LAUNCH_READY=false` (default; controls indexing and is a second delivery guard).
- `PUBLIC_INQUIRY_ENDPOINT=` (empty; future same-origin path such as `/api/inquiries`).

Live requests require HTTPS and a same-origin `/api/` path. Absolute URLs, redirects, query-string tokens, and insecure origins are rejected. Both flags must be enabled. The request has a 15-second timeout; failure or an unrecognized acknowledgment leaves entered details in place and offers calling Grant. Without JavaScript, the submit control stays disabled and the phone remains available.

## Future server request

`POST /api/inquiries`, `multipart/form-data`, with:

- `name`, `email`, `phone`, `preferredContact` (`email` or `phone`)
- `city`, `projectType` (`residential`, `commercial`, `not-sure`), `description`
- zero or more `photos`: JPG, PNG, WebP; at most 5, 8 MiB per image and 20 MiB combined
- `source=website-estimate`, `timestamp` (ISO string), `status=new`

The server must independently validate all fields and limits, verify actual image content instead of trusting MIME declarations, reject arbitrary files, rate-limit abuse, and generate its own authoritative timestamp/source/status. Configure the recipient and any future CRM destinations server-side. Never trust the browser to select a recipient, provider URL, or workflow status. Use an appropriate request/body limit and origin policy. Strip unnecessary photo metadata before retaining or forwarding photos. Keep customer details out of logs.

A successful handler responds with JSON `{ "accepted": true }` **only after** durably accepting the inquiry. The UI says “received,” not “email delivered.” Use a non-2xx response when the request was not accepted. Do not return raw provider errors or credentials. Future acknowledgments, email delivery, and CRM handoffs belong behind this endpoint.

Provider credentials belong in a server secret store or server-only environment variables. Never put them in `PUBLIC_*`, site data, HTML, or scripts. A future AWS API/Lambda can serve the same-origin `/api/` path through CloudFront; this repository creates none of those resources.

Before enabling delivery, approve Grant’s recipient, the customer acknowledgment wording if any, photo handling/retention, privacy wording, and abuse controls. Test with a local or sandbox recipient, with explicit authorization before real mail is sent. No business mailbox has been provisioned here.
