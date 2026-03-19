import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Exercise, HealthQuizData, WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 1. Generate Single Workout
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

// 2. Generate Weekly Plan (The one that caused the error!)
export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Create a 7-day workout split for a ${config.level} level goal: ${config.goal}. 
  Return JSON format: {"Monday": {"title": "string", "activities": ["string"]}, ...}`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Weekly Plan Error:", error);
    throw new Error("Failed to create weekly plan.");
  }
};

// 3. Search Exercise Detail
export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const prompt = `Provide details for ${query}: name, muscleGroup, type, description. Return JSON.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

// 4. Health Analysis
export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Analyze health: BMI ${bmi}, Score ${healthScore}. Give 3 action steps in Markdown.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// 5. Exercise Video
export const generateExerciseVideo = async (exerciseName: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`YouTube URL for ${exerciseName} tutorial. URL only.`);
  const text = result.response.text();
  const match = text.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/);
  return match ? match[0] : `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}`;
};
