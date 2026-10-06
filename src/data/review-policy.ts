export type PermissionLevel =
  | 'anonymous'
  | 'firstName'
  | 'firstNameLastInitial'
  | 'fullName'
  | 'fullNameAndPhoto';
export interface Review {
  id: string;
  name: string; // Private source name; never render directly or hydrate this data.
  displayName?: string;
  rating: number;
  reviewText: string;
  source: string;
  sourceUrl: string;
  projectType: string;
  permissionLevel: PermissionLevel;
  permissionConfirmed: boolean;
  verified: boolean;
  householdOrProjectId: string;
  photoUrl?: string;
}
export function safeReviewName(review: Review): string {
  if (review.permissionLevel === 'anonymous') return 'A local customer';
  const parts = review.name.trim().split(/\s+/);
  const first = parts[0] || 'Customer';
  if (review.permissionLevel === 'firstName') return first;
  if (review.permissionLevel === 'firstNameLastInitial') {
    return parts.length > 1 ? `${first} ${parts.at(-1)!.charAt(0)}.` : first;
  }
  return review.displayName || review.name;
}
export function approvedReviews(reviews: Review[]) {
  const seen = new Set<string>();
  return reviews.filter((review) => {
    if (
      !review.verified ||
      !review.permissionConfirmed ||
      !review.householdOrProjectId ||
      seen.has(review.householdOrProjectId)
    )
      return false;
    seen.add(review.householdOrProjectId);
    return true;
  });
}
