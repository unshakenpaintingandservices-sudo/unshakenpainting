# V3 — visual refinement

Verified locally on September 10, 2026. This pass refines the existing Astro + TypeScript site. It does not rebuild its architecture or change its public claims.

**Before:** V2 had dependable structure, but similar page banners, uniform service columns, repeated small rules, a boxed form, and a light footer gave different kinds of content similar visual weight. Cool neutrals and mostly uniform type measures left little sense of an individual owner.

**After:** Warm canvas, confident serif statements, cedar emphasis, restrained photo framing, an editorial service index, and a navy footer give Unshaken a recognizable atmosphere. The existing local wording and owner involvement carry the personality. No additional marketing copy was necessary.

## Scope and preserved behavior

- Existing routes, Astro/TypeScript setup, dependencies, lockfile, fonts, SEO layout, sitemap, and robots behavior remain intact.
- All 25 protected source/configuration/test files match the pre-V3 SHA-256 baseline, including business/content data, inquiry implementation, `InquiryForm.astro`, and `Layout.astro`.
- A token-frequency comparison of the generated body copy on all six pages found no added or removed words. The footer excerpt and contact context were repositioned; a few explicit spaces were added around responsive line breaks.
- `getPublicExpectations()` still controls expectations. The four existing values remain public; pending contract-derived replacements do not appear.
- Project, original-image, photo-permission, owner-photo, verified-review, attribution, household/project independence, and warranty approval gates remain intact. FAQ records remain unrendered.
- No project, review, owner portrait, customer information, warranty claim, or biography was invented.
- No deployment, DNS, AWS, mailbox provisioning, email delivery, or indexing change was performed. Launch/delivery defaults remain `false` / `preview`, with an empty endpoint.

## Files changed

| File                                    | Change                                                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/global.css`                 | Central palette and semantic tokens; complete presentation refinement; responsive compositions, controls, form states, and keyboard focus |
| `src/pages/index.astro`                 | Hero composition wrappers, abstract foundation line, and home-service section class                                                       |
| `src/pages/services.astro`              | Editorial opening class and explicit space at the responsive heading break                                                                |
| `src/pages/work.astro`                  | Portfolio opening class                                                                                                                   |
| `src/pages/about.astro`                 | Warmer opening class and serif emphasis using existing wording                                                                            |
| `src/pages/contact.astro`               | Call introduction → estimate form → basic context in source order; context remains alongside the form on larger screens                   |
| `src/pages/404.astro`                   | Warm recovery-section class                                                                                                               |
| `src/components/ContactCTA.astro`       | Navy primary and outline secondary buttons on canvas; removes the brass button fill                                                       |
| `src/components/Footer.astro`           | Existing Hebrews excerpt moved above brand/location/navigation; warranty conditional preserved                                            |
| `src/components/PhotoPlaceholder.astro` | Removes the illustrative picture-outline decoration; honest pending-photo text remains                                                    |
| `src/components/Expectations.astro`     | Removes repeated decorative rule elements; approval-aware selector unchanged                                                              |
| `src/components/Owner.astro`            | Preserves spacing when the optional heading break is suppressed; owner/photo conditions unchanged                                         |
| `src/components/RecentWork.astro`       | Responsive heading spacing and image source sizes for eventual larger portfolio spans; publication predicates unchanged                   |
| `README.md`                             | Current visual-system description and report link                                                                                         |
| `docs/V3-VISUAL-REFINEMENT-REPORT.md`   | This report                                                                                                                               |

Local QA outputs are in `artifacts/v3/`, which remains excluded by the existing ignore rule and outside the public build. Header, Process, Reviews, ServiceArea, and InquiryForm gain their visual changes through the shared stylesheet; their markup/logic did not need changes.

## Palette and design tokens

| Token              | Color     | Role                                                                                              |
| ------------------ | --------- | ------------------------------------------------------------------------------------------------- |
| `--color-navy`     | `#17324D` | Major type, primary actions, single dark footer anchor                                            |
| `--color-canvas`   | `#F4F0E8` | Warm page/section surface                                                                         |
| `--color-cedar`    | `#8A5A3B` | Selected serif emphasis, owner-photo offset, small labels, active navigation, light-surface focus |
| `--color-sage`     | `#6C7A67` | Form boundaries, quiet local marks, photo-surface tint                                            |
| `--color-brass`    | `#B08D57` | Sparse decorative foundation rules and hero frame edge                                            |
| `--color-charcoal` | `#222A30` | Body text and primary-button hover                                                                |
| `--color-white`    | `#FCFBF8` | Light surface and button text                                                                     |

