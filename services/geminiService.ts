import { GoogleGenerativeAI } from "@google/generative-ai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, HealthQuizData } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Generate a workout for ${muscle} (${bodyPart}) at ${environment}. 
  Return ONLY a JSON object: {"strategy": "...", "exercises": [{"name": "...", "description": "...", "sets": "...", "reps": "...", "instructions": ["..."]}]}. 
  Exactly 4 exercises. No extra text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
};

export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Create a 7-day split for ${config.level} goal: ${config.goal}. Return JSON only.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
};

export const generateExerciseVideo = async (name: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}+tutorial`;
export const generateHealthAnalysis = async () => "Analysis loaded.";
export const searchExerciseDetail = async () => ({});
