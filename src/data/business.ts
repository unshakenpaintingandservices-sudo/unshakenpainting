import type { ImageMetadata } from 'astro';
const homeBase = {
  city: 'Cambridge',
  region: 'Minnesota',
  regionCode: 'MN',
  country: 'US',
};
/** Owner interview is the source of truth unless an individual field says otherwise. */
export const business = {
  // TODO_GRANT_PUBLIC_BUSINESS_NAME — preserve V1 until Grant chooses his public brand.
  // The representative contract used a different name; see docs/V2-REPORT.md.
  name: 'Unshaken Painting and Services',
  // TODO_GRANT_LEGAL_BUSINESS_NAME — a name on one contract does not establish the legal entity name.
  legalName: null as string | null,
  shortName: 'Unshaken Painting',
  owner: 'Grant Dorney',
  ownerTitle: 'CEO',
  url: 'https://unshakenpainting.com',
  homeBase,
  phone: {
    display: '(763) 336-5174',
    signatureDisplay: '763-336-5174',
    href: 'tel:+17633365174',
    e164: '+17633365174',
    source:
      'Confirmed for website publication in the client-supplied biography and signature, October 5, 2026.',
  },
  serviceArea: {
    // TODO_GRANT_SERVICE_AREA_POSITIONING — the interview favors Cambridge; the contract used broader metro wording.
    // Preserve the interview positioning until Grant resolves the discrepancy in docs/V2-REPORT.md.
    description: `Based in ${homeBase.city} and serving surrounding communities throughout the north metro and east-central Minnesota.`,
    approximateRadiusMiles: 50,
    cities: [] as string[], // TODO_GRANT_SERVICE_AREA_CITIES — confirm alongside final regional positioning.
  },
  email: null as string | null, // TODO_GRANT_BUSINESS_EMAIL — provision mailbox before display.
  hours: null as string | null, // TODO_GRANT_BUSINESS_HOURS_CONFIRMATION
  socialLinks: [] as { label: string; url: string }[], // TODO_GRANT_SOCIAL_LINKS
  textEnabled: false, // Confirm before offering text as a contact method.
  // Client-supplied copy; preserve the wording and paragraph boundaries.
  ownerStory: [
    "I'm Grant Dorney, CEO of Unshaken Painting. Growing up, I was drawn to art galleries and display rooms, where I could sit for hours admiring the craftsmanship in detailed lines and precise artwork.",
    "My dad, an expert finish carpenter, taught me to apply paint with keen attention to detail. Just as importantly, he taught me that your work carries your family's name. Hard work, honesty, and doing right by people are the values Unshaken is built on. Residential painting became art to me, and I enjoy every step, from prep work to clean-up.",
    'Our mission is simple: to serve every homeowner with integrity and a genuine desire to help. We treat your home like our own and your family like ours. Every finish is built to last, and every project is backed by our warranty, because we believe in standing behind our word.',
    "The most satisfying part of my work is the relationships. That's what we're really building: trust that lasts long after the paint has dried.",
    'Thank you for considering Unshaken Painting. God bless!',
  ],
  nameStory: [
    'The name Unshaken comes from our faith. We believe the foundation of a life, and of a business, matters most, and ours is built on God. Everything we do is first an act of service to Him, and then to the people around us.',
    "That's why we're Unshaken Painting and Services. Service isn't just part of our name; it's the heart of how we work. We do our best to follow the example of our Savior, who leads us through this life, by treating every customer with kindness, honesty, and care.",
  ],
  ownerPhoto: null as {
    image: ImageMetadata;
    alt: string;
    approved: boolean;
  } | null, // TODO_GRANT_OWNER_PHOTO — supply/approve an authentic portrait.
  // TODO_GRANT_WARRANTY_TERMS — the representative July 2026 contract used a one-year
  // labor warranty excluding moisture, structural movement, and misuse. One project's
  // terms are not a universal policy. Grant must confirm current standard terms first.
  warranty: {
    title: '1-Year Labor Warranty',
    approved: false,
  } as {
    title: string;
    detailsUrl?: string;
    approved: boolean;
  } | null,
};
export const locationLabel = `${business.homeBase.city}, ${business.homeBase.region}`;
export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services/' },
  { label: 'Work', href: '/work/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];
