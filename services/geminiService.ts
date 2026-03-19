import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Exercise, HealthQuizData, WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
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

export const generateExerciseVideo = async (exerciseName: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Give me only the YouTube URL for a tutorial of: ${exerciseName}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/);
    return match ? match[0] : `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+tutorial`;
  } catch {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+tutorial`;
  }
};

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Act as a friendly health and wellness coach. Provide a clear, helpful assessment.
    Data: Exercise: ${answers.activity}, Sleep: ${answers.sleep}, Score: ${healthScore}, BMI: ${bmi}.
    Provide a Summary, Score Analysis, Habit Analysis, and Action Steps in Markdown.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const prompt = `Act as an expert fitness coach. Provide details for: "${query}". Include name, muscleGroup, type, and description.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const prompt = `Create a 7-day workout split for level: ${config.level}, goal: ${config.goal}. Assign titles and exercises to each day.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
