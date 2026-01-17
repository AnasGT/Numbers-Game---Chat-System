import { TurnHistoryItem } from "../types";

// Banters for the AI opponent
const banters = [
  "That's a tricky one!",
  "Getting closer, I can feel it!",
  "Let me narrow this down...",
  "Strategic guess incoming!",
  "I'm onto something here...",
  "Cold? Hot? Let me find out!",
  "The logic is on my side.",
  "Deduction in progress...",
  "This should shake things up!",
  "One step closer to victory!"
];

/**
 * Generate an AI guess using logical deduction (no API needed)
 */
export const getAIGuess = async (
  history: TurnHistoryItem[], 
  availableDigits: string[] = ['0','1','2','3','4','5','6','7','8','9']
): Promise<{ guess: string; banter: string }> => {
  
  // First turn: Random guess
  if (history.length === 0) {
    const guess = generateRandomGuess(availableDigits);
    return {
      guess,
      banter: "Let's start with this. Hello!"
    };
  }

  // Filter possible digits based on feedback
  let possibleDigits = [...availableDigits];
  const excludedDigits = new Set<string>();

  // Analyze feedback to eliminate impossible digits
  for (const turn of history) {
    const { guess, feedback } = turn;
    
    // If bulls + cows = 0, none of these digits are in the answer
    if (feedback.bulls === 0 && feedback.cows === 0) {
      guess.split('').forEach(d => excludedDigits.add(d));
    }
  }

  // Remove excluded digits from possible
  possibleDigits = possibleDigits.filter(d => !excludedDigits.has(d));

  // If we've eliminated too many, use all remaining
  if (possibleDigits.length < 3) {
    possibleDigits = availableDigits.filter(d => !excludedDigits.has(d));
  }

  // Generate guess with available digits
  const guess = generateSmartGuess(possibleDigits, history);
  const randomBanter = banters[Math.floor(Math.random() * banters.length)];

  return {
    guess,
    banter: randomBanter
  };
};

/**
 * Generate a random 3-digit guess with unique digits
 */
function generateRandomGuess(availableDigits: string[]): string {
  const shuffled = [...availableDigits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).join('');
}

/**
 * Generate a smart guess based on remaining possible digits
 */
function generateSmartGuess(possibleDigits: string[], history: TurnHistoryItem[]): string {
  // If we have enough possible digits, try ones we haven't guessed yet
  const guessedDigits = new Set<string>();
  history.forEach(h => {
    h.guess.split('').forEach(d => guessedDigits.add(d));
  });

  const unusedPossible = possibleDigits.filter(d => !guessedDigits.has(d));
  
  if (unusedPossible.length >= 3) {
    return unusedPossible.slice(0, 3).join('');
  }

  // Otherwise, make smart guesses with a mix of tried and untried
  const availableForGuess = possibleDigits.slice(0, Math.max(3, possibleDigits.length));
  const shuffled = [...availableForGuess].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).join('');
}