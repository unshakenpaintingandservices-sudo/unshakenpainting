# Unshaken Painting website

Developer onboarding and maintenance guide for the Unshaken Painting and Services website. It presents services, Grant Dorney’s story, authentic project comparisons, and contact options.

The site uses **Astro 7, TypeScript, plain CSS, and small browser scripts**, with npm and `package-lock.json` for reproducible dependency installation. Astro produces static HTML and optimized images in `dist/`; there is no SSR adapter, operational inquiry backend, serverless function, database, or email integration in this repository.

Current features include five public pages, responsive navigation, keyboard-accessible before/after sliders, the supplied biography and faith explanation, and client-side inquiry validation. **The default form is a preview: it sends and saves nothing.** The default build discourages indexing. Missing owner photography, unconfirmed content, and external launch requirements mean a successful build alone does not establish production readiness.

## Quick start

Run commands from the project root using npm:

```sh
node --version
npm --version
npm ci
npm run dev
```

Open the local URL printed by Astro, normally `http://127.0.0.1:4321`. Both development and preview scripts bind to `127.0.0.1`.

### Runtime requirements

- The root [package.json](package.json) has no `engines` or `packageManager` pin, and there is no runtime-version file.
- The [lockfile](package-lock.json) resolves Astro to `7.3.2`, declaring Node `>=22.12.0` and npm `>=9.6.5`.
- The lint/parser dependencies are stricter: `eslint-plugin-astro` and `astro-eslint-parser` declare Node `^22.22.3 || ^24.16.0 || >=26.3.0`. Use a version that satisfies the development tools, not just Astro.
- Local checks have run successfully with **Node 26.10.0 and npm 11.19.1**. The other declared versions and operating systems have not all been tested.

`npm ci` installs the locked dependency graph and replaces an existing `node_modules/`. Do not substitute an unreviewed dependency update for installation troubleshooting.

No local environment file, external account, or credentials are required for the default preview. Pages, bundled fonts, project images, comparisons, and form validation work locally. [.env.example](.env.example) documents the optional public settings; if adding a local `.env`, retain its preview values. Do not overwrite an existing environment file without reviewing it privately.

Astro’s CLI supports background servers. If a command returns while a server remains running, inspect or stop the appropriate process:

```sh
npm exec --no -- astro dev status
npm exec --no -- astro dev logs
npm exec --no -- astro dev stop
npm exec --no -- astro preview status
npm exec --no -- astro preview logs
npm exec --no -- astro preview stop
```

For a different development port, use `npm run dev -- --port 4322`. Development and preview are separate servers; use the URL each command reports.

## Command reference

All commands below use installed local dependencies. None deploys the site or sends real inquiries.

| Command                | Purpose and effects                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Runs Astro development server with source updates; may write generated metadata/cache.                                            |
| `npm run build`        | Generates static pages and responsive assets in `dist/`; also refreshes generated metadata/cache. Does not deploy.                |
| `npm run preview`      | Serves the existing `dist/` locally. Run a fresh build first; it does not rebuild source edits.                                   |
| `npm run typecheck`    | Runs `astro check` for Astro/TypeScript diagnostics; may refresh `.astro/` types. Does not fix source files.                      |
| `npm run lint`         | Runs ESLint over applicable files, without automatic fixes.                                                                       |
| `npm test`             | Runs `tests/*.test.ts` with Node’s test runner and `--experimental-strip-types`; transport responses are stubbed.                 |
| `npm run format:check` | Checks formatting without rewriting source.                                                                                       |
| `npm run format`       | **Rewrites** applicable files using Prettier. Review the working changes afterward.                                               |
| `npm run verify:build` | Reads and validates an existing `dist/`. Requires a fresh build with preview indexing settings; see the validation caveats below. |

[ESLint configuration](eslint.config.mjs) uses recommended JavaScript, TypeScript, and Astro rules. [Prettier configuration](.prettierrc.json) uses the Astro plugin and single quotes. [TypeScript configuration](tsconfig.json) extends Astro’s strict preset. Dependencies, generated output, and local review artifacts are excluded by the relevant tool configurations.

## Architecture and directory map

```text
.
├── astro.config.mjs         # Static output, site URL, trailing slashes
├── package.json            # Dependencies and npm scripts
├── package-lock.json       # Resolved dependency versions
├── .env.example            # Safe public preview configuration
├── src/
│   ├── pages/              # File-based routes and generated robots/sitemap
│   ├── layouts/Layout.astro # Shared shell, metadata, fonts, header/footer
│   ├── components/         # Reusable UI, inquiry form, photo comparison
│   ├── data/               # Business facts, services, projects, approval rules
│   ├── styles/global.css   # Design tokens, layout, responsive/accessibility CSS
│   ├── scripts/contact.ts  # Browser form events and submission feedback
│   ├── lib/inquiry.ts      # Validation and guarded delivery boundary
│   └── assets/
│       ├── brand/          # Existing raster logo
│       └── projects/       # Authentic originals and photo maintenance notes
├── public/                 # Currently empty; files here would be copied directly
├── tests/                  # Node unit tests
├── scripts/verify-build.mjs # Static-output assertions
└── docs/                   # Future inquiry contract and historical reports
```

