import { GoogleGenAI, Type } from "@google/genai";
import { TurnHistoryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Asks Gemini to generate the next guess based on the history of its previous guesses.
 */
export const getAIGuess = async (
  history: TurnHistoryItem[], 
  availableDigits: string[] = ['0','1','2','3','4','5','6','7','8','9']
): Promise<{ guess: string; banter: string }> => {
  
  const historyText = history.map((h, i) => 
    `Guess ${i + 1}: ${h.guess} -> Result: ${h.feedback.bulls} Correct Pos, ${h.feedback.cows} Wrong Pos`
  ).join('\n');

  const prompt = `
    You are playing a number guessing game (Bulls and Cows) against a human.
    The secret code is 3 unique digits (0-9).
    
    Here is the history of your attempts to guess the human's secret number:
    ${historyText}

    Based on this logic, generate your next valid guess (3 unique digits).
    Also provide a short, competitive, witty, or analytical one-sentence remark (banter) about your move.

    If this is the first turn, just pick 3 random unique digits and say hello.

    Return JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guess: { type: Type.STRING, description: "The 3-digit guess string" },
            banter: { type: Type.STRING, description: "Short chat message to the player" }
          },
          required: ["guess", "banter"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Fallback if AI fails to return valid format (rare with schema)
    if (!result.guess || result.guess.length !== 3) {
        return { guess: "123", banter: "My sensors are glitching... let's try 123." };
    }

    return result;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Fallback strategy purely random if API fails
    const randomGuess = String(Math.floor(100 + Math.random() * 900)); 
    return { guess: randomGuess, banter: "I'm having trouble connecting to the mainframe. I'll guess randomly." };
  }
};