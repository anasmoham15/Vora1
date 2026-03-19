import { GoogleGenAI } from "@google/genai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail, HealthQuizData } from '../types';

// HARDCODED FALLBACK: If Vercel fails, we use the key directly.
const getModel = () => {
  // Try to get from environment first, otherwise use the hardcoded string
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDXw9gqtA9MG_tKy7HGGMyrobSaWGfe214";

  if (!apiKey || apiKey === "AIzaSyDXw9gqtA9MG_tKy7HGGMyrobSaWGfe214") {
    console.warn("Using Hardcoded Key (Environment Variable not found)");
  }

  try {
    const genAI = new GoogleGenAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (e: any) {
    throw new Error("AI_INIT_ERROR: " + e.message);
  }
};

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  try {
    const model = getModel();
    const prompt = `Generate a workout for ${muscle} (${bodyPart}) at ${environment}. 
    Return ONLY a JSON object with: "strategy" (string) and "exercises" (array of 4 objects with: name, description, sets, reps, instructions as array).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format Error");
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    throw error;
  }
};

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `Analyze: BMI ${bmi ? bmi.toFixed(1) : 'N/A'}, Score ${healthScore}/100. Activity: ${answers.activity}, Sleep: ${answers.sleep}, Diet: ${answers.diet}. Markdown format.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    throw error;
  }
};

export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const model = getModel();
  const prompt = `7-day split for ${config.level}. Goal: ${config.goal.join(', ')}. Return JSON.`;
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.response.text());
};

export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const model = getModel();
  const prompt = `Details for: "${query}". Return JSON: name, muscleGroup, type, description.`;
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.response.text());
};
