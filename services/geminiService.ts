import { GoogleGenAI } from "@google/genai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail, HealthQuizData } from '../types';

const getModel = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is missing from the environment. Check Vercel settings.");
  }

  try {
    const genAI = new GoogleGenAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (e: any) {
    throw new Error("Failed to initialize Google AI: " + e.message);
  }
};

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  try {
    const model = getModel();
    const prompt = `Generate a workout for ${muscle} (${bodyPart}) at ${environment}. 
    Return ONLY a JSON object with: "strategy" (string) and "exercises" (array of 4 objects with: name, description, sets, reps, instructions as array).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Safety regex to find JSON inside the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned text instead of data. Try again.");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error("Workout Gen Error:", error);
    throw new Error(error.message || "AI Generation failed");
  }
};

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `Analyze this health data: BMI ${bmi ? bmi.toFixed(1) : 'N/A'}, Health Score ${healthScore}/100. 
    Activity: ${answers.activity}, Sleep: ${answers.sleep}, Diet: ${answers.diet}. 
    Provide a summary and 3 action steps in Markdown.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    throw new Error("Health analysis failed: " + error.message);
  }
};

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
    if (!jsonMatch) throw new Error("Failed to parse weekly plan JSON");
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    throw new Error("Weekly plan failed: " + error.message);
  }
};

export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  try {
    const model = getModel();
    const prompt = `Provide details for: "${query}". Return JSON: name, muscleGroup, type, description.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Exercise search failed to return data");
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    throw new Error("Search failed: " + error.message);
  }
};
