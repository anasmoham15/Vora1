import { GoogleGenAI, Type } from "@google/genai";
import type { Exercise, HealthQuizData, WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail } from '../types';

const getAiClient = () =>
  new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

/**
 * Generates a single workout session based on target area and environment.
 */
export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  const ai = getAiClient();
  let equipmentContext = '';
  switch (environment) {
    case 'Home':
      equipmentContext = 'at home using only bodyweight. Do not include any exercises that require equipment. Higher rep ranges (12-20) for metabolic stress.';
      break;
    case 'Home (Dumbbells)':
      equipmentContext = 'at home using only a pair of dumbbells. All exercises should incorporate dumbbells. Moderate rep ranges (8-15).';
      break;
    case 'Gym':
      equipmentContext = 'in a fully equipped gym. Feel free to include exercises using barbells, dumbbells, cables, or machines. Standard hypertrophy ranges (6-12).';
      break;
    default:
      equipmentContext = 'with standard gym equipment.';
  }

  const prompt = `You are a friendly, expert personal trainer. Generate a clear and effective workout.
  Target Area: ${muscle} (${bodyPart}).
  Location: ${equipmentContext}.
  
  CONSISTENCY REQUIREMENTS:
  - Each plan must have exactly 4 exercises.
  - Strategy should be concise and grounded in science.
  - Instructions must be clear and focus on proper form.

  Output a JSON object with two fields:
  1. "strategy": A brief, encouraging explanation (2-3 sentences) of why this workout is effective. Use simple language.
  2. "exercises": A list of 4 effective exercises.

  For each exercise, provide:
  - Name
  - Encouraging description
  - Recommended sets (e.g., '3 sets')
  - Recommended reps (e.g., '10 reps')
  - A numbered list of 3-5 simple, clear instructions.
  
  Ensure the response is valid JSON.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      strategy: { type: Type.STRING },
      exercises: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            sets: { type: Type.STRING },
            reps: { type: Type.STRING },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "description", "sets", "reps", "instructions"]
        }
      }
    },
    required: ["strategy", "exercises"]
  };

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Updated to a stable model name
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const parsed = JSON.parse(result.response.text());
    
    return {
      strategy: parsed.strategy,
      exercises: parsed.exercises
    };
  } catch (error) {
    console.error("Error generating workout:", error);
    throw new Error("Failed to create workout.");
  }
};

/**
 * Dictionary search for exercise details.
 */
export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const ai = getAiClient();
  const prompt = `Act as an expert fitness coach. Provide detailed information about the exercise: "${query}".`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      muscleGroup: { type: Type.STRING },
      type: { type: Type.STRING },
      description: { type: Type.STRING }
    },
    required: ["name", "muscleGroup", "type", "description"]
  };

  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", responseSchema: schema }
  });

  return JSON.parse(result.response.text());
};

/**
 * Generates a full 7-day plan structure.
 */
export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const ai = getAiClient();
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const splitPrompt = `Create a 7-day workout split structure for a ${config.level} level user with the goal: ${config.goal.join(', ')}. Use split type: ${config.split}. Frequency: ${config.daysPerWeek} days. Environment: ${config.environment}. 
  Return a JSON object where keys are days of the week (Monday-Sunday). Each day needs a "title" and an "activities" array (initially empty).`;

  try {
    const splitResult = await model.generateContent(splitPrompt);
    const split = JSON.parse(splitResult.response.text());

    const days = Object.keys(split);
    const fullPlan: WeeklyPlan = {};

    // For each day, generate specific exercises
    await Promise.all(days.map(async (day) => {
      const dayTitle = split[day].title;
      if (dayTitle.toLowerCase().includes('rest')) {
        fullPlan[day] = { title: dayTitle, activities: ["Rest & Recovery"] };
      } else {
        const exercisePrompt = `List 4-5 exercises for a "${dayTitle}" session (${config.environment}). Return as a JSON array of strings: "Exercise - Sets x Reps".`;
        const exResult = await model.generateContent(exercisePrompt);
        fullPlan[day] = { title: dayTitle, activities: JSON.parse(exResult.response.text()) };
      }
    }));

    return fullPlan;
  } catch (error) {
    console.error("Weekly plan error:", error);
    throw new Error("Failed to generate weekly plan.");
  }
};

/**
 * Provides health and wellness analysis based on quiz data.
 */
export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  const ai = getAiClient();
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `Analyze this health data: BMI ${bmi}, Health Score ${healthScore}/100. Habits: Activity: ${answers.activity}, Sleep: ${answers.sleep}, Diet: ${answers.diet}. Provide a summary, habit analysis, and 3 action steps in Markdown format.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
