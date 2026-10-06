export interface FaqCandidate {
  id: string;
  question: string;
  answer: string | null;
  ownerApproved: boolean;
}

// TODO_GRANT_FAQ_ANSWERS — internal preparation only; no component renders these
// records in V2. Recommended future location: a small Services section before
// Process. Do not infer final answers from a single project's contract terms.
export const faqCandidates: FaqCandidate[] = [
  {
    id: 'paint-materials',
    question: 'Do I need to buy the paint?',
    answer: null,
    ownerApproved: false,
  },
  {
    id: 'before-painting',
    question: 'What should I move before painting begins?',
    answer: null,
    ownerApproved: false,
  },
  {
    id: 'warranty',
    question: 'Do you warranty your work?',
    answer: null,
    ownerApproved: false,
  },
  {
    id: 'scope-changes',
    question: 'What happens if the project scope changes?',
    answer: null,
    ownerApproved: false,
  },
  {
    id: 'property-types',
    question: 'Do you work on residential and commercial properties?',
    answer: null,
    ownerApproved: false,
  },
  {
    id: 'service-area',
    question: 'What areas do you serve?',
    answer: null,
    ownerApproved: false,
  },
];

export function getApprovedFaqs(
  candidates: readonly FaqCandidate[] = faqCandidates,
) {
  return candidates.flatMap(({ id, question, answer, ownerApproved }) =>
    ownerApproved === true && answer?.trim()
      ? [{ id, question, answer: answer.trim() }]
      : [],
  );
}