Canvas/white dominate; navy supplies weight. Cedar, sage, and brass have distinct, limited jobs rather than competing as section colors. The palette proportions are a design direction, not a measured pixel quota.

Semantic aliases cover background, surface, text, muted text, border, accent, secondary accent, dark section, photo surfaces, and dark-surface muted text/borders. Tints use centralized `color-mix()` expressions. Error red and its light surface are separate centralized accessibility/state tokens.

Other shared decisions include a 1,440px maximum container, 36rem reading measure, fluid gutters and section spacing, small/medium/large spacing values, serif/sans families, fluid heading scales, body/heading line heights, a 1px separator, 2px control radius, 52px primary controls, and 140ms transitions. There are no drop shadows or motion libraries.

## Typography and editorial layouts

Manrope remains the utility and body face. Source Serif 4 carries major headings, service names, Grant's attribution, eventual quotations, and the invitation/footer excerpt. Serif statements use a restrained weight of 450; utility emphasis generally uses 650. No font package, file, or remote font request was added.

Fluid sizing, balanced headings, paragraph wrapping, and narrower body measures replace decorative clutter. Phone hero and Work headings retain readable two-line statements. Tablet hero copy sits below the full heading beside the photo area, avoiding a squeezed desktop arrangement.

| Area              | Final treatment                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Home services     | Numbered two-column index with horizontal separators; no enclosing column boxes; one column on phones                            |
| Detailed services | Quiet numerals, serif service titles, explanatory copy, and simple supporting lists; preparation note uses one sage edge         |
| Expectations      | Section introduction alongside four ruled text items; two columns at medium sizes, a simple list on phones                       |
| Process           | Five stages on a shared desktop baseline; aligned horizontal rows on tablet; number/title/body sequence on phones                |
| Reviews           | Larger serif quotations, small attribution/source metadata when approved; current pending explanation remains honest and unboxed |
| Inquiry form      | Removes the enclosing panel border and padded card; retains clear input boundaries and a visible preview notice                  |
| Photography       | Simple square-edged fields; brass hero edge and modest cedar owner offset, with no faux photographs or image illustrations       |

The 2px foundation motif appears selectively at the hero location label, Services/About opening, and footer. Other separators are ordinary structural rules.

## Page-specific composition

- **Home:** Large existing brand statement, cedar italic second line, offset future project photo, direct call/estimate actions, and a restrained local-owner note. Work and owner sections share canvas without a colored band at every boundary.
- **Services:** A small left-hand section label introduces the larger service-guide headline. The service index is the main visual structure.
- **Work:** Broad white opening, supporting description set to the side, a quieter secondary heading, and a larger photo field. Future approved projects have a wider lead image and staggered supporting spans. Image source sizes were updated for those spans.
- **About:** A narrower canvas composition, cedar serif emphasis, modest owner photograph area, and a single story break. Both story TODOs remain. The owner layout allows longer approved copy without a fixed-height text box.
- **Contact:** Direct opening and prominent phone link. On phones the estimate form follows the call introduction before the basic geographic/owner context. The form retains its existing controls, labels, help text, validation, privacy notice, and safe preview behavior.
- **404:** A clear warm recovery message and two existing destination links, using the same typography and footer.

The footer is the **one primary navy moment on every page**. Its existing Hebrews 12:28 excerpt precedes brand, location, navigation, and contact details. The final CTA uses canvas so it does not create a competing dark section. No verse or religious decoration was added.

Approved project imagery is prepared for 4:3 and 3:2 treatments; the owner image remains modest at roughly 40% of its two-column composition. Actual photo selection and crop review must wait for authentic approved files. Current browser QA covers the honest empty states; no fake portfolio fixtures were introduced.

## Accessibility and contrast

Measured WCAG contrast ratios, rounded to two decimals:

