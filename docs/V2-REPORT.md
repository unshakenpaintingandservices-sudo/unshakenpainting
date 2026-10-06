# Version 2 — content and trust preparation

This is a preparation pass on the existing Astro/TypeScript Version 1. No deployment, DNS, AWS infrastructure, production, or email-delivery changes were made. The supplied summary of one representative July 2026 contract is supporting evidence, not approval to make its terms universal public promises.

## Highest-priority decision: business name

**Grant must resolve the legal name and the public brand separately.**

| Evidence / option             | Name                              | Current treatment                                                            |
| ----------------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| V1 website                    | Unshaken Painting and Services    | Preserved in public copy and metadata                                        |
| Representative contract       | Unshaken Painting and Contracting | Recorded here only; not adopted as the legal or public name                  |
| Possible simpler public brand | Unshaken Painting                 | Already used as V1's short name; not treated as a newly approved replacement |

- `TODO_GRANT_LEGAL_BUSINESS_NAME`: added a nullable, unpublished `business.legalName`; a heading on one contract does not establish the legal entity name.
- `TODO_GRANT_PUBLIC_BUSINESS_NAME`: retained the current `business.name` until Grant explicitly chooses the public brand.

Once Grant decides, update the centralized names, metadata/schema, footer wording, and any affected logo asset together. The footer's existing “Painting and Services” wordmark and the lettering in the existing logo are identified update points, not silently renamed in V2.

## Files changed

| File                                | Change                                                                                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/business.ts`              | Legal/public-name TODOs; second phone source without confirmation; geographic-positioning TODO/context; unpublished labor-warranty candidate and optional details URL |
| `src/data/services.ts`              | Four proposed expectations with explicit approval states and a selector that preserves the four V1 items until the complete replacement is supported                  |
| `src/components/Expectations.astro` | Uses the approval-aware selector; no additional homepage copy                                                                                                         |
| `src/components/Footer.astro`       | Preserves the warranty approval gate; an eventually approved warranty can appear with or without a details link                                                       |
| `src/data/faqs.ts`                  | Six pending questions, no answers, and an approval/answer selector; no new public section or route                                                                    |
| `src/assets/projects/README.md`     | Recommends future separate, optional customer permissions for photography, portfolio channels, testimonials, and attribution                                          |
| `tests/content-approval.test.ts`    | Three focused tests for pending/partial approval, supported expectation replacements, and blank/unapproved FAQ answers                                                |
| `scripts/verify-build.mjs`          | Adds regression checks against publishing the pending warranty, contract brand/geography, proposed practices, unanswered questions, or internal preparation markers   |
| `README.md`                         | Links to this V2 report                                                                                                                                               |
| `docs/V2-REPORT.md`                 | This report and the remaining approval decisions                                                                                                                      |

Dependencies, lockfile, routes, static output strategy, layouts/styles, responsive behavior, project/image publication gates, review privacy gates, inquiry security/delivery code, and existing unit tests are preserved. The existing V1 report remains a historical record; this report describes the current preparation state.

## Content architecture and contract-derived facts awaiting confirmation

### Warranty remains unpublished

`TODO_GRANT_WARRANTY_TERMS` now records that the representative July 2026 agreement used a one-year **labor** warranty, excluding damage caused by moisture, structural movement, or misuse. Grant must confirm whether these remain his current standard terms, and approve the exact public policy, before publication.

The future trust label is prepared as `1-Year Labor Warranty`, with `approved: false`. The details link is optional. The existing footer gate suppresses both the label and link while approval is false. No warranty policy route, exclusions, or broader satisfaction promise is rendered. The build verifier explicitly rejects the pending label and terms in public output.

### Concrete expectations, without extra homepage copy

`TODO_GRANT_EXPECTATIONS_APPROVAL` covers the three contract-derived proposals:

| Proposed item                                                                      | Basis                                   | Approval state                                      |
| ---------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------- |
| Respect for the work area: protect surrounding surfaces before applicable painting | Representative project agreement        | Pending Grant's confirmation as a standard practice |
| Clear scope: written agreement defines the work                                    | Representative project agreement        | Pending Grant's confirmation as a standard practice |
| Changes discussed first: document scope changes before additional work             | Representative project agreement        | Pending Grant's confirmation as a standard practice |
| Owner involvement from estimate through final walkthrough                          | Owner interview already supplied for V1 | Supported by the interview                          |

The selector preserves V1's four public values unless a complete four-item replacement is supported. It returns only title/text, not internal approval metadata. A partially approved or empty replacement cannot alter the public section. Grant's involvement continues to appear elsewhere in the existing copy. None of the first three proposals is newly presented as a universal promise in V2.

### FAQ readiness only

`TODO_GRANT_FAQ_ANSWERS` tracks these questions, all with `answer: null` and `ownerApproved: false`:

1. Do I need to buy the paint?
2. What should I move before painting begins?
3. Do you warranty your work?
4. What happens if the project scope changes?
5. Do you work on residential and commercial properties?
6. What areas do you serve?

The selector requires explicit approval and a nonblank answer. No component imports or renders these records yet. The recommended future location is a small section on **Services**, after the service/scope content and before Process; Contact can link to it if useful. Once approved answers exist, use a short selection of native disclosure items rather than creating a large FAQ page or adding more homepage copy. The warranty FAQ must also wait for the warranty-policy decision. Existing service/area answers should remain consistent with the approved interview and the final positioning decision.

The representative agreement said the contractor normally supplied paint, primers, and materials unless otherwise agreed. It also specified scope-change approval in writing, a payment schedule, and Monday–Friday work for that project. These are notes for Grant's review only. No material-supply promise, payment policy, or public business hours have been inferred. The customer's actual payment figures and schedule details were not provided in the summary or imported.

### Services and geographic positioning

The contract summary mentions ceiling preparation, repairing divots/imperfections, protection with paper/plastic, texturing, and painting ceilings, walls, cabinets, and trim. Those are examples from one project. Existing interview-supported service copy is retained; the example is not exposed as a new portfolio project or a broader contracting claim.

`TODO_GRANT_SERVICE_AREA_CITIES` remains unresolved. New `TODO_GRANT_SERVICE_AREA_POSITIONING` records the difference between the contract's “Twin Cities & North Metro” wording and the interview's Cambridge-centered preference. **Cambridge, Minnesota remains the customer-facing base**, with the existing approximate 50-mile regional description. No city list, refusal boundary, or doorway pages were added.

### Phone and other operational decisions

The existing website settings and the representative contract summary both give `(763) 336-5174`. That corroborates the number; it does not constitute Grant's explicit approval for current website publication. `TODO_GRANT_PHONE_CONFIRMATION` remains in place. The existing public call links are unchanged.

The sample project's weekday schedule does not resolve `TODO_GRANT_BUSINESS_HOURS_CONFIRMATION`. `TODO_GRANT_BUSINESS_EMAIL` remains unresolved; no mailbox was provisioned or displayed. The preview inquiry flags are unchanged:

```dotenv
PUBLIC_INQUIRY_MODE=preview
PUBLIC_SITE_LAUNCH_READY=false
PUBLIC_INQUIRY_ENDPOINT=
```

No CRM, email server, consent form, or new legal contract was created.

## Optional photography and testimonial consent

The project-photo guidance recommends a future optional process with separate decisions for taking completed-project photos, website portfolio use, specified social-channel use, testimonial publication, and permitted attribution. An agreement to painting work, permission to take photos, or permission for one promotional channel does not itself establish the other permissions. Customers should be able to decline promotional use independently of the painting work.

This is a process recommendation, not legal language or evidence of consent. No permissions were inferred from the sample agreement. Keep the underlying consent records and customer identities outside public website content. Existing `publicationApproved`, original-image/permission checks, review verification, attribution limits, and independent household/project selection remain unchanged.

## Verification and customer-data scope

| Check                                                                      | Result                                                                                                                                                                                   |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run format` and `npm run format:check`                                | Passed                                                                                                                                                                                   |
| `npm run lint`                                                             | Passed                                                                                                                                                                                   |
| `npm run typecheck`                                                        | Passed: 0 errors, 0 warnings, 0 hints across 38 checked files                                                                                                                            |
| `npm test`                                                                 | All 14 tests passed: 11 preserved V1 tests plus three approval-boundary tests                                                                                                            |
| Production build (`npm run build`, invoked through the Sites build helper) | Passed: existing six HTML pages including 404, plus robots/sitemap                                                                                                                       |
| `npm run verify:build`                                                     | Passed: 142 internal link/asset checks, six image uses, five sitemap routes, unique metadata, factual schema, preview indexing, credential/legacy checks, and new pending-content checks |
| Public-output comparison against the pre-edit V1 build                     | **Every generated public file is byte-for-byte identical**; no changed, added, or removed public output files                                                                            |
| Preserved-source comparison                                                | Dependency manifests/lockfile, page routes, layout, styles, inquiry implementation/configuration, project/review data and privacy gates, and the existing tests are unchanged            |
| Client JavaScript                                                          | Unchanged at 5,356 uncompressed bytes, Contact page only                                                                                                                                 |
| Independent read-only publication review                                   | No actionable findings                                                                                                                                                                   |

