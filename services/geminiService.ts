import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Exercise, HealthQuizData, WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail } from '../types';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Helper to get the stable model
 */
const getModel = (schema?: any) => {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: schema ? {
      responseMimeType: "application/json",
      responseSchema: schema,
    } : undefined,
  });
};

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  const responseSchema = {
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
  };

  const model = getModel(responseSchema);
  const prompt = `You are a personal trainer. Generate a 4-exercise workout for ${muscle} (${bodyPart}) at ${environment}.`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Workout Gen Error:", error);
    throw new Error("Failed to create workout.");
  }
};

export const generateExerciseVideo = async (exerciseName: string): Promise<string> => {
  try {
    const model = getModel(); // No schema for a simple string search
    // Using Google Search grounding if available, otherwise simple fallback
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Find a YouTube tutorial URL for: ${exerciseName}. Provide ONLY the URL.` }]}]
    });
    const text = result.response.text();
    const match = text.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/);
    return match ? match[0] : `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+tutorial`;
  } catch {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+tutorial`;
  }
};

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  const model = getModel();
  const prompt = `Act as a health coach. Analyze: Activity:${answers.activity}, Sleep:${answers.sleep}, Score:${healthScore}, BMI:${bmi}. Provide a friendly Markdown summary with Action Steps.`;
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Could not generate analysis. Please try again later.";
  }
};

// Add any other missing functions (searchExerciseDetail, generateWeeklyPlan) using the getModel pattern above.