| Combination                       |   Ratio |
| --------------------------------- | ------: |
| Charcoal text / soft white        | 14.07:1 |
| Muted text / soft white           |  6.60:1 |
| Muted text / canvas               |  6.01:1 |
| Muted text / project placeholder  |  5.25:1 |
| Cedar labels / canvas             |  5.12:1 |
| Footer muted text / navy          |  7.65:1 |
| Canvas text or focus / navy       | 11.55:1 |
| Sage input border / soft white    |  4.40:1 |
| Sage file-button border / canvas  |  4.00:1 |
| Cedar focus / soft white          |  5.63:1 |
| Cedar focus / canvas              |  5.12:1 |
| Cedar focus / form-result surface |  4.48:1 |
| Error text / error surface        |  7.29:1 |

Brass on soft white measured 2.99:1, so the active navigation indicator was changed to cedar (5.63:1). Brass remains decorative, never ordinary small body text or the only interactive state cue.

Existing semantic landmarks and one H1 per page remain. The skip link becomes visible with a clear cedar outline and moves focus to `main`. Native menu disclosure works by keyboard, exposes the navigation, and retains the current-page state. Light controls use visible cedar focus; footer and dark mobile actions use an inset canvas outline. Main controls remain 44px or taller, with 52px inputs/buttons and 60px mobile actions. Existing reduced-motion handling now disables the short CSS transitions as well.

The form was checked with an empty request and synthetic local-only details: the error summary receives focus, individual error links remain visible, valid preview feedback receives focus, changing contact method updates required fields, editing hides stale feedback, and reset clears values/messages and restores email requirements. No request or photo was sent. This is an AA-oriented visual/interaction check in the bundled Chromium browser, not a separate physical-device or screen-reader certification.

## Responsive QA and screenshots

Every page was scrolled and visually inspected at all five requested widths, including the hero, image frames, numbered services, owner section, expectations, process, CTA, footer, and contact controls.

| Page     | 375  | 430  | 768  | 1440 | 1920 |
| -------- | ---- | ---- | ---- | ---- | ---- |
| Home     | Pass | Pass | Pass | Pass | Pass |
| Services | Pass | Pass | Pass | Pass | Pass |
| Work     | Pass | Pass | Pass | Pass | Pass |
| About    | Pass | Pass | Pass | Pass | Pass |
| Contact  | Pass | Pass | Pass | Pass | Pass |
| 404      | Pass | Pass | Pass | Pass | Pass |

All 30 final checks have the requested viewport width, one H1, no document horizontal overflow, and no placeholder extending beyond its parent. Fixed mobile actions leave scroll padding for fields/messages and footer content.

Issues found and corrected during the review:

1. Phone hero type wrapped “Careful painting” unnecessarily; its mobile scale was adjusted.
2. Placeholder aspect ratio/minimum height could enlarge its width; explicit width containment now preserves the frame.
3. Tablet grid minimum sizes caused hero overflow and a text/photo collision; zero-minimum grid tracks and a separate photo row resolve it.
4. Suppressed line breaks joined a few heading words; explicit whitespace now survives each presentation.
5. Heading measures left isolated words on the home service heading, About introduction, and phone Work title; those measures/compositions were corrected.
6. The low-contrast active navigation line was replaced with cedar.

Screenshot organization:

- `artifacts/v3/{page}-{width}.jpg`: 30 opening screenshots.
- `artifacts/v3/{page}-{width}-{tile}.jpg`: original viewport captures through each page.
- `artifacts/v3/{page}-{width}-page.jpg`: assembled scrolling reference.
- `artifacts/v3/{page}-{width}-review-{part}.jpg`: compact review sheets, read down each column then across.
- `responsive-checks.json` and `review-index.json`: dimensions, bounds checks, and capture positions.
- Separate skip-link, mobile-menu, form-error, preview-result, and footer-focus screenshots.

The browser's native full-page stitching produced duplicated sections, so review sheets were assembled from actual scrolled viewport captures using the existing image dependency. Original viewport files are the authoritative images; assembled references can retain small capture seams/scrollbars. No screenshot dependency was installed.

Representative captures: [Home desktop](../artifacts/v3/home-1440.jpg), [Home tablet](../artifacts/v3/home-768.jpg), [Home phone](../artifacts/v3/home-375.jpg), [About](../artifacts/v3/about-1440.jpg), [Contact](../artifacts/v3/contact-375.jpg).

## Engineering and performance verification

