import { GoogleGenAI } from "@google/genai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail, HealthQuizData } from '../types';

const getModel = () => {
  // Vite environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING: The browser cannot find VITE_GEMINI_API_KEY. Please check Vercel Environment Variables and REDEPLOY.");
  }

  try {
    const genAI = new GoogleGenAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (e: any) {
    throw new Error("SDK_INIT_FAILED: " + e.message);
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
    if (!jsonMatch) throw new Error("FORMAT_ERROR: AI response was not valid JSON.");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error("Workout Generation Error:", error);
    throw error;
  }
};

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `Analyze this health data: BMI ${bmi ? bmi.toFixed(1) : 'N/A'}, Health Score ${healthScore}/100. 
    Activity: ${answers.activity}, Sleep: ${answers.sleep}, Diet: ${answers.diet}. 
    Provide a summary and 3 action steps in Markdown format.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    throw new Error("HEALTH_ANALYSIS_FAILED: " + error.message);
  }
};

export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  try {
    const model = getModel();
    const prompt = `Create a 7-day workout split for a ${config.level} level user. 
    Goal: ${config.goal.join(', ')}. Split: ${config.split}. Frequency: ${config.daysPerWeek} days.
    Return JSON format. Each day has "title" and "activities" (array of strings).`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("WEEKLY_PLAN_PARSE_ERROR");
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    throw new Error("WEEKLY_PLAN_FAILED: " + error.message);
  }
};

export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  try {
    const model = getModel();
    const prompt = `Details for: "${query}". Return JSON: name, muscleGroup, type, description.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("EXERCISE_SEARCH_PARSE_ERROR");
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    throw new Error("SEARCH_FAILED: " + error.message);
  }
};
