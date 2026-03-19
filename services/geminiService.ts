import { GoogleGenerativeAI } from "@google/generative-ai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, HealthQuizData, ExerciseDetail } from '../types';

// The .trim() is 100% necessary to prevent 404 errors from Vercel spaces
const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const genAI = new GoogleGenerativeAI(apiKey || "");

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Generate a workout for ${muscle} (${bodyPart}) at ${environment}. 
  Return ONLY a JSON object with this structure:
  {"strategy": "...", "exercises": [{"name": "...", "description": "...", "sets": "...", "reps": "...", "instructions": ["..."]}]}
  Return exactly 4 exercises. No conversational text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // THE FIX: This removes ```json and ``` blocks which cause the "Red Error"
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedJson);
  } catch (err) {
    console.error("Gemini Failure:", err);
    throw new Error("AI Connection Failed. Check API Key in Vercel.");
  }
};

// Required for the build to pass (Rollup fix)
export const generateExerciseVideo = async (name: string): Promise<string> => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}+tutorial`;
};

export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`Create a 7-day split for ${config.level}. Return JSON.`);
  const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
};

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, score: number): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`Analyze health: BMI ${bmi}, Score ${score}.`);
  return result.response.text();
};

export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`Details for ${query}. Return JSON.`);
  const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
};
