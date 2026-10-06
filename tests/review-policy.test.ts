import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  safeReviewName,
  approvedReviews,
  type Review,
} from '../src/data/review-policy.ts';
const review: Review = {
  id: 'test-only',
  name: 'Example Customer',
  displayName: 'Do not leak a full name',
  rating: 5,
  reviewText: 'TEST FIXTURE ONLY — never rendered.',
  source: 'Test fixture',
  sourceUrl: '',
  projectType: 'Test',
  permissionLevel: 'firstNameLastInitial',
  permissionConfirmed: true,
  verified: true,
  householdOrProjectId: 'fixture-household',
};
test('partial-name permission cannot be bypassed by a displayName override', () => {
  assert.equal(safeReviewName(review), 'Example C.');
  assert.equal(
    safeReviewName({ ...review, permissionLevel: 'firstName' }),
    'Example',
  );
  assert.equal(
    safeReviewName({ ...review, permissionLevel: 'anonymous' }),
    'A local customer',
  );
});
test('reviews need verification, permission, and a known independent household/project', () => {
  assert.equal(
    approvedReviews([
      { ...review, verified: false },
      { ...review, permissionConfirmed: false },
      { ...review, householdOrProjectId: '' },
    ]).length,
    0,
  );
});
test('same household/project is only represented once', () => {
  const selected = approvedReviews([
    review,
    { ...review, id: 'duplicate' },
    {
      ...review,
      id: 'independent',
      householdOrProjectId: 'another-fixture-household',
    },
  ]);
  assert.deepEqual(
    selected.map((entry) => entry.id),
    ['test-only', 'independent'],
  );
});