The output comparison confirms that V2 adds no visible contract-derived promises, warranty label/link, alternative business name, FAQ section, internal preparation data, or sample-customer information. Responsive and interaction code is unchanged, and the generated HTML/CSS/JavaScript is identical; new browser screenshots or a repeat visual redesign review were unnecessary for this preparation-only pass.

Only the non-customer summary in the supplied V2 brief was used. No customer-bearing contract file was opened, copied, parsed into a fixture, or added to the site. The summary supplies no customer's name, address, or contract amount, so an exact-value scan against those unseen details cannot be claimed. The output comparison, changed-file review, unchanged customer-data models/assets, and absence of copied contract material verify that **this V2 pass introduces no sample-customer names, address, amount, project record, testimonial, or snapshot**. The new tests use generic synthetic content only. No new browser screenshots or customer-containing snapshots were created.

## Remaining launch blockers

Resolve the legal/public-name conflict first. Then confirm the current phone and geographic positioning/city list; approve any standard warranty, work-area protection, written scope/change practices, materials responsibility, and FAQ wording. Obtain authentic project/owner photography and independent reviews with appropriate optional publication/attribution permissions. Complete the owner/name stories; decide on hours, text contact, and social profiles; provision and verify the intended mailbox separately; and approve/test the future secure inquiry delivery and privacy/retention handling before changing the launch flags.

All earlier content TODOs remain. Newly explicit preparation markers are `TODO_GRANT_LEGAL_BUSINESS_NAME`, `TODO_GRANT_PUBLIC_BUSINESS_NAME`, `TODO_GRANT_SERVICE_AREA_POSITIONING`, `TODO_GRANT_EXPECTATIONS_APPROVAL`, and `TODO_GRANT_FAQ_ANSWERS`.

Deployment remains a separate, explicitly authorized action.
