import { GoogleGenAI } from "@google/genai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail, HealthQuizData } from '../types';

// Helper to initialize AI safely
const getModel = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    const errorMsg = "VITE_GEMINI_API_KEY is not defined in the environment. " + 
                     "Check Vercel Settings and ensure you have REDEPLOYED.";
    console.error("❌ ERROR:", errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const genAI = new GoogleGenAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (e) {
    console.error("❌ GoogleGenAI Init Failed:", e);
    throw e;
  }
};

/**
 * Workout Generator (Used by WorkoutGenerator.tsx)
 */
export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  try {
    const model = getModel();
    const prompt = `Generate a workout for ${muscle} (${bodyPart}) at ${environment}. 
    Return ONLY a JSON object with: "strategy" (string) and "exercises" (array of 4 objects with: name, description, sets, reps, instructions as array).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Workout Generation Error:", error);
    throw error;
  }
};

/**
 * Health Analysis (THE MISSING PIECE for HealthCheck.tsx)
 */
export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `Analyze this health data: BMI ${bmi ? bmi.toFixed(1) : 'N/A'}, Health Score ${healthScore}/100. 
    Activity: ${answers.activity}, Sleep: ${answers.sleep}, Diet: ${answers.diet}. 
    Provide a summary, habit analysis, and 3 action steps in Markdown format.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Health Analysis Error:", error);
    throw new Error("Failed to generate health analysis.");
  }
};

/**
 * Weekly Planner (Used by WeeklyPlanner.tsx)
 */
export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  try {
    const model = getModel();
    const prompt = `Create a 7-day workout split for a ${config.level} level user. 
    Goal: ${config.goal.join(', ')}. Split: ${config.split}. Frequency: ${config.daysPerWeek} days.
    Return JSON. Each day has "title" and "activities" (array of strings).`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Weekly Plan Error:", error);
    throw new Error("Failed to generate weekly plan.");
  }
};

/**
 * Dictionary Search (Used by ExerciseDictionary.tsx)
 */
export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const model = getModel();
  const prompt = `Provide details for: "${query}". Return JSON: name, muscleGroup, type, description.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found");
  return JSON.parse(jsonMatch[0]);
};