`node_modules/`, `.astro/`, `dist/`, and `artifacts/` are local dependency/generated/review directories, ignored by [.gitignore](.gitignore). Optional screenshots under `artifacts/` may not be available in another checkout.

| Route                         | Entry point and composition                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                           | [index.astro](src/pages/index.astro): hero, brief services, `RecentWork`, compact `Owner`, `ContactCTA`.                                                                    |
| `/services/`                  | [services.astro](src/pages/services.astro): service catalog, scope note, and `Process`.                                                                                     |
| `/work/`                      | [work.astro](src/pages/work.astro): full `RecentWork` and approved reviews when available.                                                                                  |
| `/about/`                     | [about.astro](src/pages/about.astro): owner introduction, full biography/signature, name explanation, and `Expectations`.                                                   |
| `/contact/`                   | [contact.astro](src/pages/contact.astro): phone fallback, service-area context, and `InquiryForm`.                                                                          |
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

The exact value `PUBLIC_SITE_LAUNCH_READY=true` changes HTML robots metadata to `index, follow` and `robots.txt` to `Allow: /`. Otherwise they emit `noindex, nofollow` and `Disallow: /`. The sitemap always contains `navigation` entries, even in preview. These controls discourage indexing; they are not authentication or access protection.

## Contact form and email

There is **no operational submission endpoint or mail provider** in this repository. The implemented flow is:

```text
contact.astro → InquiryForm.astro → scripts/contact.ts
                                  → validateInquiry()
                                  → deliverInquiry() / resolveEndpoint()
                                    preview: return before network transport
                                    live: POST to a future same-origin /api/ path
```

[InquiryForm.astro](src/components/InquiryForm.astro) starts with submit disabled. The browser script attaches its submit guard before enabling it, prevents native posting, trims fields, and focuses linked validation errors. The HTML `action="/contact/"` is not an implemented POST handler. Without JavaScript, the form stays disabled and tells the visitor to call Grant.

[validateInquiry()](src/lib/inquiry.ts) requires a name, city, project type, description, and the preferred reply method’s contact detail. A supplied optional email/phone must also be valid. Name/city are limited to 100 characters and description to 3,000. Project type is `residential`, `commercial`, or `not-sure`. Optional photos are limited to five JPEG/PNG/WebP files, nonempty and at most **8 MiB each / 20 MiB total**. Client checks use declared MIME and size; they do not inspect image contents. Keep form labels and `photoLimits` consistent when changing limits.

On valid input, the script creates multipart `FormData` with the fields, repeated `photos`, and browser-generated `source`, `timestamp`, and `status`. A pending guard prevents duplicate submissions/reset while awaiting a result. Preview returns before calling `fetch`; no application browser-storage persistence is implemented.

Live delivery requires all three settings below plus an HTTPS page origin. `resolveEndpoint()` accepts only a same-origin path under `/api/` using letters, digits, slashes, underscores, or hyphens. Absolute URLs, query tokens, and dot segments are rejected. `deliverInquiry()` uses POST, omits credentials, disables caching, rejects redirects, and times out after 15 seconds. Success requires an HTTP-success response and JSON with `accepted: true`. The UI says “received,” which does not prove email delivery. Errors retain entered details and offer calling Grant or retrying; Clear form resets the local fields/messages.

**No honeypot, CAPTCHA, rate limiting, server validation, or spam defense is implemented.** The HTTPS/path guard is not a substitute. The [future inquiry contract](docs/INQUIRY-ENDPOINT.md) specifies server validation, upload-content checks, abuse/body limits, authoritative metadata, privacy/retention rules, server-selected recipients, and durable acceptance before acknowledgment. Those are requirements for future work.

### Resend and Grant’s mailbox

Resend has no SDK dependency, API call, backend configuration, or supported secret variable here. Its key name appears only in the build verifier’s forbidden-secret patterns. If Resend is selected later, website-generated mail must be implemented behind the future server endpoint with server-only credentials and verified sender/recipient configuration.

Grant’s everyday business mailbox is a separate external service. Setting `business.email` only displays a contact address; it provisions neither a mailbox nor automated email delivery. Unit tests stub the transport. A successful test or build does not demonstrate that customer inquiries reach Grant; actual authorized delivery and mailbox checks remain external.

## Environment variables

These are the only environment variables consumed by the application. All are **public, build-time values**; Astro uses them in generated HTML/text and browser code. They contain no secrets. The current static output has no request-time server environment.

