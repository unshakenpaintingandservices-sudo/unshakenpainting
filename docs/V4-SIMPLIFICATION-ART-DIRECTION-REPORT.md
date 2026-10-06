# V4 — Simplification and art direction

Verified locally on September 10, 2026. V4 refines the existing Astro application. No deployment, DNS/AWS changes, email delivery, launch-flag changes, new dependencies, or new network behavior.

## Result

Home now has five movements: Hero, What Grant Paints, Recent Work, Meet Grant, and the final invitation. Its main text falls from 559 to 120 words. At 1440px the complete page is 52% shorter; at 375px it is 60% shorter. The four Home service-card articles are gone.

The Unshaken Mark System introduces restrained vector paint edges, paired foundation lines, small color studies, one oversized pale form, and a faint CSS surface texture. These replace repeated content and rules. The existing palette, fonts, original logo, and Navy footer remain.

## Content audit before styling

The five pages and shared components were inspected together before styling changes. The V3 baseline was saved before implementation, with a separate independent audit of protected files and page content.

| Page     | V3 main content                                                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home     | Hero, trust strip, four service articles, full recent-work empty state, full Owner, Expectations, Process, pending Reviews, ServiceArea, final CTA |
| Services | Opening, full service scope and preparation note, Process, final CTA                                                                               |
| Work     | Opening, repeated recent-work heading/empty state, final CTA                                                                                       |
| About    | Opening, same full Owner as Home, owner/name story reservations, same Expectations as Home, final CTA                                              |
| Contact  | Opening, phone instructions, form, repeated service-area context, owner signature                                                                  |

The footer also repeated service categories and owner-involvement copy on every page. Navigation, phone access, Cambridge location, and the restrained Hebrews reference remain intentional shared content.

## Consolidation and primary ownership

| Subject                                                                                | Primary home in V4      | Treatment elsewhere                                                                                                                                                      |
| -------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Service scope, residential/commercial/new construction/repaints, specialty preparation | Services                | Four Home labels, one sentence, one Services link                                                                                                                        |
| Five-step project process                                                              | Services                | Removed from Home; no full process elsewhere                                                                                                                             |
| Grant, personal involvement, relationships and referrals                               | About                   | Home has a short owner teaser and About link                                                                                                                             |
| Owner story, name meaning, faith connection                                            | About                   | Pending stories retain their existing reservations; Hebrews stays in the footer                                                                                          |
| Values and approved expectations                                                       | About                   | Full Home grid removed; existing approval selector preserved                                                                                                             |
| Authentic projects and future project stories                                          | Work                    | Home has a brief preview and Work link                                                                                                                                   |
| Verified future customer testimony                                                     | Work                    | Rendered only when `publishedReviews` contains eligible reviews; no empty Home review block                                                                              |
| Contact instructions and service-area context                                          | Contact                 | Other pages retain only short location references and relevant contact links                                                                                             |
| Future FAQs and approved warranty explanation                                          | Services responsibility | Existing pending FAQ data and warranty approval gates remain unchanged; no answers or terms have been supplied. The footer's gated short warranty reference is preserved |

Removed from Home: the trust strip, full Expectations, Process, pending Reviews, and ServiceArea. The service catalog was replaced with four labels; the repeated Work empty state became one sentence; the full Owner treatment became a short introduction.

Removed across other pages: Work's second introduction and marketing paragraphs, full closing CTA blocks on Services/Work/About, About's repeated service/area business description, Contact's owner signature and longer phone/area copy, and repeated selling copy in the footer. Duplication was removed by assigning ownership rather than paraphrasing full sections.

## Counts and CTA audit

Counts compare generated V3 and V4 HTML. Main words count normalized text inside `main`, excluding scripts/styles and including placeholder/form labels. Shared navigation/footer text is excluded.

| Page     | Main sections V3 → V4 | Main words V3 → V4 | Contact CTA blocks V3 → V4 | Main phone/contact links V3 → V4 |
| -------- | --------------------: | -----------------: | -------------------------: | -------------------------------: |
| Home     |                 9 → 5 |          559 → 120 |                      1 → 1 |                            5 → 4 |
| Services |                 4 → 3 |          310 → 283 |                      1 → 0 |                            2 → 1 |
| Work     |                 3 → 2 |           137 → 18 |                      1 → 0 |                            3 → 0 |
| About    |                 5 → 4 |          260 → 202 |                      1 → 0 |                            2 → 1 |
| Contact  |                 2 → 2 |          273 → 224 |                      0 → 0 |                            1 → 1 |

V3 Home's separate trust-strip `div` made ten visual movements; V4 has five. The final CTA count refers to the dedicated `.contact-cta` component; Home also retains its two hero actions.

Home card-class articles: **4 → 0**. These were editorial `.service-card` articles with top rules, not four fully enclosed boxes. The repeated four values items and five process items are also absent from Home. Photo placeholders fall from three to two on Home. The About values lose their individual top borders. No shadows or new boxed card system were added.

Home now has one Services link, one Work link, and one About link. Services and About each have one contextual contact link. Work relies on the shared header/footer while photography is pending. Header controls, footer navigation/phone, and the existing mobile call/estimate bar are preserved.

