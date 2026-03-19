import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, HealthQuizData, ExerciseDetail } from '../types';

// The .trim() is required to remove invisible characters from Vercel env vars
const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const genAI = new GoogleGenerativeAI(apiKey || "");

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  // Use the 1.5-flash model for the fastest and most reliable JSON response
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

  const prompt = `Generate a 4-exercise workout for ${muscle} (${bodyPart}) at ${environment}. Return the data in the specified JSON format.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // This cleaning logic is a fail-safe for the JSON parser
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (err) {
    console.error("Gemini Execution Error:", err);
    throw err;
  }
};

// Build-essential exports
export const generateExerciseVideo = async (name: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}+tutorial`;
export const generateWeeklyPlan = async () => ({});
export const generateHealthAnalysis = async () => "";
export const searchExerciseDetail = async () => ({});
