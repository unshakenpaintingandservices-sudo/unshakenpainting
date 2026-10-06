import { approvedReviews, type Review } from './review-policy';
// TODO_GRANT_REVIEW — verify original source and choose independent projects/households.
// TODO_GRANT_REVIEW_PERMISSION — record permission before publishing text or attribution.
export const reviews: Review[] = [];
export const publishedReviews = approvedReviews(reviews);
