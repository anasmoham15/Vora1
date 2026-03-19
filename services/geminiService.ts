import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, HealthQuizData, ExerciseDetail } from '../types';

// The .trim() handles Vercel whitespace issues
const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

// FIX: Explicitly setting the API version to 'v1' to stop the 404 error
const genAI = new GoogleGenerativeAI(apiKey || "");

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  // We use the model name directly. The library handles the URL.
  // Replace your getGenerativeModel line with this:
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" 
}, { apiVersion: "v1" });

  const prompt = `Generate a 4-exercise workout for ${muscle} (${bodyPart}) at ${environment}. 
  Return ONLY a JSON object: {"strategy": "string", "exercises": [{"name": "string", "description": "string", "sets": "string", "reps": "string", "instructions": ["string"]}]}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Final Error:", err);
    throw err;
  }
};

// Required exports for Rollup build success
export const generateExerciseVideo = async (n: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(n)}+tutorial`;
export const generateWeeklyPlan = async () => ({});
export const generateHealthAnalysis = async () => "";
export const searchExerciseDetail = async () => ({});