| Variable                   | Default / safe example | Purpose and requirement                                                                                                    | Exposure / environment                                                     |
| -------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `PUBLIC_SITE_LAUNCH_READY` | `false`                | Optional locally. Only exact `true` enables indexing and satisfies the second live-delivery guard.                         | Public; build-time in layout, robots output, form, and browser script.     |
| `PUBLIC_INQUIRY_MODE`      | `preview`              | Optional locally. Only exact `live` enables delivery mode, still subject to launch/endpoint guards.                        | Public; build-time in form and browser script.                             |
| `PUBLIC_INQUIRY_ENDPOINT`  | Empty                  | Optional in preview; required for live delivery. `/api/inquiries` is a future-contract example, **not an existing route**. | Public; embedded at build time, validated by the browser delivery utility. |

Restart development after changing configuration; rebuild and redeploy static output to change published behavior. A hosting dashboard setting cannot alter an already-built browser bundle. Keep deployment previews at the safe example values. `PUBLIC_SITE_LAUNCH_READY` couples indexing and delivery eligibility, so do not toggle it casually to test a form.

Local `.env` files are ignored except [.env.example](.env.example). No server-only variables are consumed today. Never place provider credentials in `PUBLIC_*`, content data, or committed examples; future server secrets belong in the endpoint’s environment, outside this client bundle.

## Testing and validation

