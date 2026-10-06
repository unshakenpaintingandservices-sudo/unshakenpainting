import type { ImageMetadata } from 'astro';
import deckExteriorBefore from '../assets/projects/deck-transformation/IMG_1697.jpeg';
import deckUndersideBefore from '../assets/projects/deck-transformation/IMG_1698.jpeg';
import deckSurfaceBefore from '../assets/projects/deck-transformation/IMG_1700.jpeg';
import deckExteriorAfter from '../assets/projects/deck-transformation/IMG_1701.jpeg';
import deckUndersideAfter from '../assets/projects/deck-transformation/IMG_1702.jpeg';
import deckSurfaceAfter from '../assets/projects/deck-transformation/IMG_1703.jpeg';

export interface ProjectPhoto {
  image: ImageMetadata;
  alt: string;
  authenticity: 'verified-original';
  permissionConfirmed: boolean;
}

export interface ProjectComparison {
  id: string;
  title: string;
  before: ProjectPhoto;
  after: ProjectPhoto;
  aspectRatio?: string;
  /** Independent crops keep shared features close without altering perspective. */
  beforeObjectPosition?: string;
  afterObjectPosition?: string;
  /** Uniform crop zoom/offset only; never stretch or warp the project photo. */
  afterScale?: number;
  afterOffsetX?: string;
  note?: string;
}

export interface Project {
  id: string;
  title: string;
  city?: string;
  service?: string;
  description: string;
  beforeImage?: ProjectPhoto;
  afterImage?: ProjectPhoto;
  comparisons?: ProjectComparison[];
  galleryImages: ProjectPhoto[];
  date?: string;
  testimonial?: string; // ID of an approved review; never raw unverified copy.
  startingCondition?: string;
  requestedWork?: string;
  preparation?: string;
  paintingPerformed?: string;
  result?: string;
  publicationApproved: boolean;
}

// The supplied photographs were explicitly confirmed as authentic and approved
// for this portfolio. The first comparison is also the homepage teaser.
const deckComparisons: ProjectComparison[] = [
  {
    id: 'exterior',
    title: 'Front / exterior view',
    before: {
      image: deckExteriorBefore,
      alt: 'Elevated wood deck with weathered pale railing and support post before the project.',
      authenticity: 'verified-original',
      permissionConfirmed: true,
    },
    after: {
      image: deckExteriorAfter,
      alt: 'Front of the completed deck with a uniform pale yellow railing and support post.',
      authenticity: 'verified-original',
      permissionConfirmed: true,
    },
    aspectRatio: '4 / 3',
    beforeObjectPosition: '50% 38%',
    afterObjectPosition: '50% 32%',
    afterScale: 1.04,
    afterOffsetX: '-1.25%',
    note: 'The camera position differs slightly between photographs.',
  },
  {
    id: 'underside',
    title: 'Side / underside view',
    before: {
      image: deckUndersideBefore,
      alt: 'Side of the elevated deck showing weathered railing, exposed joists and a support post before the project.',
      authenticity: 'verified-original',
      permissionConfirmed: true,
    },
    after: {
      image: deckUndersideAfter,
      alt: 'Side of the completed deck with pale yellow railing and support post above the exposed joists.',
      authenticity: 'verified-original',
      permissionConfirmed: true,
    },
    aspectRatio: '1 / 1',
    beforeObjectPosition: '50% 60%',
    afterObjectPosition: '50% 25%',
    note: 'Different camera angles show the same side of the deck; the railing and joists will not line up exactly.',
  },
  {
    id: 'surface',
    title: 'Deck surface / top view',
    before: {
      image: deckSurfaceBefore,
      alt: 'Deck floorboards with worn, peeling gray finish and weathered wood railing before the project.',
      authenticity: 'verified-original',
      permissionConfirmed: true,
    },
    after: {
      image: deckSurfaceAfter,
      alt: 'Completed deck with evenly colored pale floorboards and railing in sun and shade.',
      authenticity: 'verified-original',
      permissionConfirmed: true,
    },
    aspectRatio: '1 / 1',
    beforeObjectPosition: '50% 70%',
    afterObjectPosition: '50% 52%',
    note: 'The deck surface was photographed from different angles; the floorboards will not line up exactly.',
  },
];

export const projects: Project[] = [
  {
    id: 'deck-transformation',
    title: 'Deck Transformation',
    description:
      'A completed Unshaken Painting deck project, shown before and after from three viewpoints.',
    beforeImage: deckComparisons[0].before,
    afterImage: deckComparisons[0].after,
    comparisons: deckComparisons,
    galleryImages: [],
    publicationApproved: true,
  },
];

export const publishedProjects = projects.filter((p) => p.publicationApproved);

function isApprovedPhoto(photo?: ProjectPhoto): photo is ProjectPhoto {
  return (
    photo?.authenticity === 'verified-original' && photo.permissionConfirmed
  );
}

export function projectComparisons(project: Project): ProjectComparison[] {
  if (!project.publicationApproved) return [];
  return (project.comparisons ?? []).filter(
    ({ before, after }) => isApprovedPhoto(before) && isApprovedPhoto(after),
  );
}

export function projectCover(project: Project) {
  return [
    project.afterImage,
    ...project.galleryImages,
    project.beforeImage,
  ].find(isApprovedPhoto);
}
