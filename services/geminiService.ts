import { GoogleGenAI } from "@google/genai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail, HealthQuizData } from '../types';

const getModel = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key Missing");
  const genAI = new GoogleGenAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

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

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `Analyze this health data: BMI ${bmi ? bmi.toFixed(1) : 'N/A'}, Health Score ${healthScore}/100. 
    Activity: ${answers.activity}, Sleep: ${answers.sleep}, Diet: ${answers.diet}. 
    Provide a summary and 3 action steps in Markdown format.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    throw new Error("Failed to generate health analysis.");
  }
};

export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const model = getModel();
  const prompt = `Create a 7-day workout split for a ${config.level} level user. Goal: ${config.goal.join(', ')}. Return JSON.`;
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.response.text());
};

export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const model = getModel();
  const prompt = `Provide details for: "${query}". Return JSON: name, muscleGroup, type, description.`;
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.response.text());
};
