export const services = [
  {
    id: 'residential',
    number: '01',
    title: 'Residential painting',
    short:
      'Walls, ceilings, and the rooms you live in. From a single room to a home repaint.',
    description:
      'Painting for the places you call home, with attention to preparation and the surfaces around the work.',
    examples: [
      'Interior walls and ceilings',
      'Residential repaints',
      'Exterior painting',
    ],
  },
  {
    id: 'commercial',
    number: '02',
    title: 'Commercial painting',
    short:
      'Painting for businesses and commercial spaces. Talk with Grant about your space and scope.',
    description:
      'A straightforward conversation about your space, the work it needs, and how to approach the project.',
    examples: [
      'Commercial interiors',
      'Walls and ceilings',
      'Repaints and surface preparation',
    ],
  },
  {
    id: 'new-construction',
    number: '03',
    title: 'New construction',
    short:
      'Preparation and painting for new spaces, including new construction spray-outs.',
    description:
      'Painting for new construction, working with homeowners and contractors to understand the scope and sequence of the job.',
    examples: [
      'New construction spray-outs',
      'Interior painting',
      'Surface preparation',
    ],
  },
  {
    id: 'repaints-specialty',
    number: '04',
    title: 'Repaints & specialty work',
    short:
      'Cabinets, decks, and ceiling texture work. Start with what you have in mind.',
    description:
      'Some projects need more than a fresh coat on the walls. Grant can discuss what your surfaces need and which work is a fit.',
    examples: [
      'Cabinet painting and refinishing',
      'Decks',
      'Popcorn texture removal',
      'Knockdown texture and ceiling work',
      'Mud and surface preparation',
    ],
  },
];
export const values = [
  {
    title: 'Quality first',
    text: 'Careful work starts with understanding the surface and preparing it for paint.',
  },
  {
    title: 'Respect your home',
    text: 'Your home is a place to live. Protecting the space is part of the work.',
  },
  {
    title: 'Clear communication',
    text: 'Talk through the scope, ask questions, and know who to contact as the job moves along.',
  },
  {
    title: 'Pride in the details',
    text: 'Preparation, edges, and the final walkthrough all deserve attention.',
  },
];

export interface ExpectationCandidate {
  title: string;
  text: string;
  approval: 'pendingOwnerConfirmation' | 'ownerInterview' | 'ownerApproved';
}

// TODO_GRANT_EXPECTATIONS_APPROVAL — the first three practices are supported by
// one representative contract only. This is an internal proposed replacement set,
// not additional homepage copy. Keep the interview-supported V1 values until all
// four replacements have support for public use. See docs/V2-REPORT.md.
export const expectationCandidates: ExpectationCandidate[] = [
  {
    title: 'Respect for the work area',
    text: 'Surrounding surfaces are protected before applicable painting work begins.',
    approval: 'pendingOwnerConfirmation',
  },
  {
    title: 'Clear scope',
    text: 'The written agreement defines the work being performed.',
    approval: 'pendingOwnerConfirmation',
  },
  {
    title: 'Changes discussed first',
    text: 'Scope changes are documented before additional work proceeds.',
    approval: 'pendingOwnerConfirmation',
  },
  {
    title: 'Owner involvement',
    text: 'Grant stays involved from estimate through final walkthrough.',
    approval: 'ownerInterview',
  },
];

export function getPublicExpectations(
  candidates: readonly ExpectationCandidate[] = expectationCandidates,
) {
  const completeAndSupported =
    candidates.length === values.length &&
    candidates.every(
      ({ approval }) =>
        approval === 'ownerApproved' || approval === 'ownerInterview',
    );
  return (completeAndSupported ? candidates : values).map(
    ({ title, text }) => ({
      title,
      text,
    }),
  );
}

export const processSteps = [
  { title: 'Reach out', text: 'Tell Grant what you’re considering.' },
  {
    title: 'Look at the project',
    text: 'Review the scope and discuss options together.',
  },
  {
    title: 'Get an estimate',
    text: 'Receive a straightforward estimate for the work.',
  },
  {
    title: 'Painting',
    text: 'Grant stays involved through preparation and painting.',
  },
  {
    title: 'Walk through together',
    text: 'Review the finished work with Grant.',
  },
];
