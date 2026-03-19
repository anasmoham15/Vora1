import { GoogleGenAI, SchemaType } from "@google/genai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail, HealthQuizData } from '../types';

// Initialize the Google Generative AI client
const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Generates a targeted 4-exercise workout plan.
 */
export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  // Use the stable flash model
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash"
  });

  const prompt = `You are a friendly, expert personal trainer. Generate a clear and effective workout.
  Target Area: ${muscle} (${bodyPart}).
  Location: ${environment}.
  
  REQUIREMENTS:
  - Exactly 4 exercises.
  - Strategy: 2-3 sentences explaining why this works.
  - For each exercise: name, description, sets, reps, and 3-5 clear instructions.

  Return the response as a valid JSON object with the following structure:
  {
    "strategy": "string",
    "exercises": [
      {
        "name": "string",
        "description": "string",
        "sets": "string",
        "reps": "string",
        "instructions": ["string", "string", "string"]
      }
    ]
  }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown formatting
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    
    return {
      strategy: parsed.strategy,
      exercises: parsed.exercises
    };
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to create workout: " + error.message);
  }
};

/**
 * Generates a full 7-day workout split.
 */
export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Create a 7-day workout split for a ${config.level} level user. 
  Goal: ${config.goal.join(', ')}. Split: ${config.split}. Frequency: ${config.daysPerWeek} days.
  Return a JSON object where keys are "Monday" through "Sunday". 
  Each day must have a "title" and an "activities" array of strings (Exercise - Sets x Reps).`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Weekly Plan Error:", error);
    throw new Error("Failed to generate weekly plan.");
  }
};

/**
 * Analyzes health quiz data.
 */
export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Analyze this health data: BMI ${bmi ? bmi.toFixed(1) : 'N/A'}, Health Score ${healthScore}/100. 
  Activity: ${answers.activity}, Sleep: ${answers.sleep}, Diet: ${answers.diet}. 
  Provide a summary, habit analysis, and 3 action steps in Markdown format.`;

  try {
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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Provide details for the exercise: "${query}". Return JSON with name, muscleGroup, type, and description.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const text = result.response.text();
  const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanedText);
};
