# Local Version 1 report

Verified September 10, 2026. **No deployment, DNS changes, real emails, CRM writes, or changes to the production website were performed.** This directory was empty when work began.

## Architecture

Astro 7.3.2 and TypeScript; static HTML in `dist/`, semantic Astro components, CSS, locally bundled Manrope and Source Serif 4 fonts. No React/Vue hydration or animation framework. Native navigation provides ordinary page-load behavior; only the Contact page loads executable client JavaScript (5,356 bytes uncompressed in the final build). The existing logo is locally optimized from about 103 KB to about 12 KB WebP.

The eventual site URL and Cambridge home base are centralized in `src/data/business.ts`. Services, projects, and reviews live in separate typed data modules. `Layout.astro` supplies unique titles/descriptions, canonical URLs, OpenGraph text metadata, and a factual `HousePainter` schema. No aggregate ratings, customer counts, years in business, staff counts, awards, or invented street address are included. No social-preview image was invented.

Static output is suitable for later S3/CloudFront hosting with directory-index and 404 handling. The site creates no AWS infrastructure. A future same-origin server endpoint can handle inquiries; see [the endpoint contract](INQUIRY-ENDPOINT.md). No backend exists in this build, and no delivery credentials are included.

## Pages and shared components

| Route        | Purpose                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`          | Who Grant is, painting services, honest work placeholder, owner involvement, expectations, process, review placeholder, service area, contact |
| `/services/` | Residential, commercial, new construction, repaints/specialty; clearly limited drywall-related scope                                          |
| `/work/`     | Small recent-work architecture with an explicit placeholder and no fake project records                                                       |
| `/about/`    | Personal accountability, modest owner-photo placeholder, pending owner/name stories, values                                                   |
| `/contact/`  | Direct phone contact and a short, accessible estimate form in explicit local preview mode                                                     |

Also generated: `404.html`, `robots.txt`, and `sitemap.xml` (five public routes). No admin, integrations, settings, or city doorway pages.

Shared components: Header, Footer, Logo, Icon, HeroVisual, PhotoPlaceholder, RecentWork, Owner, Expectations, Process, Reviews, ServiceArea, ContactCTA, and InquiryForm. The mobile menu uses native details/summary; a mobile call/estimate bar remains available. Service-card fragment links intentionally open service sections. Ordinary page navigation opens at the top.

## Populated facts and source choices

- Business: Unshaken Painting and Services; owner: Grant Dorney.
- Customer-facing base: Cambridge, Minnesota; generally about 50 miles, covering surrounding north metro and east-central Minnesota communities. No absolute geographic refusal is stated.
- Core work: residential and commercial painting, residential repaints, walls/ceilings, new construction spray-outs; supporting exterior, cabinet, deck, ceiling texture/removal, mud, and preparation work. No full-service drywall claim.
- Grant remains involved in estimates, preparation, painting, project progress, and final walkthroughs. Copy does not imply he never has help.
- Referrals, word of mouth, and contractor relationships are represented as described in the supplied interview.
- Faith is represented modestly; a single Hebrews 12:28 excerpt appears in the footer. No name-origin explanation or biography has been invented.
- The existing blue logo and navy/gold visual direction were retained from the [current website](https://unshakenpainting.com/), read only. The [public application bundle](https://unshakenpainting.com/assets/index-CbcBqhpd.js) supplied the existing logo URL and the business-setting phone number, `(763) 336-5174`. This phone was not independently confirmed with Grant.
- No project photos, customer reviews, or owner portrait were imported from the old site. The only real image is the existing business logo, visually inspected. Photo regions are neutral HTML/CSS placeholders explicitly labeled “Local preview · photo pending.”

The provided interview is the source of truth for business copy. Existing-site biographical copy, portfolio claims, reviews, old contact-page information, and location positioning were not carried over.

## All remaining TODO markers

| Marker                                   | Location / required input                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `TODO_GRANT_OWNER_STORY`                 | `src/data/business.ts` — Grant’s approved biography/story                                                           |
| `TODO_GRANT_NAME_STORY`                  | `src/data/business.ts` — Grant’s own explanation of Unshaken                                                        |
| `TODO_GRANT_PROJECT_PHOTO`               | `src/data/projects.ts`, `src/assets/projects/README.md` — authentic photos, project details, publication permission |
| `TODO_GRANT_REVIEW`                      | `src/data/reviews.ts` — verified independent customer/project reviews                                               |
| `TODO_GRANT_REVIEW_PERMISSION`           | `src/data/reviews.ts` — attribution and publication permissions                                                     |
| `TODO_GRANT_SERVICE_AREA_CITIES`         | `src/data/business.ts` — a short approved community list                                                            |
| `TODO_GRANT_WARRANTY_TERMS`              | `src/data/business.ts` — approved warranty policy and details link; nothing advertised yet                          |
| `TODO_GRANT_BUSINESS_EMAIL`              | `src/data/business.ts` — confirm the mailbox is provisioned before display                                          |
| `TODO_GRANT_BUSINESS_HOURS_CONFIRMATION` | `src/data/business.ts` — approved hours, if desired                                                                 |
| `TODO_GRANT_SOCIAL_LINKS`                | `src/data/business.ts` — verified profiles, if desired                                                              |
| `TODO_GRANT_OWNER_PHOTO`                 | `src/data/business.ts` — an authentic, approved contextual photograph                                               |
| `TODO_GRANT_PHONE_CONFIRMATION`          | `src/data/business.ts` — confirm the inherited business phone number                                                |

The project model supports title, city, service, description, before/after images, gallery images, date, testimonial reference, and future project-story fields. Published photos require original-photo verification and permission. No individual project pages are exposed without real stories.

The review model supports the requested name/displayName/rating/text/source/source URL/project type/permission fields. It derives a safe attribution for anonymous, first-name, and first-name-plus-initial permissions; a full displayName cannot override those privacy limits. Verification and permission are required. Records from the same household/project are deduplicated. No profile photographs are rendered.

## Assumptions and decisions

1. The existing business-setting phone is used for local call links pending confirmation. No calls were placed.
2. No authentic portfolio image or approved portrait was available in the workspace. Placeholders are preferable until Grant supplies/approves real material.
3. No approved independent reviews were available; the review section is an explicit pending state, not an invented testimonial.
4. Text messaging stays off until Grant confirms he wants it. The preferred reply choices are email or phone.
5. Only the preferred contact channel is required; the other is optional. “Not sure yet” is available for project type. Photos are optional.
6. Image selection allows up to five JPG/PNG/WebP images, 8 MiB each and 20 MiB total. Those technical limits are configurable and need reassessment with the eventual backend.
7. The local build defaults to `noindex, nofollow` and a robots crawl block. Canonicals/sitemap use the existing domain as the future destination without publishing to it.
8. The small footer quotation is the supplied Hebrews connection, without adopting an invented brand-name explanation.
9. The project-story detail routes are deferred until real stories exist. The typed data and approved-photo components are ready to expand.
10. The named Seasons site was not provided as a URL or local asset; no identity or content was guessed or copied. The design follows the discipline and traits described in the brief.

## Verification

| Check                     | Result                                                                                                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting / format check | Passed                                                                                                                                                                                                          |
| ESLint                    | Passed                                                                                                                                                                                                          |
| Astro / TypeScript check  | Passed: 0 errors, 0 warnings, 0 hints                                                                                                                                                                           |
| Unit tests                | 11 passed                                                                                                                                                                                                       |
| Production build          | Passed: six HTML pages including 404, plus robots/sitemap                                                                                                                                                       |
| Built-output verification | Passed: 142 local links/assets, six image uses, unique metadata, five sitemap routes, factual schema, no unexpected scripts                                                                                     |
| Responsive route matrix   | All five pages checked at 375, 430, 768, 1440, and 1920 px; no horizontal overflow or broken images; one H1 per page                                                                                            |
| Navigation                | Main/footer links and mobile menu checked; normal routes begin at scroll position 0; explicit service fragments resolve                                                                                         |
| Keyboard                  | Visible first-tab skip link, skip-to-main focus, native menu activation, Enter navigation, error-summary focus, error-link field focus                                                                          |
| Form                      | Empty/invalid fields, email-only and phone-only paths, optional photos, validation feedback, reset, no-send confirmation                                                                                        |
| Privacy / delivery guards | Tests confirm partial-name privacy, permission/verification gates, duplicate-household suppression, zero network calls in preview, both live guards, HTTPS/same-origin enforcement, and failure acknowledgments |
| Repository/content scan   | Legacy location/brand/contact patterns occur only in negative audit checks; no legacy business copy or fabricated public reviews/projects/statistics                                                            |
| Browser output scan       | No credential patterns found in generated HTML/CSS/JS; no configured delivery endpoint or secret values                                                                                                         |
| Imagery                   | Existing logo inspected; remaining visual placeholders are labeled and contain no AI or stock project imagery                                                                                                   |

The form reset issue found during browser testing was fixed and rechecked against the static production build. Local screenshots and the 25-case matrix are under `artifacts/` (ignored by Git). Browser console checks reported no page errors or warnings. Static HTTP checks returned 200 for all built pages and assets checked; the admin, brand-settings, and integrations paths returned 404. The 404 page’s return-home link was verified. The no-JavaScript submit control is disabled in exported HTML.

These checks are local verification, not field Core Web Vitals measurements or a formal accessibility certification. There is no live email endpoint to exercise; future delivery must be tested separately before launch.

## Discuss with Grant before deployment

Confirm the phone; collect approved project and owner photos; interview him for the owner/name stories; choose independent reviews and record privacy permissions; finalize service-area towns; approve formal warranty terms; provision/verify the business mailbox; decide on hours, social links, and text contact; approve the final copy and design; and select the server-side inquiry destination, photo retention/privacy wording, and delivery acknowledgment behavior.

Keep the delivery and indexing flags off until those decisions and backend validation are complete. Deployment remains a separate, explicitly authorized action.
