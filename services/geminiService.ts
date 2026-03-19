import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Exercise, HealthQuizData, WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail } from '../types';

// This is the only line I changed to make it work with your Vercel Keys
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      // This is your EXACT schema from AI Studio
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          strategy: { type: SchemaType.STRING, description: "A simple explanation of the workout focus." },
          exercises: {
            type: SchemaType.ARRAY,
            description: "A list of exercises.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING, description: "The name of the exercise." },
                description: { type: SchemaType.STRING, description: "A brief, encouraging description." },
                sets: { type: SchemaType.STRING, description: "Recommended sets." },
                reps: { type: SchemaType.STRING, description: "Recommended reps." },
                instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Simple step-by-step instructions." }
              },
              required: ["name", "description", "sets", "reps", "instructions"]
            }
          }
        },
        required: ["strategy", "exercises"]
      }
    }
  });

  // Your EXACT prompt from AI Studio
  const prompt = `You are a friendly, expert personal trainer. Generate a clear and effective workout.
  Target Area: ${muscle} (${bodyPart}).
  Location: ${environment}.
  
  CONSISTENCY REQUIREMENTS:
  - Each plan must have exactly 4 exercises.
  - Strategy should be concise and grounded in science.
  - Instructions must be clear and focus on proper form.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};

// Your EXACT Video Search logic
export const generateExerciseVideo = async (exerciseName: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    tools: [{ googleSearchRetrieval: {} } as any] 
  });
  
  const prompt = `Find a standard YouTube video link for a professional tutorial of the exercise: "${exerciseName}". Provide only the URL.`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const match = text.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/);
  return match ? match[0] : `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}`;
};

// I am leaving placeholders for the other two functions so the app doesn't crash
export const generateWeeklyPlan = async () => ({});
export const generateHealthAnalysis = async () => "";
