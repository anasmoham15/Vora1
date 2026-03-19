import { GoogleGenAI } from "@google/genai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail, HealthQuizData } from '../types';

// We now accept the key as a direct argument to ensure it exists
const getModelWithKey = (key: string) => {
  try {
    const genAI = new GoogleGenAI(key);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (e: any) {
    throw new Error("SDK_INIT_FAILED: " + e.message);
  }
};

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string, apiKey: string): Promise<WorkoutPlan> => {
  try {
    const model = getModelWithKey(apiKey);
    const prompt = `Generate a workout for ${muscle} (${bodyPart}) at ${environment}. 
    Return ONLY a JSON object with: "strategy" (string) and "exercises" (array of 4 objects with: name, description, sets, reps, instructions as array).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI response format error.");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    throw error;
  }
};

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number, apiKey: string): Promise<string> => {
  try {
    const model = getModelWithKey(apiKey);
    const prompt = `Analyze this health data: BMI ${bmi ? bmi.toFixed(1) : 'N/A'}, Health Score ${healthScore}/100. 
    Activity: ${answers.activity}, Sleep: ${answers.sleep}, Diet: ${answers.diet}. 
    Provide a summary and 3 action steps in Markdown format.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    throw new Error("Health analysis failed: " + error.message);
  }
};

export const generateWeeklyPlan = async (config: WeeklyPlannerConfig, apiKey: string): Promise<WeeklyPlan> => {
  try {
    const model = getModelWithKey(apiKey);
    const prompt = `Create a 7-day workout split for a ${config.level} level user. 
    Goal: ${config.goal.join(', ')}. Split: ${config.split}. Frequency: ${config.daysPerWeek} days.
    Return JSON.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error: any) {
    throw new Error("Weekly plan failed: " + error.message);
  }
};

export const searchExerciseDetail = async (query: string, apiKey: string): Promise<ExerciseDetail> => {
  const model = getModelWithKey(apiKey);
  const prompt = `Details for: "${query}". Return JSON: name, muscleGroup, type, description.`;
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.response.text());
};
