import { Feedback } from '../types';

/**
 * Generates a random 3-digit number with unique digits.
 */
export const generateSecretNumber = (): string => {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = '';
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    result += digits[randomIndex];
    digits.splice(randomIndex, 1); // Remove used digit to ensure uniqueness
  }
  return result;
};

/**
 * Validates if a string is a valid 3-digit number with unique digits.
 */
export const isValidNumber = (num: string): boolean => {
  if (!/^\d{3}$/.test(num)) return false;
  const unique = new Set(num.split(''));
  return unique.size === 3;
};

/**
 * Calculates Bulls (correct position) and Cows (wrong position).
 * @param secret The target number
 * @param guess The guessed number
 */
export const calculateFeedback = (secret: string, guess: string): Feedback => {
  let bulls = 0;
  let cows = 0;

  for (let i = 0; i < 3; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }

  return { bulls, cows };
};

export const formatFeedbackMessage = (feedback: Feedback): string => {
  const parts = [];
  if (feedback.bulls === 3) return "Correct! Code cracked.";
  
  if (feedback.bulls > 0) parts.push(`${feedback.bulls} Correct Position`);
  if (feedback.cows > 0) parts.push(`${feedback.cows} Wrong Position`);
  
  if (parts.length === 0) return "No matches.";
  return parts.join(', ');
};