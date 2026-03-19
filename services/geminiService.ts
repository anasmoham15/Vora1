import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Exercise, HealthQuizData, WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail } from '../types';

// Initialize with the stable library name
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * FIXED SERVICE: Restoring Perfect UI and Stable Gemini Connection
 */
export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  // Use the stable flash model
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

  const prompt = `You are a friendly, expert personal trainer. Generate a workout for:
  Target Area: ${muscle} (${bodyPart})
  Location: ${environment}
  
  REQUIREMENTS:
  - Exactly 4 exercises.
  - Strategy: 2-3 encouraging sentences.
  - Exercises: Name, description, sets (e.g. '3 sets'), reps (e.g. '12 reps'), and 3-5 clear instructions.`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return {
      strategy: parsed.strategy,
      exercises: parsed.exercises
    };
  } catch (error) {
    console.error("Gemini Workout Error:", error);
    throw new Error("Failed to create workout.");
  }
};

export const generateExerciseVideo = async (exerciseName: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Provide ONLY the YouTube URL for a ${exerciseName} tutorial.`);
    const text = result.response.text();
    const match = text.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/);
    return match ? match[0] : `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+tutorial`;
  } catch {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+tutorial`;
  }
};

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Health Coach Assessment: Activity:${answers.activity}, Sleep:${answers.sleep}, Score:${healthScore}, BMI:${bmi}. Give 3 action steps in Markdown.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Analysis temporarily unavailable.";
  }
};
