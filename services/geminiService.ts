import { GoogleGenAI } from "@google/genai";
import type { WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail, HealthQuizData } from '../types';

const getModel = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // If this error shows up in your Console, the .env/Vercel setup is the culprit
  if (!apiKey) {
    console.error("❌ API KEY MISSING: Ensure VITE_GEMINI_API_KEY is set.");
    throw new Error("Gemini API Key is missing.");
  }
  
  const genAI = new GoogleGenAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const generateWorkout = async (bodyPart: string, muscle: string, environment: string): Promise<WorkoutPlan> => {
  console.log("🚀 Calling Gemini for:", { bodyPart, muscle, environment });
  
  const model = getModel();
  const prompt = `Generate a 4-exercise workout for ${muscle} (${bodyPart}) at ${environment}. 
  Return ONLY a valid JSON object with: 
  "strategy" (string) and 
  "exercises" (array of objects with name, description, sets, reps, instructions).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Safety check: Find the JSON content if AI wrapped it in markdown
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    const parsed = JSON.parse(jsonString);
    console.log("✅ Successfully generated workout:", parsed);
    return parsed;
    
  } catch (error: any) {
    console.error("❌ GEMINI ERROR:", error);
    // This alert will show up in your browser to tell you exactly what Google said
    if (error.message.includes('401')) alert("Invalid API Key (Error 401)");
    if (error.message.includes('429')) alert("Rate limit reached. Wait 60s.");
    throw error;
  }
};

// ... keep your other functions (weeklyPlan, etc.) down here ...