Raw full-document phone/contact-link counts are Home 14 → 13, Services 11 → 10, Work 12 → 9, About 11 → 10, Contact 10 → 10. Each includes nine shared DOM links, including mutually hidden desktop/mobile controls. These are not counts of simultaneously visible conversion prompts.

## The Unshaken Mark System

The only new artwork component is [`src/components/Mark.astro`](../src/components/Mark.astro), with three inline SVG variants and six simple paths in its source. Placement, foundation marks, and texture live in [`src/styles/global.css`](../src/styles/global.css). There are no external decorative asset requests.

| Element           | Use and restraint                                                                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Painted edge      | Two sitewide uses: Cedar behind the Home hero image and Sage behind the full About owner portrait. Broad rectangles with small edge deviations; no brush illustration or image masking                         |
| Foundation        | Two slightly unequal CSS rules, with a subtle clipped edge on the upper rule. Used in Home and Work openings and the existing footer reflection                                                                |
| Color study       | Four unequal Navy/Cedar/Sage/Brass strips. Three placements: Services opening, Work opening, and a smaller Contact mark. Decorative, unlabeled, noninteractive                                                 |
| Oversized form    | One pale Sage-derived SVG on Work, clipped by its opening section and extending beyond the right edge. Hidden on mobile                                                                                        |
| Surface texture   | One area only: Home hero. A tiny CSS radial-dot pattern using Charcoal mixed with transparency, reduced again to 0.45 opacity. No raster asset                                                                 |
| Image composition | Rectangular future project imagery, 4:3 and 3:2 gallery crops, modest asymmetry and captions. Home has an offset Cedar edge plus Brass hairline. The brief owner image is smaller than the full About portrait |

Palette unchanged: Navy `#17324D`, Canvas `#F4F0E8`, Cedar `#8A5A3B`, Sage `#6C7A67`, Brass `#B08D57`, Charcoal `#222A30`, White `#FCFBF8`. Source Serif 4 and Manrope remain locally bundled.

The Home Navy CTA and Navy footer form one continuous closing area. A quiet separator distinguishes the invitation from the Hebrews reflection. The footer gains no new illustration.

## Component changes

- `Owner.astro`: a compact Home variant with two short paragraphs, a smaller image, and one About link. Full supported owner/relationship copy stays on About; the existing portrait approval check remains.
- `RecentWork.astro`: brief Home heading/link and one pending sentence; Work has one photo placeholder without a second introduction. Approved project/photo filtering remains. Future project titles use H2 on Work and H3 under Home's H2.
- `PhotoPlaceholder.astro`: concise, explicitly pending labels and quieter typography; no fabricated portrait or project image.
- `ContactCTA.astro`: one heading and two actions, used only on Home.
- `Footer.astro`: repeated service and owner selling copy removed; name, navigation, Cambridge, phone, optional email/warranty gate, and Hebrews preserved.
- Five page templates now compose only their owned content. Shared inquiry markup, delivery scripts, data models, metadata, navigation behavior, and architecture are unchanged.
- The stylesheet is consolidated around the new composition rather than layering decorations over the former Home grids.

The empty project/review collections are still empty. Future project data still supports title, location, scope, before/after/gallery assets, and story fields. No invented sample records were introduced to exercise the design.

## Responsive review and comparison

All six pages—Home, Services, Work, About, Contact, and 404—were captured and visually reviewed at **375, 430, 768, 1440, and 1920px**. All 30 combinations have one H1, no horizontal page overflow, and no photo-placeholder overflow.

| Width | V3 Home height | V4 Home height | Reduction |
| ----- | -------------: | -------------: | --------: |
| 375   |        8,223px |        3,250px |     60.5% |
| 430   |        7,956px |        3,255px |     59.1% |
| 768   |        5,681px |        2,433px |     57.2% |
| 1440  |        5,915px |        2,865px |     51.6% |
| 1920  |        6,009px |        2,902px |     51.7% |

Heights include header/footer and the mobile action bar allowance. The 375px hero is approximately 639px high, excluding its header; the two actions remain adjacent and the image uses a shorter 3:2 space.

Mobile decisions: shorter painted offsets and foundation rules; Work's large form hidden; smaller studies; stacked service labels without a dividing border; source-order phone/form/area flow; smaller Home portrait; no desktop overlap forced onto body copy. At 768px the hero headline spans both columns above the body and image. Large screens retain a maximum content width.

The Home anti-clutter review at 1440px and mobile found five clearly identifiable ideas, one or two dominant elements per movement, and no full repeated downstream section. The most useful further deletion during QA was the extra phrase and oversized typography inside the project placeholder, so the actual hero statement remains dominant.

Local screenshot evidence:

- [V3/V4 Home comparison, 1440px](../artifacts/v4/home-v3-v4-1440.jpg)
- [V3/V4 Home comparison, 375px](../artifacts/v4/home-v3-v4-375.jpg)
- [V4 Home opening, 1440px](../artifacts/v4/home-1440.jpg)
- [V4 Home opening, 375px](../artifacts/v4/home-375.jpg)
- [All responsive measurements](../artifacts/v4/responsive-checks.json)
- [Full-page review index](../artifacts/v4/review-index.json)