Recommended sequence for code/content changes, using preview environment settings:

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:build
npm run preview
```

Use `npm run format` deliberately when formatting fixes are needed, then review its changes. All tests currently use Node’s built-in runner:

| Coverage                                                                                                                                                                     | Location                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Eight inquiry tests: required/optional fields, photo constraints, preview’s zero transport calls, both delivery gates, endpoint restrictions, stubbed acknowledgments/errors | [inquiry.test.ts](tests/inquiry.test.ts)                   |
| Three tests for expectation replacement and FAQ approval                                                                                                                     | [content-approval.test.ts](tests/content-approval.test.ts) |
| Three tests for permitted attribution, verification/permission, and independent household/project selection                                                                  | [review-policy.test.ts](tests/review-policy.test.ts)       |

[verify-build.mjs](scripts/verify-build.mjs) checks six HTML pages and five sitemap routes, unique metadata/IDs, one H1 per page, local links/anchor targets, schema, responsive WebP images, comparison pairs and range markup, blocked preview indexing, forbidden pending/legacy content and credential patterns, and a client-JavaScript budget below 15,000 bytes.

**The verifier encodes the current preview contract.** It hardcodes routes/counts, domain, city, phone, deck image pairs, and several unpublished-content exclusions. An approved change to these requires deliberate test-expectation updates. An indexable launch build will fail its current `noindex`/`Disallow` assertions; reconcile those during launch work instead of treating a failed check as permission to bypass validation. It is not a comprehensive security audit.

Manual review remains necessary:

- Inspect affected pages around 375px, 768px, and 1440px: image crops, readable text, horizontal overflow, overlapping frames, and the fixed mobile contact bar.
- Test each comparison at 0%, 50%, and 100%, with arrows/Home/End, visible focus, pointer and touch. Confirm dragging clips a fixed crop.
- Check navigation, anchors, phone-link destinations, and contact actions. Test preview validation, preferred-contact changes, photo limits, Clear form, and no-JavaScript fallback with synthetic data.
- Recheck source permissions, exact supplied wording, and alt text. Browser behavior/visual review, accessibility conformance, live backend security, and actual email delivery are not established by the unit tests.

There is no repository CI workflow or automated browser-test suite. Historical screenshots document past reviews, not checks automatically rerun on each change.

## Deployment and operations

The supported build artifact is **`dist/`**, generated by `npm run build`. [astro.config.mjs](astro.config.mjs) sets `output: 'static'` and `trailingSlash: 'always'`. The build machine needs compatible Node/npm and the locked dependencies; serving the resulting website needs only static hosting, not a Node application server. `npm run preview` is a local review tool.

A host must serve directory-index URLs such as `/about/`, the optimized `/_astro/` assets, generated robots/sitemap files, and `404.html` for missing pages. This repository includes no host-specific redirect, security-header, infrastructure, or deployment configuration.

| Service / setting         | Repository evidence and external work                                                                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub                    | No repository URL or Actions workflow is supplied in project configuration. Remote access, branches, protections, and deployment integrations must be verified in the actual account.                                                                                                                                           |
| Vercel                    | No `vercel.json`, Vercel adapter, or deployment script exists. If used as the host, configure the project externally with npm installation, `npm run build`, `dist/`, a compatible build runtime, and appropriate preview/production environment values. This is a build-settings mapping, not evidence of a connected project. |
| Resend                    | No integration exists. Implement a server endpoint before configuring transactional sending; verify provider/domain setup and delivery separately.                                                                                                                                                                              |
| Domain, DNS, TLS, mailbox | `business.url` is a metadata/build input only. Domain ownership, DNS, HTTPS, mailbox provisioning, and account access cannot be established from source.                                                                                                                                                                        |
| Future inquiries          | A static deployment does not create `/api/inquiries`. Live delivery requires an implemented HTTPS endpoint on the same origin; any function runtime or routing/proxy setup is separate work.                                                                                                                                    |

Repository-side configuration consists of source, manifests/lockfile, Astro/tool configuration, and the sanitized example. Provider dashboards, build-environment settings, secrets, DNS, and mailbox configuration are external. Older documents mention S3/CloudFront as possibilities; no such infrastructure is provisioned here.

Before launch:

1. Confirm public/legal naming, remaining owner-approved facts and photography, detailed warranty decisions, review permissions, and visible placeholders.
2. Validate the static build and responsive UI. Reconcile verifier expectations for any approved release/indexing changes.
3. Verify hosting routes/404 behavior, domain/DNS/TLS, build settings, preview isolation, and account access externally. Indexing flags do not protect private previews.
4. If enabling inquiries, implement and test the endpoint contract, abuse/upload/privacy controls, sender/recipient configuration, and mailbox delivery with authorized test recipients. Keep preview delivery disabled until this is complete.
5. Confirm final environment values, rebuild the release, and check the served metadata, robots rules, and contact behavior. Keep a known-good build/source reference and its environment settings for recovery.

No automated release or rollback mechanism is included. Where the chosen host supports restoring a prior deployment, verify that procedure there. Otherwise recovery requires redeploying a retained known-good static artifact or rebuilding its source with the matching lockfile and build-time settings. Restoring static files does not roll back external DNS, a future backend, or email/mailbox configuration.

## Troubleshooting

| Symptom                                                 | Check                                                                                                                                                                                                                                                    |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Installation/lint fails on a recent Node version        | Check the stricter lint/parser engine range above, not just Astro’s minimum. For image-binary errors, inspect the platform-specific dependency compatibility; do not silently update the lockfile.                                                       |
| Wrong local page, occupied port, or source edits absent | Read Astro’s reported URL and `dev`/`preview` status. Preview serves the last build; rebuild it. Stop only the server you intend to replace.                                                                                                             |
| Form says “local preview”                               | Expected unless both launch/mode flags are exact matches. Nothing is sent or saved by the application.                                                                                                                                                   |
| Form cannot confirm receipt                             | Check HTTPS, same-origin `/api/` path, actual endpoint existence, HTTP status, and JSON acknowledgment. Local HTTP is intentionally rejected in live mode; configuring a path does not create its handler. Avoid sending real inquiries while debugging. |
| Submit remains disabled                                 | Check browser script loading/errors or JavaScript being disabled. The disabled state prevents unsafe native posting; phone fallback remains available.                                                                                                   |
| Project, review, portrait, or warranty is absent        | Inspect publication/permission/approval gates. FAQ answers and model-only fields do not render automatically.                                                                                                                                            |
| Comparison is misaligned                                | Verify the original pair/view and per-image crop settings. Different perspectives may remain incompatible; preserve a truthful note instead of stretching a photo.                                                                                       |
| Build verifier fails after an intended change           | Read its exact assertion. Check for stale `dist/`, live indexing values, changed hardcoded metadata/pairs/routes, or newly approved copy still on the forbidden list. Update expectations only alongside the authorized behavior change.                 |
| Site is not indexed                                     | Preview defaults deliberately block indexing. Inspect the built/served robots metadata and `robots.txt`; external crawler behavior is not tested here.                                                                                                   |

## Related documentation

- [Inquiry endpoint contract](docs/INQUIRY-ENDPOINT.md): future request/response and server responsibilities. Its original “only client module” statement is historical; Home/Work now also have slider code.
- [Project photographs](src/assets/projects/README.md): authentic source files, permission requirements, EXIF orientation, pairing evidence, and current alignment settings.
- [V1 report](docs/V1-REPORT.md): historical initial architecture, content assumptions, and QA.
- [V2 report](docs/V2-REPORT.md): historical content-approval preparation and unresolved business decisions.
- [V3 report](docs/V3-VISUAL-REFINEMENT-REPORT.md): historical visual system and review evidence.
- [V4 report](docs/V4-SIMPLIFICATION-ART-DIRECTION-REPORT.md): historical page simplification and art direction.

Source/configuration describe current behavior. Reports’ missing-story/photo claims, TODO lists, test counts, measurements, and screenshots can predate later work; do not treat them as current verification. Linked local artifacts may be absent from a checkout.

No license file or package license declaration is present; this guide adds no licensing or ownership terms.
