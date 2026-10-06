# Authentic project photographs

Add only photographs of work actually completed by Unshaken, with permission to publish. The six photographs in `deck-transformation/` were supplied with explicit confirmation that they are real Unshaken Painting project photographs and may be presented as actual work. This authorization covers the Deck Transformation portfolio feature and homepage teaser.

Import local images into `src/data/projects.ts`. Every photo needs truthful alt text, `authenticity: 'verified-original'`, and `permissionConfirmed: true`. Set the project’s `publicationApproved` only with authorization to publish the project and photographs. Omit unconfirmed metadata: the deck record does not claim a location, date, customer, exact service, materials, or methods. Do not publish a precise residential address or identifying personal details without permission.

Astro generates local responsive WebP images with dimensions; project images load lazily, while an approved hero image loads eagerly. The first approved photo from an approved project becomes the homepage visual. Data supports ordered before/after comparisons, galleries, optional location/service/date metadata, review references, and longer project-story fields. Both photographs in a comparison must pass the authenticity and publication-permission checks. Individual project routes are intentionally deferred until real stories exist.

## Deck Transformation sources

The original JPEG files were moved from `public/` into `deck-transformation/` without changing their bytes, so visitors receive optimized assets rather than the full phone originals. The six sources total 48,149,859 bytes. Each stores 5712 × 4284 pixels with EXIF orientation 6, giving an upright portrait size of 4284 × 5712 pixels. Keep orientation handling in the Astro image pipeline.

| View                       | Before          | After           |
| -------------------------- | --------------- | --------------- |
| Front / exterior (primary) | `IMG_1697.jpeg` | `IMG_1701.jpeg` |
| Side / underside           | `IMG_1698.jpeg` | `IMG_1702.jpeg` |
| Deck surface / top         | `IMG_1700.jpeg` | `IMG_1703.jpeg` |

Each pair shares one stable display area, with independent before/after crop positions in `src/data/projects.ts`. The exterior retains a 4:3 frame with positions `50% 38%` / `50% 32%`; a fixed 1.04× uniform zoom and −1.25% horizontal offset on the after image bring the central railing and door closer together without distortion. The underside uses a square frame with positions `50% 60%` / `50% 25%` to retain the upper railing, joists, and support post. The surface uses a square frame with positions `50% 70%` / `50% 52%` to show the floorboards and railing with less empty sky. Slider movement only clips the before image; it never changes either photograph’s dimensions or crop.

Visual review confirms the original pairing and before/after order: the exterior shares the railing, support post, brick wall, door, and downspout; the underside shares the joists, post, and patio; the surface shares the railing corner and background shed. Camera position and perspective differ, especially for the underside and surface pairs. Captions disclose the remaining mismatch; no rotation, perspective warp, replacement photograph, or source-file edit is used to imply an exact match.

## Optional customer permission — future process

Recommend asking for separate, optional permission for taking completed-project photographs, using approved images on the website, using them on specified social channels, and publishing a testimonial. Permission to photograph a project does not itself permit portfolio publication. Permission for one channel does not imply permission for another, and a painting agreement does not establish any of these permissions.

Record the permitted attribution separately: anonymous, first name, first name plus last initial, full name, or full name and photo. Collect photo-specific permission before using a customer profile image. Let customers decline promotional use without tying it to the painting work. Keep the consent record and any customer identity details outside public site content.

This recommends a future optional process; it is not a legal consent form, contractual language, or evidence that any customer has agreed. Grant must approve that process before it is used. No consent has been inferred from the representative contract. Existing project/image publication and review verification/privacy gates remain unchanged.