The existing browser viewport-tile workflow was reused: 91 viewport tiles, 30 opening images, 30 assembled page views, and review sheets. Fonts were awaited and actual scroll positions recorded. Compositions account for screenshot raster scaling and the mobile bar. The native full-page capture was avoided because its stitching was unreliable in V3. Fine seams in assembled mobile reviews can come from the fixed-bar boundary; original viewport tiles are the authoritative captures.

## Accessibility and interactions

Decorative SVGs have `aria-hidden="true"`, `focusable="false"`, and `pointer-events: none`. Marks carry no required information. Text remains outside the full-strength painted areas. Forced-colors CSS hides SVG art, foundation marks, texture, and offset rules and gives photo placeholders a system-color boundary. Forced-colors handling was inspected in source; no claim of OS-level high-contrast emulation is made.

No animation was added. Existing reduced-motion behavior remains. Navy CTA links have a clearly visible Canvas keyboard outline; controls and body text retain the established contrast colors. The existing labels, live regions, error summary, form semantics, and skip link remain.

Browser checks passed at mobile width:

- Menu opens by Enter; its About link navigates and the new page has a closed menu.
- Skip link is visible on Tab and moves focus to `main` on Enter.
- Empty form exposes five field-specific errors and focuses the error summary.
- Switching to a phone call makes phone required and email optional.
- Valid local-only input shows the explicit no-send/no-save preview result and focuses it.
- Clear form empties the inputs and hides both result and errors.
- Navy estimate action receives a 3px Canvas focus outline.

No test inquiry was delivered. The existing preview transport test also confirms that preview mode never calls its network transport.

## Performance and regression results

| Output                                           |            V3 |                          V4 |
| ------------------------------------------------ | ------------: | --------------------------: |
| Client JavaScript                                |   5,356 bytes | 5,356 bytes, byte-identical |
| Client JavaScript gzip                           |   2,382 bytes |                 2,382 bytes |
| Emitted CSS, including bundled font declarations |  39,174 bytes |                39,324 bytes |
| CSS gzip, measured with the same current runtime |  10,481 bytes |                10,788 bytes |
| WOFF2 font files                                 | 253,492 bytes |               253,492 bytes |

The art and responsive changes add 150 uncompressed CSS bytes overall, after removal of obsolete styling. Inline SVG adds a small amount of static HTML. No illustration library, runtime animation, canvas, WebGL, raster decoration, or new client script was added. Only Contact has executable client JavaScript.

Passed: `npm run format`, `npm run format:check`, `npm run lint`, `npm run typecheck` (39 files, zero errors/warnings/hints), all 14 established tests, production build, and `npm run verify:build`.

The final static build contains six HTML pages. Verification checked five sitemap routes, 135 links, six real image uses, metadata, local assets, anchors, structured data, preview indexing, forbidden/pending claims, and credential patterns. The existing logo is still the only published raster image asset.

Independent final audit: all 25 protected-file hashes match V3, all 17 TODO markers remain, all publication/privacy/indexing gates remain intact, and no actionable findings remain. The future Work project heading issue found during review was corrected before the final build.

## Remaining owner decisions

All unresolved markers remain untouched in source:

- `TODO_GRANT_LEGAL_BUSINESS_NAME`
- `TODO_GRANT_PUBLIC_BUSINESS_NAME`
- `TODO_GRANT_OWNER_STORY`
- `TODO_GRANT_NAME_STORY`
- `TODO_GRANT_PROJECT_PHOTO`
- `TODO_GRANT_REVIEW`
- `TODO_GRANT_REVIEW_PERMISSION`
- `TODO_GRANT_SERVICE_AREA_CITIES`
- `TODO_GRANT_SERVICE_AREA_POSITIONING`
- `TODO_GRANT_WARRANTY_TERMS`
- `TODO_GRANT_EXPECTATIONS_APPROVAL`
- `TODO_GRANT_FAQ_ANSWERS`
- `TODO_GRANT_BUSINESS_EMAIL`
- `TODO_GRANT_BUSINESS_HOURS_CONFIRMATION`
- `TODO_GRANT_SOCIAL_LINKS`
- `TODO_GRANT_OWNER_PHOTO`
- `TODO_GRANT_PHONE_CONFIRMATION`

The separate text-message availability decision also remains pending/disabled. No legal/public name, photograph, testimonial, warranty, story, FAQ answer, geography claim, email, hours, social account, or phone confirmation was inferred from the art-direction work. Default noindex/nofollow, robots exclusion, and inquiry delivery-off safeguards are unchanged.

## Five purposeful pages?

Yes. Home introduces; Services explains the work and hiring sequence; Work reserves attention for real projects; About explains the person and meaning; Contact enables a conversation. The common palette and mark family connect the pages without making their content or composition identical. Authentic photography and Grant's approved stories remain the main limits on how personal and complete the site can feel.

V4 is complete and verified locally. No deployment was performed.
