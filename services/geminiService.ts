import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const genAI = new GoogleGenerativeAI(apiKey || "");

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Generate a JSON workout for ${muscle} (${bodyPart}) at ${environment}. 
  Return ONLY: {"strategy": "...", "exercises": [{"name": "...", "description": "...", "sets": "...", "reps": "...", "instructions": ["..."]}]}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
};

export const generateExerciseVideo = async (n: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(n)}`;
export const generateWeeklyPlan = async () => ({});
export const generateHealthAnalysis = async () => "";
