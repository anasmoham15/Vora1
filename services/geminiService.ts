import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, HealthQuizData, ExerciseDetail } from '../types';

// Standardize the API check and trim hidden spaces
const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * 1. WORKOUT GENERATOR
 */
export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          strategy: { type: SchemaType.STRING },
          exercises: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                sets: { type: SchemaType.STRING },
                reps: { type: SchemaType.STRING },
                instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
              },
              required: ["name", "description", "sets", "reps", "instructions"]
            }
          }
        },
        required: ["strategy", "exercises"]
      }
    }
  });

  const prompt = `Generate a 4-exercise workout for ${muscle} (${bodyPart}) at ${environment}. Return JSON.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

/**
 * 2. WEEKLY PLANNER (Build Fix)
 */
export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const prompt = `Create a 7-day workout split for a ${config.level} level goal: ${config.goal}. Return JSON.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
};

/**
 * 3. HEALTH ANALYSIS (Build Fix)
 */
export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Analyze health: BMI ${bmi}, Score ${healthScore}. Provide 3 action steps in Markdown.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * 4. EXERCISE SEARCH & VIDEOS
 */
export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const prompt = `Details for ${query}: name, muscleGroup, type, description. Return JSON.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
};

export const generateExerciseVideo = async (name: string): Promise<string> => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}+tutorial`;
};
