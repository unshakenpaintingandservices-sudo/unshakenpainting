# Unshaken Painting website

Developer onboarding and maintenance guide for the Unshaken Painting and Services website. It presents services, Grant Dorney’s story, authentic project comparisons, and contact options.

The site uses **Astro 7, TypeScript, plain CSS, and small browser scripts**, with npm and `package-lock.json` for reproducible dependency installation. Ordinary pages remain static. The Vercel adapter builds those pages and optimized assets under `.vercel/output/static/`, with an on-demand `/api/contact/` function that sends inquiries through Resend. There is no database, customer autoresponder, or file-upload integration.

Current features include five public pages, responsive navigation, keyboard-accessible before/after sliders, the supplied biography and faith explanation, and client/server inquiry validation. **Local development and non-production deployments default to a preview: it sends and saves nothing.** The default build discourages indexing. Missing owner photography, unconfirmed content, and external launch requirements mean a successful build alone does not establish production readiness.

## Quick start

Run commands from the project root using npm:

```sh
node --version
npm --version
npm ci
npm run dev
```

Open the local URL printed by Astro, normally `http://127.0.0.1:4321`. The development server binds to `127.0.0.1` and runs both pages and the contact endpoint. `npm run preview` is retained in the scripts but is unsupported by the installed Vercel adapter; use the development server for local interaction and the build/verifier for deployment-artifact checks.

### Runtime requirements

- The root [package.json](package.json) has no `engines` or `packageManager` pin, and there is no runtime-version file.
- The [lockfile](package-lock.json) resolves Astro to `7.3.2`, declaring Node `>=22.12.0` and npm `>=9.6.5`.
- The lint/parser dependencies are stricter: `eslint-plugin-astro` and `astro-eslint-parser` declare Node `^22.22.3 || ^24.16.0 || >=26.3.0`. Use a version that satisfies the development tools, not just Astro.
- Local checks have run with **Node 26.10.0 and npm 11.19.1**. The Vercel adapter does not support Node 26 as a function runtime and emits a warning before targeting **Node 24**. Select Node **24.x** in Vercel; local Node 24 should be at least **24.16.0** to satisfy the lint tools. No runtime pin or local Node installation has been changed. Deployment-runtime behavior still needs verification on Vercel.

`npm ci` installs the locked dependency graph and replaces an existing `node_modules/`. Do not substitute an unreviewed dependency update for installation troubleshooting.

No local environment file, external account, or credentials are required for the default preview. Pages, bundled fonts, project images, comparisons, and form validation work locally. [.env.example](.env.example) documents safe public defaults and empty server configuration. Keep delivery disabled until the sender and recipient have been confirmed; follow the environment instructions below when configuring an ignored `.env.local`. Preserve any existing local values.

Astro’s CLI supports background servers. If a command returns while a server remains running, inspect or stop the appropriate process:

```sh
npm exec --no -- astro dev status
npm exec --no -- astro dev logs
npm exec --no -- astro dev stop
```

For a different development port, use `npm run dev -- --port 4322`. Use the URL Astro reports and stop only the server you intend to replace.

## Command reference

All commands below use installed local dependencies. None deploys the site. Tests use mocks and never send email; submitting the development form can send real email only after both delivery switches and valid server configuration are enabled.

