import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const pages = [
  'index.html',
  'services/index.html',
  'work/index.html',
  'about/index.html',
  'contact/index.html',
  '404.html',
];
const titles = new Set();
const descriptions = new Set();
const comparisonPairs = [
  ['IMG_1697', 'IMG_1701'],
  ['IMG_1698', 'IMG_1702'],
  ['IMG_1700', 'IMG_1703'],
];
const originalPhoto = /IMG_(?:1697|1698|1700|1701|1702|1703)\.jpe?g/i;
function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}
function imageStem(tag) {
  return attribute(tag, 'src')?.match(/IMG_\d+/)?.[0];
}
let checkedLinks = 0;
let checkedImages = 0;
let checkedImageCandidates = 0;
let checkedComparisons = 0;
const inlineClientScripts = new Set();
for (const file of pages) {
  const html = await readFile(path.join(root, file), 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${file}`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/name="description" content="([^"]+)"/)?.[1];
  assert.ok(title && description, `Missing metadata: ${file}`);
  assert.ok(
    !titles.has(title) && !descriptions.has(description),
    `Duplicate metadata: ${file}`,
  );
  titles.add(title);
  descriptions.add(description);
  assert.equal(
    (html.match(/<h1[\s>]/g) || []).length,
    1,
    `One H1 required: ${file}`,
  );
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /rel="canonical" href="https:\/\/unshakenpainting.com\//);
  assert.match(html, /property="og:title"/);
  const schema = JSON.parse(
    html.match(
      /<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/s,
    )?.[1] || '{}',
  );
  assert.equal(schema['@type'], 'HousePainter');
  assert.equal(schema.address.addressLocality, 'Cambridge');
  assert.equal(schema.telephone, '+17633365174');
  for (const match of html.matchAll(/href="([^"#]+)(?:#([^"]+))?"/g)) {
    const href = match[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const target = path.join(
      root,
      href.endsWith('/') ? `${href}index.html` : href,
    );
    assert.ok(
      (await stat(target)).isFile(),
      `Broken internal link ${href} in ${file}`,
    );
    if (match[2] && target.endsWith('.html'))
      assert.ok(
        (await readFile(target, 'utf8')).includes(`id="${match[2]}"`),
        `Missing anchor ${match[2]}`,
      );
    checkedLinks++;
  }
  for (const tag of html.matchAll(/<img\b[^>]*>/g)) {
    assert.ok(Number(attribute(tag[0], 'width')) > 0);
    assert.ok(Number(attribute(tag[0], 'height')) > 0);
    assert.match(tag[0], /\balt(?:="[^"]*")?(?=\s|>)/);
    const src = attribute(tag[0], 'src');
    assert.ok(src?.startsWith('/'), 'Image must be local');
    assert.ok((await stat(path.join(root, src))).isFile());
    assert.doesNotMatch(src, originalPhoto, `Original photo served: ${file}`);
    const srcset = attribute(tag[0], 'srcset');
    if (srcset) {
      assert.doesNotMatch(
        srcset,
        originalPhoto,
        `Original photo in srcset: ${file}`,
      );
      for (const candidate of srcset.split(',')) {
        const match = candidate.trim().match(/^(\/\S+)\s+(\d+)w$/);
        assert.ok(match, `Invalid responsive image candidate: ${candidate}`);
        assert.ok(Number(match[2]) > 0);
        assert.ok(
          (await stat(path.join(root, match[1]))).isFile(),
          `Missing responsive image: ${match[1]}`,
        );
        checkedImageCandidates++;
      }
    }
    checkedImages++;
  }
  const expectedPairs =
    file === 'index.html'
      ? comparisonPairs.slice(0, 1)
      : file === 'work/index.html'
        ? comparisonPairs
        : [];
  const ranges = [...html.matchAll(/<input\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => attribute(tag, 'type') === 'range');
  assert.equal(
    ranges.length,
    expectedPairs.length,
    `Unexpected comparison range count: ${file}`,
  );
  const comparisons = [
    ...html.matchAll(
      /<figure\b(?=[^>]*\sdata-before-after(?:[=\s>]))[^>]*>(.*?)<\/figure>/gs,
    ),
  ];
  assert.equal(comparisons.length, expectedPairs.length);
  for (const [index, comparison] of comparisons.entries()) {
    const content = comparison[1];
    const images = [...content.matchAll(/<img\b[^>]*>/g)].map(
      (match) => match[0],
    );
    assert.equal(images.length, 2, `Two images per comparison: ${file}`);
    const before = images.find((tag) =>
      attribute(tag, 'class')?.split(/\s+/).includes('comparison-before'),
    );
    const after = images.find((tag) =>
      attribute(tag, 'class')?.split(/\s+/).includes('comparison-after'),
    );
    assert.ok(before && after, `Missing before/after image: ${file}`);
    assert.deepEqual(
      [imageStem(before), imageStem(after)],
      expectedPairs[index],
      `Incorrect photo pairing: ${file}, comparison ${index + 1}`,
    );
    assert.equal(attribute(before, 'width'), attribute(after, 'width'));
    assert.equal(attribute(before, 'height'), attribute(after, 'height'));
    for (const tag of images) {
      assert.ok(attribute(tag, 'alt')?.trim(), 'Project photos need alt text');
      assert.match(attribute(tag, 'src'), /\.webp$/);
      const candidates = attribute(tag, 'srcset')?.split(',') || [];
      assert.ok(
        candidates.length >= 2,
        'Project photos need responsive srcsets',
      );
      assert.ok(attribute(tag, 'sizes')?.trim(), 'Responsive sizes required');
      for (const candidate of candidates)
        assert.match(candidate.trim(), /^\/\S+\.webp\s+\d+w$/);
    }
    const controls = [...content.matchAll(/<input\b[^>]*>/g)]
      .map((match) => match[0])
      .filter((tag) => attribute(tag, 'type') === 'range');
    assert.equal(controls.length, 1, 'One range per comparison');
    const control = controls[0];
    const id = attribute(control, 'id');
    assert.ok(id && ids.includes(id), 'Comparison range needs a unique ID');
    const labelledBy = attribute(control, 'aria-labelledby')
      ?.trim()
      .split(/\s+/);
    const associatedLabel = [...content.matchAll(/<label\b[^>]*>/g)].some(
      (match) => attribute(match[0], 'for') === id,
    );
    assert.ok(
      attribute(control, 'aria-label')?.trim() ||
        (labelledBy?.length &&
          labelledBy.every((value) => ids.includes(value))) ||
        associatedLabel,
      `Comparison range needs an accessible name: ${file}`,
    );
    const describedBy = attribute(control, 'aria-describedby')
      ?.trim()
      .split(/\s+/);
    assert.ok(
      describedBy?.length && describedBy.every((value) => ids.includes(value)),
      `Comparison range instructions must exist: ${file}`,
    );
    const min = Number(attribute(control, 'min') ?? 0);
    const max = Number(attribute(control, 'max') ?? 100);
    const value = Number(attribute(control, 'value'));
    assert.ok(max > min);
    assert.ok(
      Math.abs((value - min) / (max - min) - 0.5) <= 0.05,
      'Comparison should start around halfway',
    );
    checkedComparisons++;
  }
  const visibleText = html
    .replace(/<(script|style)\b[^>]*>.*?<\/\1>/gs, '')
    .replace(/<[^>]*>/g, ' ');
  const unsupportedClaims =
    /AggregateRating|reviewCount|yearsInBusiness|employeeCount|100%|guaranteed/i;
  for (const content of [
    visibleText,
    title,
    description,
    JSON.stringify(schema),
  ])
    assert.ok(
      !unsupportedClaims.test(content),
      `Unsupported marketing or schema claim: ${file}`,
    );
  if (file !== 'contact/index.html') {
    const clientScripts = [...html.matchAll(/<script\b[^>]*>/g)]
      .map((match) => match[0])
      .filter((tag) => attribute(tag, 'type') !== 'application/ld+json');
    assert.equal(
      clientScripts.length,
      expectedPairs.length ? 1 : 0,
      `Unexpected client JS: ${file}`,
    );
    for (const script of clientScripts) {
      assert.equal(attribute(script, 'type'), 'module');
      const src = attribute(script, 'src');
      if (src) {
        assert.ok(src.startsWith('/') && src.endsWith('.js'));
        assert.ok((await stat(path.join(root, src))).isFile());
      }
    }
  }
  for (const script of html.matchAll(/(<script\b[^>]*>)(.*?)<\/script>/gs)) {
    if (
      attribute(script[1], 'type') === 'module' &&
      !attribute(script[1], 'src')
    )
      inlineClientScripts.add(script[2]);
  }
}
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, 5);
assert.match(
  await readFile(path.join(root, 'robots.txt'), 'utf8'),
  /Disallow: \//,
);
async function filesIn(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const values = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? filesIn(path.join(folder, entry.name))
        : [path.join(folder, entry.name)],
    ),
  );
  return values.flat();
}
const outputFiles = await filesIn(root);
assert.ok(
  !outputFiles.some((file) => originalPhoto.test(path.basename(file))),
  'Source project JPEGs must not be copied into the public build',
);
const disallowed = [
  /Milwaukee/i,
  /Wisconsin/i,
  /Pro\s*AM\s*(?:Painting)?/i,
  /Princeton/i,
  /\(414\)/,
  /555[- ]\d{4}/,
  /kyler4227/i,
  /grant@unshakenpainting\.com/i,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:sk|re)_[A-Za-z0-9]{24,}/,
  /(?:SMTP_PASSWORD|RESEND_API_KEY|AWS_SECRET_ACCESS_KEY)\s*[:=]/,
  // V2 pending preparation must not become a public policy, FAQ, or brand change.
  /TODO_GRANT_[A-Z_]+/,
  /Unshaken Painting and Contracting/i,
  /Twin Cities\s*(?:&amp;|&)\s*North Metro/i,
  /1-Year Labor Warranty|View warranty details/i,
  /structural movement|misuse|one-year labor warranty/i,
  /Surrounding surfaces are protected before applicable painting work begins/i,
  /The written agreement defines the work being performed/i,
  /Scope changes are documented before additional work proceeds/i,
  /Do I need to buy the paint|What should I move before painting begins/i,
  /Do you warranty your work|What happens if the project scope changes/i,
  /Do you work on residential and commercial properties|What areas do you serve/i,
  /representative July 2026 contract|pendingOwnerConfirmation|ownerApproved/i,
];
for (const file of outputFiles.filter((f) =>
  /\.(?:html|js|css|xml|txt)$/.test(f),
)) {
  const content = await readFile(file, 'utf8');
  for (const pattern of disallowed)
    assert.ok(
      !pattern.test(content),
      `Forbidden content ${pattern} in ${file}`,
    );
}
const jsFiles = outputFiles.filter((file) => file.endsWith('.js'));
let bytes = 0;
for (const file of jsFiles) bytes += (await stat(file)).size;
for (const script of inlineClientScripts) bytes += Buffer.byteLength(script);
assert.ok(bytes < 15000, `Unexpectedly large client bundle: ${bytes} bytes`);
console.log(
  JSON.stringify(
    {
      pages: pages.length,
      sitemapRoutes: 5,
      checkedLinks,
      checkedImages,
      checkedImageCandidates,
      checkedComparisons,
      clientJavaScriptBytes: bytes,
      checks:
        'metadata, local assets, responsive images, comparison pairs, accessible controls, links, anchor targets, schema, preview indexing, claims, credential patterns',
    },
    null,
    2,
  ),
);
