import { Card } from '../types';

export type Rating = 'easy' | 'hard' | 'again';

export function calculateNextReview(card: Card, rating: Rating): Partial<Card> {
  let { ease_factor, interval, repetitions } = card;

  if (rating === 'easy') {
    // Knew it well
    ease_factor = Math.max(1.3, ease_factor + 0.15); // Increase ease
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 4;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    repetitions += 1;
  } else if (rating === 'hard') {
    // Took effort
    ease_factor = Math.max(1.3, ease_factor - 0.15); // Decrease ease slightly
    interval = Math.max(1, Math.round(interval * 0.5)); // Halve interval, min 1 day
    repetitions = Math.max(0, repetitions - 1);
  } else {
    // Again / didn't know
    ease_factor = Math.max(1.3, ease_factor - 0.2); // Decrease ease further
    interval = 0; // Next review soon (e.g. 10 mins, mapped to 0 days for DB)
    repetitions = 0;
  }

  // Calculate next review timestamp
  const nextReviewDate = new Date();
  if (interval === 0) {
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
  } else {
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  }

  return {
    ease_factor,
    interval,
    repetitions,
    next_review: nextReviewDate.toISOString(),
    last_reviewed: new Date().toISOString(),
  };
}
