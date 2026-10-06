import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  expectationCandidates,
  getPublicExpectations,
  values,
  type ExpectationCandidate,
} from '../src/data/services.ts';
import { faqCandidates, getApprovedFaqs } from '../src/data/faqs.ts';

test('pending or partially supported expectations keep the existing public copy', () => {
  assert.deepEqual(getPublicExpectations(), values);
  const partlyApproved: ExpectationCandidate[] = expectationCandidates.map(
    (item, index) => ({
      ...item,
      approval: index === 0 ? 'ownerApproved' : item.approval,
    }),
  );
  assert.deepEqual(getPublicExpectations(partlyApproved), values);
  assert.deepEqual(getPublicExpectations([]), values);
});

test('a fully approved replacement keeps four items and excludes internal approval data', () => {
  const approved: ExpectationCandidate[] = expectationCandidates.map(
    (item) => ({
      ...item,
      approval: 'ownerApproved',
    }),
  );
  const published = getPublicExpectations(approved);
  assert.equal(published.length, 4);
  assert.deepEqual(
    published,
    approved.map(({ title, text }) => ({ title, text })),
  );
});

test('FAQ readiness requires both an answer and explicit approval', () => {
  assert.deepEqual(getApprovedFaqs(), []);
  assert.deepEqual(
    getApprovedFaqs([
      {
        ...faqCandidates[0],
        answer: 'Synthetic test answer; never published.',
      },
      { ...faqCandidates[1], ownerApproved: true },
      { ...faqCandidates[2], ownerApproved: true, answer: '   ' },
    ]),
    [],
  );
  assert.deepEqual(
    getApprovedFaqs([
      {
        id: 'synthetic',
        question: 'Synthetic question?',
        answer: ' Synthetic answer. ',
        ownerApproved: true,
      },
    ]),
    [
      {
        id: 'synthetic',
        question: 'Synthetic question?',
        answer: 'Synthetic answer.',
      },
    ],
  );
});
