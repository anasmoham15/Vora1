import { GoogleGenAI } from "@google/genai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail, HealthQuizData } from '../types';

// Helper to initialize AI only when needed
const getModel = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Check your environment variables.");
  }
  const genAI = new GoogleGenAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

/**
 * Generates a targeted 4-exercise workout plan.
 */
export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  const model = getModel();

  const prompt = `You are a friendly, expert personal trainer. Generate a clear and effective workout.
  Target Area: ${muscle} (${bodyPart}).
  Location: ${environment}.
  
  REQUIREMENTS:
  - Exactly 4 exercises.
  - Strategy: 2-3 sentences explaining why this works.
  - For each exercise: name, description, sets, reps, and 3-5 clear instructions.
  - Return ONLY a valid JSON object.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to create workout: " + error.message);
  }
};

/**
 * Generates a full 7-day workout split.
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
    
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Weekly Plan Error:", error);
    throw new Error("Failed to generate weekly plan.");
  }
};

/**
 * Analyzes health quiz data.
 */
export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `Analyze: BMI ${bmi ? bmi.toFixed(1) : 'N/A'}, Score ${healthScore}/100. 
    Activity: ${answers.activity}, Sleep: ${answers.sleep}, Diet: ${answers.diet}. 
    Provide summary and 3 action steps in Markdown.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Health Analysis Error:", error);
    throw new Error("Failed to get analysis.");
  }
};

/**
 * Dictionary search for specific exercise details.
 */
export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const model = getModel();
  const prompt = `Provide details for: "${query}". Return JSON: name, muscleGroup, type, description.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
};