| Check                                      | Result                                                                                                                           |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `npm run format`                           | Passed                                                                                                                           |
| `npm run format:check`                     | Passed                                                                                                                           |
| `npm run lint`                             | Passed                                                                                                                           |
| `npm run typecheck`                        | 38 files; zero errors, warnings, or hints                                                                                        |
| `npm test`                                 | All 14 existing tests passed                                                                                                     |
| `npm run build` via the Sites build helper | Six HTML pages plus the existing robots/sitemap output                                                                           |
| `npm run verify:build`                     | Passed: 142 link/asset checks, six image uses, five sitemap routes, metadata/schema/indexing and forbidden-public-content checks |
| Independent final source audit             | No actionable findings; 25 protected files unchanged and all 17 TODO markers retained                                            |

The generated-output checks reject the pending V2 warranty, alternate contract name/geography, unapproved practice statements, unanswered FAQs, internal approval markers, TODOs, credential patterns, and legacy/fabricated claims. They pass with the final visual build.

Client JavaScript remains **5,356 bytes, byte-for-byte identical to V2**, loaded only on Contact. Font files remain unchanged at 253,492 bytes. No framework hydration, tracker, animation library, UI library, or icon package was added.

Emitted CSS, including existing font declarations, changed from 31,485 to 39,174 bytes. The local gzip comparison is 9,275 → 10,444 bytes, an increase of 1,169 bytes for the richer responsive presentation. The logo asset and current image request count are unchanged. Screenshot artifacts are not part of `dist`.

## Grant's remaining decisions

Grant should review this visual direction before a separately authorized launch: palette, cedar italic emphasis, photo framing, and the more prominent but singular footer excerpt. This local refinement is complete; that future review has not been treated as approval to publish.

The public/legal business-name decision remains separate from visual styling. The original logo and current public name are preserved until Grant chooses the names. Real hero/project images, owner photograph/crop, stories, and permission-cleared reviews remain the largest pending contributions to the finished identity.

All existing markers remain unresolved:

| Marker                                   | Required owner/content decision                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `TODO_GRANT_LEGAL_BUSINESS_NAME`         | Confirm the legal entity name separately from public branding                           |
| `TODO_GRANT_PUBLIC_BUSINESS_NAME`        | Choose the public name and then align existing logo, footer, and metadata               |
| `TODO_GRANT_OWNER_STORY`                 | Supply and approve Grant's own story                                                    |
| `TODO_GRANT_NAME_STORY`                  | Approve the fuller story behind the name                                                |
| `TODO_GRANT_PROJECT_PHOTO`               | Supply authentic project photographs and permitted publication details                  |
| `TODO_GRANT_REVIEW`                      | Supply verified independent feedback                                                    |
| `TODO_GRANT_REVIEW_PERMISSION`           | Confirm publication and permitted attribution                                           |
| `TODO_GRANT_SERVICE_AREA_CITIES`         | Confirm any city list                                                                   |
| `TODO_GRANT_SERVICE_AREA_POSITIONING`    | Resolve Cambridge-centered versus broader metro wording                                 |
| `TODO_GRANT_WARRANTY_TERMS`              | Confirm current standard labor-warranty terms and public wording                        |
| `TODO_GRANT_EXPECTATIONS_APPROVAL`       | Confirm proposed protection/scope/change practices before replacing the existing values |
| `TODO_GRANT_FAQ_ANSWERS`                 | Supply and approve answers before any FAQ is rendered                                   |
| `TODO_GRANT_BUSINESS_EMAIL`              | Provision and verify the intended mailbox before display/use                            |
| `TODO_GRANT_BUSINESS_HOURS_CONFIRMATION` | Confirm public hours without inferring them from a past project                         |
| `TODO_GRANT_SOCIAL_LINKS`                | Confirm official profiles                                                               |
| `TODO_GRANT_OWNER_PHOTO`                 | Supply and approve an authentic owner photograph                                        |
| `TODO_GRANT_PHONE_CONFIRMATION`          | Confirm the current published phone number with Grant                                   |

The existing unmarked text-contact decision also remains unresolved. Inquiry backend/privacy/retention readiness and launch authorization remain separate work, as documented in V1/V2 and the inquiry endpoint contract. No marker was removed or resolved by assumption.

Work stops at this verified local build. Production remains unchanged.
