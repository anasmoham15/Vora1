import type { WorkoutPlan } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  // We use a direct fetch to the v1beta endpoint which explicitly supports gemini-1.5-flash
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Generate a 4-exercise workout for ${muscle} (${bodyPart}) at ${environment}. 
  Return ONLY a JSON object: {"strategy": "string", "exercises": [{"name": "string", "description": "string", "sets": "string", "reps": "string", "instructions": ["string"]}]}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Google API Error");
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Direct Fetch Error:", err);
    throw err;
  }
};

// Built-in fallbacks to ensure the app doesn't crash on other screens
export const generateExerciseVideo = async (n: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(n)}+tutorial`;
export const generateWeeklyPlan = async () => ({});
export const generateHealthAnalysis = async () => "";
export const searchExerciseDetail = async () => ({});