| Command                | Purpose and effects                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`          | Runs Astro development server with source updates; may write generated metadata/cache.                                         |
| `npm run build`        | Builds `.vercel/output/`: static pages/assets, routing configuration, and server function. Does not deploy or send email.      |
| `npm run preview`      | Unsupported by the installed Vercel adapter. Use `npm run dev` for local pages/API and build verification for artifacts.       |
| `npm run typecheck`    | Runs `astro check` for Astro/TypeScript diagnostics; may refresh `.astro/` types. Does not fix source files.                   |
| `npm run lint`         | Runs ESLint over applicable files, without automatic fixes.                                                                    |
| `npm test`             | Runs `tests/*.test.ts` with Node’s test runner and `--experimental-strip-types`; transport responses are stubbed.              |
| `npm run format:check` | Checks formatting without rewriting source.                                                                                    |
| `npm run format`       | **Rewrites** applicable files using Prettier. Review the working changes afterward.                                            |
| `npm run verify:build` | Checks `.vercel/output/static/` and function configuration after a fresh build; keep preview indexing settings for this check. |

[ESLint configuration](eslint.config.mjs) uses recommended JavaScript, TypeScript, and Astro rules. [Prettier configuration](.prettierrc.json) uses the Astro plugin and single quotes. [TypeScript configuration](tsconfig.json) extends Astro’s strict preset. Dependencies, generated output, and local review artifacts are excluded by the relevant tool configurations.

## Architecture and directory map

```text
.
├── astro.config.mjs         # Static pages, Vercel adapter, site URL, slashes
├── package.json            # Dependencies and npm scripts
├── package-lock.json       # Resolved dependency versions
├── .env.example            # Preview defaults and blank server configuration
├── src/
│   ├── pages/              # Static pages, robots/sitemap, api/contact.ts
│   ├── layouts/Layout.astro # Shared shell, metadata, fonts, header/footer
│   ├── components/         # Reusable UI, inquiry form, photo comparison
│   ├── data/               # Business facts, services, projects, approval rules
│   ├── styles/global.css   # Design tokens, layout, responsive/accessibility CSS
│   ├── scripts/contact.ts  # Browser form events and submission feedback
│   ├── lib/inquiry.ts      # Browser validation and guarded delivery
│   ├── lib/contact-server.ts # Bounded parsing, validation, email composition
│   └── assets/
│       ├── brand/          # Existing raster logo
│       └── projects/       # Authentic originals and photo maintenance notes
├── public/                 # Currently empty; files here would be copied directly
├── tests/                  # Node unit tests
├── scripts/verify-build.mjs # Static-output and function assertions
└── docs/                   # Inquiry contract and historical reports
```

`node_modules/`, `.astro/`, `dist/`, `.vercel/`, and `artifacts/` are local dependency/generated/review directories, ignored by [.gitignore](.gitignore). Optional screenshots under `artifacts/` may not be available in another checkout.

| Route                         | Entry point and composition                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                           | [index.astro](src/pages/index.astro): hero, brief services, `RecentWork`, compact `Owner`, `ContactCTA`.                                                                    |
| `/services/`                  | [services.astro](src/pages/services.astro): service catalog, scope note, and `Process`.                                                                                     |
| `/work/`                      | [work.astro](src/pages/work.astro): full `RecentWork` and approved reviews when available.                                                                                  |
| `/about/`                     | [about.astro](src/pages/about.astro): owner introduction, full biography/signature, name explanation, and `Expectations`.                                                   |
| `/contact/`                   | [contact.astro](src/pages/contact.astro): phone fallback, service-area context, and `InquiryForm`.                                                                          |
| `/api/contact/`               | [contact.ts](src/pages/api/contact.ts): on-demand POST endpoint, server-only environment lookup, and Resend SDK call. Other methods return 405.                             |
| Unmatched URL                 | [404.astro](src/pages/404.astro): custom error page, built as `404.html`; host routing must serve it appropriately.                                                         |
| `/robots.txt`, `/sitemap.xml` | [robots.txt.ts](src/pages/robots.txt.ts) and [sitemap.xml.ts](src/pages/sitemap.xml.ts): `GET` handlers executed for static output, not a request-time application backend. |

Every HTML page uses [Layout.astro](src/layouts/Layout.astro). It imports local Fontsource Manrope and Source Serif 4 fonts, global CSS, Header/Footer, a skip link, metadata, and `HousePainter` JSON-LD. Pages use native links; the mobile menu uses `details`/`summary`. There is no React/Vue hydration, third-party tracking, remote font service, or embedded map.

Executable browser code is limited to [BeforeAfterSlider.astro](src/components/BeforeAfterSlider.astro) on Home/Work and [contact.ts](src/scripts/contact.ts) on Contact. Slider styles are scoped in that component; signature styles are scoped in About. Most other styling lives in [global.css](src/styles/global.css), including responsive, reduced-motion, and forced-colors rules.

## Common maintenance tasks

### Business facts, copy, and shared UI

| Change                         | Edit and keep consistent                                                                                                                                                                                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business details               | [business.ts](src/data/business.ts): exported `business` holds names, home base, service area, contact details, story arrays, portrait, and warranty candidate. `locationLabel` derives the city/state label.                                                                       |
| Phone number                   | Update `business.phone.display`, `signatureDisplay`, `href`, and `e164` together. They serve visible copy, the biography signature, `tel:` actions, and structured data.                                                                                                            |
| Biography or faith explanation | Edit `business.ownerStory` and `business.nameStory`. Each array item becomes a paragraph on About. Preserve supplied wording/paragraph boundaries. Keep the separate short introduction in [Owner.astro](src/components/Owner.astro) consistent; it links to `/about/#grant-story`. |
| Owner portrait                 | Import an authentic local image into `business.ownerPhoto`, supply truthful `alt`, and set `approved` only with approval. `Owner` otherwise displays the explicit portrait placeholder.                                                                                             |
| Services and process           | [services.ts](src/data/services.ts): `services` supplies the Services page and `processSteps` supplies [Process.astro](src/components/Process.astro). Home’s short service labels are separate page copy.                                                                           |
| Expectations                   | `values`, `expectationCandidates`, and `getPublicExpectations()` in `services.ts` feed [Expectations.astro](src/components/Expectations.astro) on About. See approval rules below.                                                                                                  |
| Navigation/routes              | `navigation` in `business.ts` drives [Header.astro](src/components/Header.astro), [Footer.astro](src/components/Footer.astro), and the sitemap. Create a corresponding page before adding its navigation entry; an entry alone creates no route.                                    |
| Shared visual changes          | Start with tokens/layout rules in `global.css`; reuse components under `src/components/`. [Mark.astro](src/components/Mark.astro) and [Icon.astro](src/components/Icon.astro) provide decorative SVGs; [Logo.astro](src/components/Logo.astro) wraps the existing image logo.       |

Not every word is data-driven. Home has Cambridge/service copy, Work has branding text, Footer has a literal wordmark, and the supplied stories contain company names. `Layout` also includes regional wording in `schema.areaServed`. Review these when making an approved name or geographic change. Do not infer a legal name from display branding.

`business.email` conditionally displays a `mailto:` link; it does not configure a form recipient. `hours` also has conditional display. `legalName`, `socialLinks`, and `textEnabled` are currently model-only; changing them does not automatically add visible features. `ServiceArea.astro` exists but is not imported by a current page.

### Projects, photographs, and comparisons

Use [projects.ts](src/data/projects.ts) and the [photo source/permission guide](src/assets/projects/README.md).

1. Place authentic source images under `src/assets/projects/` and import them into `projects.ts`. Do not put full phone originals in `public/`, which bypasses the optimized image pipeline.
2. Create or update a `Project` in `projects`. Record only confirmed metadata. Set `publicationApproved` only with authorization; each `ProjectPhoto` needs truthful `alt`, `authenticity: 'verified-original'`, and `permissionConfirmed`.
3. Add same-project/view pairs to `comparisons` using unique IDs and titles. Verify before/after order visually and retain notes about differing viewpoints.
4. Choose the cover deliberately. `publishedProjects` filters project approval; `projectComparisons(project)` additionally checks both photographs. `projectCover(project)` tries `afterImage`, then `galleryImages`, then `beforeImage`, checking photo approval. Its callers supply published projects.
5. Review Home and Work after reordering data: [HeroVisual.astro](src/components/HeroVisual.astro) uses the first available approved cover. [RecentWork.astro](src/components/RecentWork.astro) shows up to three projects and one comparison each on Home, and all comparisons on Work.

`astro:assets` generates responsive WebP files with dimensions and `srcset`. The hero loads eagerly; most project images are lazy-loaded, while the first full Work comparison is eager. `galleryImages` currently supplies cover fallbacks, not a separate rendered gallery. Longer project-story, date, and testimonial fields are modeled but not rendered; there are no individual project routes.

Configure alignment per `ProjectComparison`:

| Field                                         | Behavior                                                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `aspectRatio`                                 | Shared stable display frame; defaults to `4 / 3`.                                                                                |
| `beforeObjectPosition`, `afterObjectPosition` | Independent CSS crop positions; each defaults to `50% 50%`.                                                                      |
| `afterScale`, `afterOffsetX`                  | Fixed uniform zoom/horizontal offset on the after image; defaults are `1` and `0%`. Keep the frame covered and avoid distortion. |
| `note`                                        | Visible caption explaining relevant limitations, such as camera perspective.                                                     |

The range input changes only the before image’s `clip-path`; it must not resize the photos while dragging. Preserve native keyboard/touch/pointer controls, labels, and visible focus. The current deck uses `IMG_1697 → IMG_1701` (exterior), `IMG_1698 → IMG_1702` (underside), and `IMG_1700 → IMG_1703` (surface). Exact crop settings and remaining perspective limits are recorded in the photo guide. Changing legitimate pairs also requires reviewing the explicit pair expectations in `verify-build.mjs`.

### Content approval and unfinished fields

- The full owner and name stories and signature phone are supplied public content. The portrait remains missing. Search current source for `TODO_GRANT_` to find outstanding decisions; historical reports contain obsolete TODO inventories.
- The biography’s general warranty sentence is public, client-supplied wording. The separate `business.warranty` terms remain unapproved; Footer renders its title/link only when `approved` is true. Do not turn the candidate into a policy without confirmation.
- `getPublicExpectations()` uses replacement candidates only when their count matches `values` and every candidate is `ownerApproved` or `ownerInterview`; otherwise it returns the existing interview-backed values.
- [faqs.ts](src/data/faqs.ts) contains `faqCandidates` and `getApprovedFaqs()`. An answer must be nonblank and owner-approved, but no current page renders FAQs. Populating the data alone does not publish a section.
- [reviews.ts](src/data/reviews.ts) is empty. `publishedReviews` uses `approvedReviews()` from [review-policy.ts](src/data/review-policy.ts), requiring verification, permission, and a distinct nonempty `householdOrProjectId`. [Reviews.astro](src/components/Reviews.astro) uses `safeReviewName()` for permitted attribution. Never render `review.name` directly or hydrate private source records into the browser.

### Metadata and indexing

Page files pass their own `title` and `description` into `Layout`. Maintain these alongside visible content. `business.url` feeds `astro.config.mjs`, canonical/Open Graph URLs, JSON-LD identifiers, sitemap URLs, and the robots sitemap location. Editing it is a content/configuration change, not a DNS or hosting change.

The exact value `PUBLIC_SITE_LAUNCH_READY=true` changes public-page robots metadata to `index, follow` and `robots.txt` to `Allow: /`. The error page remains `noindex, nofollow`. Otherwise all pages emit `noindex, nofollow` and robots emits `Disallow: /`. The sitemap always contains `navigation` entries, even in preview. These controls discourage indexing; they are not authentication or access protection.

The native Vercel redirects in [vercel.json](vercel.json) preserve nine customer-facing paths observed in the old domain's sitemap, including `/Quote` → `/contact/`, `/Gallery` → `/work/`, and old service pages → the relevant Services anchors. Each exact legacy name matches with or without its trailing slash. These use Vercel project configuration because the installed Astro adapter strips the source slash from Astro-configured redirects, making them miss after slash normalization. The build verifier simulates Vercel's merge of project rules and generated adapter routing, checks both slash forms and destination anchors, and ensures current pages/API and unrelated paths are not captured. Verify actual deployed HTTP responses before cutover. Old administrative paths are not published. Verify any additional printed or externally linked URL before cutover; no QR asset or new QR destination is introduced.

## Contact form and email

The integration is implemented with Resend **6.32.1** and `@astrojs/vercel` **11.0.12**. Its backend defaults to sending disabled; successful mocked tests do not establish a verified sending domain, a working recipient inbox, or production delivery.

```text
contact.astro → InquiryForm.astro → scripts/contact.ts
                                  → validateInquiry()
                                  → deliverInquiry() / resolveEndpoint()
                                    preview: no network request
                                    live: POST /api/contact/
                                          → runtime server configuration
                                          → bounded parsing and validation
                                          → await Resend send
                                          → accept only with a provider ID
```

[InquiryForm.astro](src/components/InquiryForm.astro) resolves the frontend configuration once at build time through [inquiry-mode.ts](src/lib/inquiry-mode.ts). It uses `VERCEL_TARGET_ENV` when present, otherwise `VERCEL_ENV`, following [Vercel’s system metadata](https://vercel.com/docs/environment-variables/system-environment-variables). Only exact `production` automatically selects the real form and canonical `/api/contact/`, even if `PUBLIC_INQUIRY_MODE` is missing or stale `preview`. Otherwise, exact `PUBLIC_INQUIRY_MODE=live` remains an explicit testing/fallback opt-in; the default is preview. Absent metadata does not establish a verified production target. Hostnames, credentials, Node production mode, and indexing never select live mode. Only the resolved mode and endpoint enter the form’s data attribute/action; the browser reads those same values. Rebuild when changing target or fallback settings: promoting an already-built preview does not recalculate static HTML.

[InquiryForm.astro](src/components/InquiryForm.astro) starts with submit disabled. The browser attaches its guard before enabling it, trims fields, and focuses linked validation errors. Without JavaScript, the form stays disabled and tells the visitor to call Grant. During submission, inputs and submit/reset controls are disabled, and accessible status feedback is shown. Failures preserve the visitor’s details and offer the existing phone alternative. Only accepted live submissions reset the form; preview validation keeps the input.

[validateInquiry()](src/lib/inquiry.ts) requires name, city, project type, description, and the preferred reply method’s contact detail. A supplied optional email/phone must also be valid. Name/city are limited to 100 characters and description to 3,000; project type is `residential`, `commercial`, or `not-sure`. The server independently checks field types, lengths, duplicates, email syntax, and control characters. Routing fields such as sender, recipient, and subject cannot be supplied by the visitor.

**Photo sending is unavailable.** The existing optional photo field and preview checks remain: up to five nonempty JPEG/PNG/WebP files, 8 MiB each and 20 MiB combined. Live mode explains the limitation and asks visitors to remove selected files before submitting. The client never uploads files, and the endpoint rejects attempted uploads. No attachments, file storage, or customer autoresponder were added.

The canonical endpoint is `/api/contact/`: keep its trailing slash because this site uses `trailingSlash: 'always'` and the browser rejects redirects. Live delivery uses a same-origin `/api/` path and HTTPS, with HTTP allowed only for exact loopback hosts `localhost`, `127.0.0.1`, and `[::1]`. Requests omit credentials, reject redirects, disable caching, and time out in the browser after 20 seconds. An HTTP-success response with JSON `accepted: true` is required. A timeout or lost response cannot establish whether Resend accepted an email; check provider records before repeating a manual test.

The [server handler](src/lib/contact-server.ts) accepts multipart form data and URL-encoded text, limits the body to **64 KiB while reading with a five-second total deadline**, cancels aborted requests, rejects malformed input and a filled/missing honeypot, and checks request origin/fetch metadata. Astro’s default origin protection stays enabled. HTML email values are escaped, a plain-text version includes the project details, and browser-provided workflow metadata has no authority. The handler awaits Resend, rejects returned errors and thrown failures, and acknowledges only a nonempty message ID. The [contact SDK transport](src/lib/contact-resend.ts) fixes the official Resend API address, rejects redirects, applies a 10-second provider timeout, and makes no automatic retries. It overrides the SDK’s public transport hook to prevent raw provider-error logging in local development as well as production. Safe JSON failures and diagnostic codes omit customer text, addresses, provider details, and secrets. See the [endpoint contract](docs/INQUIRY-ENDPOINT.md) for statuses and edge cases.

There is **no distributed rate limiter or CAPTCHA** in this repository, and no existing production limiter was available to reuse. Honeypot, origin, and body checks do not stop direct automated requests. Confirm suitable host-level abuse/rate controls for `/api/contact/` before public activation. No paid service, database, or misleading in-memory rate-limit guarantee has been added.

### Resend and Grant’s mailbox

`CONTACT_FROM_EMAIL` is a bare address on a sending domain verified in Grant’s Resend account. The server adds the fixed display name `Unshaken Painting`. `CONTACT_TO_EMAIL` is Grant’s separately confirmed, working inbox. These are independent settings: neither a likely business address nor the website domain proves an inbox exists. The server rejects `resend.dev` senders and provides no fallback sender or recipient.

A validated visitor email becomes the SDK’s camelCase `replyTo` property, including when the visitor prefers a phone call but supplies an optional email. A phone-only inquiry omits Reply-To. The visitor’s address is never used as From. Setting `business.email` only displays a contact link; it provisions neither a mailbox nor a form recipient.

Confirm domain status in the Resend dashboard. A sending-only key may not permit domain/account inspection; broader permissions are unnecessary for sending and should not be requested just for this check. Provider acceptance means Resend returned an ID, not that Grant received the email. [Resend’s domain guide](https://resend.com/docs/dashboard/domains/introduction) and [email-status guide](https://resend.com/docs/dashboard/emails/introduction) describe those separate checks.

## Environment variables

Use [.env.example](.env.example) as the names/defaults reference. Public variables are embedded at build time. The API reads server-only settings per request through [`getSecret()` from `astro:env/server`](https://docs.astro.build/en/reference/modules/astro-env/), which uses the development environment locally and the adapter’s environment in deployment.

| Variable                   | Default / placeholder               | Purpose and exposure                                                                     |
| -------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `PUBLIC_SITE_LAUNCH_READY` | `false`                             | Public/build-time. Only exact `true` enables indexing; independent of email activation.  |
| `PUBLIC_INQUIRY_MODE`      | `preview`                           | Build-time testing/fallback opt-in; known production always uses live mode.              |
| `PUBLIC_INQUIRY_ENDPOINT`  | `/api/contact/`                     | Build-time test override; known production always uses `/api/contact/`.                  |
| `RESEND_API_KEY`           | Empty                               | Server-only secret. Use a Resend key authorized to send from the configured domain.      |
| `CONTACT_FROM_EMAIL`       | Empty; format `website@example.com` | Server-only bare sender address, without a display name, on the verified sending domain. |
| `CONTACT_TO_EMAIL`         | Empty; format `owner@example.net`   | Server-only bare address of Grant’s confirmed working inbox. No default recipient.       |
| `CONTACT_DELIVERY_ENABLED` | `false`                             | Server-only runtime switch. Exact `true` plus valid key/addresses permits sending.       |

For local configuration:

1. Check that `.env.local` is ignored with `git check-ignore .env.local` and is untracked with `git ls-files -- .env.local` (the second command must print nothing). `.env*` is ignored except `.env.example`. Do this before placing a key in the file.
2. Create `.env.local` if missing, or edit the existing file privately while preserving unrelated values. Copy only the needed names/defaults from `.env.example`; do not overwrite a populated file. Restrict local permissions with `chmod 600 .env.local`.
3. Paste the API key directly into `RESEND_API_KEY` in the private local file. Fill sender and recipient only after confirmation. Never put credentials in command arguments, source, examples, screenshots, logs, or `PUBLIC_*` variables.
4. Keep `PUBLIC_INQUIRY_MODE=preview`, `CONTACT_DELIVERY_ENABLED=false`, and `PUBLIC_SITE_LAUNCH_READY=false` for ordinary development. For an authorized live test, enable the first two delivery settings only after configuration is ready; indexing can stay disabled.
5. Restart `npm run dev` after environment changes. `.env.local` configures local development; it does not configure Vercel.

The server gate also protects direct API calls when the browser is in preview mode. Changing Vercel environment values requires a new deployment to apply them; existing deployments retain their previous values. Public flags also require rebuilding their HTML/browser bundles. Never copy production credentials indiscriminately into previews or local machines.

## Testing and validation

Recommended sequence for code/content changes, using preview environment settings:

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:build
```

Use `npm run format` deliberately when formatting fixes are needed, then review its changes. Unit tests use Node’s built-in runner:

| Coverage                                                                                                                                                                                         | Location                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Browser delivery: required/optional fields, photo constraints, no-network preview, endpoint restrictions, error handling, honeypot, and mocked acknowledgments                                   | [inquiry.test.ts](tests/inquiry.test.ts)                   |
| Server delivery: malformed input, body limits, origin checks, honeypot, configured routing, Reply-To, escaped email content, missing configuration, provider errors/exceptions, and accepted IDs | [contact-server.test.ts](tests/contact-server.test.ts)     |
| Resend SDK transport: actual serialization and authentication with mocked fetch, safe diagnostics, provider errors, invalid responses, network/timeout failure, and no retries                   | [contact-resend.test.ts](tests/contact-resend.test.ts)     |
| Three tests for expectation replacement and FAQ approval                                                                                                                                         | [content-approval.test.ts](tests/content-approval.test.ts) |
| Three tests for permitted attribution, verification/permission, and independent household/project selection                                                                                      | [review-policy.test.ts](tests/review-policy.test.ts)       |

[verify-build.mjs](scripts/verify-build.mjs) reads the actual Vercel static output and function configuration. Its browser-JavaScript budget excludes server dependencies. It checks six HTML pages and five sitemap routes, unique metadata/IDs, one H1 per page, local links/anchor targets, schema, responsive WebP images, comparison pairs and range markup, blocked preview indexing, forbidden pending/legacy content and credential patterns, and a client-JavaScript budget below 15,000 bytes.

**The verifier defaults to the preview contract.** It hardcodes routes/counts, domain, city, phone, deck image pairs, and several unpublished-content exclusions. An approved change to these requires deliberate test-expectation updates. To check a local launch artifact without changing private configuration or publishing it, run `VERCEL_TARGET_ENV=production PUBLIC_SITE_LAUNCH_READY=true PUBLIC_INQUIRY_MODE=preview CONTACT_DELIVERY_ENABLED=false npm run build`, then `npm run verify:build -- --mode=launch`. This mode requires indexable public pages and robots, retains the error-page exclusion, and rejects the contact form's preview notice. The build does not send email; the explicit server gate also remains disabled. Rebuild with ordinary preview settings afterward. Use `--mode=preview --inquiry-mode=live` to verify a real form while indexing remains disabled; inquiry and indexing expectations are separate. Neither mode verifies remote environment configuration or inbox delivery, and this is not a comprehensive security audit.

Manual review remains necessary:

- Inspect affected pages around 375px, 768px, and 1440px: image crops, readable text, horizontal overflow, overlapping frames, and the fixed mobile contact bar.
- Test each comparison at 0%, 50%, and 100%, with arrows/Home/End, visible focus, pointer and touch. Confirm dragging clips a fixed crop.
- Check navigation, anchors, phone-link destinations, and contact actions. Test preview validation, preferred-contact changes, photo limits, Clear form, and no-JavaScript fallback with synthetic data. In a controlled mocked session, verify pending controls, successful reset, retained input on errors, and live-mode photo rejection.
- Recheck source permissions, exact supplied wording, and alt text. Browser behavior/visual review, accessibility conformance, live backend security, and actual email delivery are not established by the unit tests.

Run `npm run test:inquiry-mode` for the focused browser regression suite in [verify-inquiry-mode.mjs](scripts/verify-inquiry-mode.mjs). It requires an installed Chrome browser (`CHROME_PATH` selects its executable when needed), uses an isolated source copy without private environment files, builds a synthetic target/mode matrix, and intercepts browser requests before passing them to a generated backend with mocked provider transport. It verifies production POSTs, preview zero-request behavior, backend rejection/acceptance, retained input, and public-output secrecy, then closes its temporary browser/server and removes its workspace. [inquiry-mode.test.ts](tests/inquiry-mode.test.ts) separately covers target precedence and explicit fallbacks. There is no repository CI workflow. Historical screenshots are not checks automatically rerun on each change.

Review tracked files, accessible Git history, and public build output for credential patterns before release without printing any matches. Server bundles may contain environment-variable names but must not embed their values. The launch audit applied compatible security updates and a scoped `@vercel/routing-utils` / `path-to-regexp` override, preserving generated routing. One advisory remains in `http-cache-semantics`; its affected shared-cache pattern is not used by this site's current image/cache flow. Review the saved launch-audit evidence and rerun `npm audit` before release; do not treat an advisory count or an unsupported force upgrade as a security verdict.

## Deployment and operations

[astro.config.mjs](astro.config.mjs) keeps `output: 'static'` and `trailingSlash: 'always'`, adds the compatible Vercel adapter, and leaves ordinary pages prerendered. Only [the contact API](src/pages/api/contact.ts) exports `prerender = false`. `npm run build` produces **`.vercel/output/`**, including static pages/assets, generated routing configuration, and a server function. Do not hand-edit generated files or deploy only the static subdirectory; that would omit email handling. A stale `dist/` is not the deployment artifact for this integration. See the [Astro Vercel adapter guide](https://docs.astro.build/en/guides/integrations-guide/vercel/).

The repository has no confirmed Vercel account/project linkage (`.vercel/project.json`), deployment script, or remote environment configuration. No authenticated Vercel CLI/connector was available during implementation. Resend domain status, Grant’s recipient inbox, domain/DNS/TLS, mailbox provisioning, and production behavior remain external verification steps. Historical documents mention S3/CloudFront; those are not the deployment target of this integration.

### Configure the confirmed Vercel project

1. In the Vercel dashboard, select the correct account/team and the existing Unshaken Painting project. Verify its linked repository, root directory, domains, and owner before editing settings; do not create or relink a project based only on its name.
2. In project Settings, verify the Astro framework preset, npm installation (`npm ci`), and build command (`npm run build`). Keep the adapter-managed output configuration; remove an obsolete custom `dist` output override if one exists. Select Node **24.x** and verify the available build version satisfies the tool requirements above.
3. Open the project’s **Environment Variables** settings. Add the seven names in the table above with the confirmed values and intended scope. Store `RESEND_API_KEY` as **Secret** (formerly **Sensitive**) and keep server variables free of any `PUBLIC_` prefix. Vercel documents [variable management](https://vercel.com/docs/environment-variables/managing-environment-variables) and [Secret classification](https://vercel.com/docs/environment-variables/sensitive-environment-variables).
4. Scope deliberately: Production gets the production sender, confirmed recipient, and sending credential; enable `CONTACT_DELIVERY_ENABLED=true` only when ready. Known production metadata selects the real frontend without a public-mode opt-in. General Preview environments should use `preview`/`false`, `PUBLIC_SITE_LAUNCH_READY=false`, and no production key. For a trusted test branch, use branch-specific Preview overrides and approved test configuration; do not expose credentials to fork/untrusted code. Development settings are separate from Production; use only explicitly authorized local credentials in the ignored file.
5. Save the settings. A new deployment is required for both runtime values and public build flags to take effect. Deployment/promotion, code pushes, DNS changes, mailbox-record changes, and ownership changes require explicit authorization; none was performed as part of this integration.

A sending domain and an everyday mailbox are separate services. Resend domain verification must not replace existing mailbox MX records. If domain verification needs DNS work, have the owner review the exact provider records separately.

### Verify one authorized real submission

Complete mocked tests and confirm the key, verified sender, recipient inbox, and environment scope first. Then perform **at most one** clearly labeled `[WEBSITE TEST]` submission through the actual form/backend using synthetic details, with `[WEBSITE TEST]` in the name and description and no photos. Use an authorized test contact address, not a real customer’s details. The email subject stays the application’s fixed inquiry subject.

Record these separately:

- **Application acceptance:** the actual POST returned HTTP 200 and `{ "accepted": true }`, and the UI displayed acceptance/reset.
- **Provider acceptance:** locate that synthetic inquiry in Resend’s dashboard, verify its message ID, and record it privately. The public response deliberately omits the ID.
- **Provider delivery status:** inspect the provider event/status. A returned ID alone does not establish delivery.
- **Inbox receipt:** ask the user or Grant to confirm the message is in the intended inbox, check spam if needed, and verify Reply-To. Provider delivery status alone does not establish that it was read or visible in the inbox.

If configuration or access prevents any step, report it as unverified and do not claim a live test. Do not resend automatically after an ambiguous timeout; inspect Resend’s records first. Turn off test delivery settings when finished if that environment is intended to remain a non-sending preview.

Before launch, confirm any remaining owner decisions, review the responsive UI, confirm deployed routing/404 and TLS, decide production abuse controls and customer-data handling, and run the launch-mode verifier against the intended production build. Keep already approved biography and photography intact. The implementation is available for local mocked verification and deployment preparation; **production and inbox delivery are not verified**.

No automated release or rollback mechanism is included. Keep a known-good source/deployment reference and its environment settings. Restoring a Vercel deployment does not roll back DNS, Resend state, or mailbox configuration, and old deployments can retain old credentials/settings; confirm the serving deployment after any recovery.

## Troubleshooting

| Symptom                                                         | Check                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Installation/lint fails on a recent Node version                | Check the stricter lint/parser engine range above, not just Astro’s minimum. For image-binary errors, inspect the platform-specific dependency compatibility; do not silently update the lockfile.                                                                 |
| Wrong local page, occupied port, or source edits absent         | Read Astro’s reported URL and `dev` status. Use `npm run dev` with this adapter; `npm run preview` is unsupported. Stop only the server you intend to replace.                                                                                                     |
| Form says “Preview mode”                                        | Check the target used to build this artifact: exact production selects live regardless of the public mode. Without production metadata, exact `PUBLIC_INQUIRY_MODE=live` is the explicit fallback. Rebuild stale artifacts; indexing is independent.               |
| Form cannot confirm receipt                                     | Inspect the POST status and safe code. 503 means delivery is disabled or server configuration is missing/invalid; 502 means provider rejection, missing ID, or exception. Check private server configuration and sanitized diagnostics; use mocks while debugging. |
| API returns 403 or a command-line test differs from the browser | Keep Astro origin protection enabled. A form POST needs a matching `Origin`; mismatched/cross-site requests are rejected. Do not use this check as a rate limiter.                                                                                                 |
| API returns 413, 415, or 422                                    | Body limit is 64 KiB; send multipart or URL-encoded text, valid fields, and an empty `website` honeypot. Remove photos before live submission. JSON payloads and uploads are unsupported.                                                                          |
| Resend accepts but Grant cannot find the email                  | Check the configured recipient and provider delivery/bounce records, then ask Grant to inspect inbox/spam. Acceptance is not proof of inbox receipt.                                                                                                               |
| Submit remains disabled                                         | Check browser script loading/errors or JavaScript being disabled. The disabled state prevents unsafe native posting; phone fallback remains available.                                                                                                             |
| Project, review, portrait, or warranty is absent                | Inspect publication/permission/approval gates. FAQ answers and model-only fields do not render automatically.                                                                                                                                                      |
| Comparison is misaligned                                        | Verify the original pair/view and per-image crop settings. Different perspectives may remain incompatible; preserve a truthful note instead of stretching a photo.                                                                                                 |
| Build verifier fails after an intended change                   | Read its exact assertion. Check for stale/missing `.vercel/output/`, live indexing values, changed hardcoded metadata/pairs/routes, or newly approved copy still on the forbidden list. Update expectations only alongside the authorized behavior change.         |
| Site is not indexed                                             | Preview defaults deliberately block indexing. Inspect the built/served robots metadata and `robots.txt`; external crawler behavior is not tested here.                                                                                                             |

## Related documentation

- [Inquiry endpoint contract](docs/INQUIRY-ENDPOINT.md): implemented payload, server validation, response statuses, configuration, and verification limits.
- [Project photographs](src/assets/projects/README.md): authentic source files, permission requirements, EXIF orientation, pairing evidence, and current alignment settings.
- [V1 report](docs/V1-REPORT.md): historical initial architecture, content assumptions, and QA.
- [V2 report](docs/V2-REPORT.md): historical content-approval preparation and unresolved business decisions.
- [V3 report](docs/V3-VISUAL-REFINEMENT-REPORT.md): historical visual system and review evidence.
- [V4 report](docs/V4-SIMPLIFICATION-ART-DIRECTION-REPORT.md): historical page simplification and art direction.

Source/configuration describe current behavior. Reports’ missing-story/photo claims, TODO lists, test counts, measurements, and screenshots can predate later work; do not treat them as current verification. Linked local artifacts may be absent from a checkout.

No license file or package license declaration is present; this guide adds no licensing or ownership terms.
