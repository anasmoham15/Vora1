import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WorkoutPlan, HealthQuizData, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail } from '../types';

// FIX: Read the API key from the environment. Works both locally (.env.local)
// and on Vercel (Environment Variables in project settings).
const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

if (!API_KEY) {
  console.error(
    '[Vora] Gemini API key is missing.\n' +
    'Add GEMINI_API_KEY to your:\n' +
    '  • .env.local file (for local development)\n' +
    '  • Vercel dashboard → Project Settings → Environment Variables (for production)'
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);
// FIX: Updated from gemini-1.5-flash to gemini-2.0-flash — faster, smarter,
// and confirmed available on your API key (verified March 2026)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ─── Helper ──────────────────────────────────────────────────────────────────

const safeParseJSON = <T>(text: string): T => {
  // Strip markdown code fences if present (Gemini sometimes adds them)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error('AI returned an unexpected format. Please try again.');
  }
};

// ─── Workout Generator ───────────────────────────────────────────────────────

export const generateWorkout = async (
  bodyPart: string,
  muscle: string,
  environment: string
): Promise<WorkoutPlan> => {
  const prompt = `You are an expert personal trainer. Generate a workout plan for the following:
- Body Part: ${bodyPart}
- Specific Muscle: ${muscle}
- Environment / Equipment: ${environment}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "strategy": "A 1-2 sentence description of the overall session goal and approach",
  "exercises": [
    {
      "name": "Exercise Name",
      "description": "Brief description of what this exercise does and why it's included",
      "sets": "4",
      "reps": "8-12",
      "instructions": [
        "Step 1 instruction",
        "Step 2 instruction",
        "Step 3 instruction"
      ]
    }
  ]
}

Include 4-6 exercises appropriate for the muscle and environment. Be specific and practical.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return safeParseJSON<WorkoutPlan>(text);
};

// ─── Health Analysis ─────────────────────────────────────────────────────────

export const generateHealthAnalysis = async (
  data: HealthQuizData,
  bmi: number | null,
  healthScore: number
): Promise<string> => {
  const bmiText = bmi !== null ? bmi.toFixed(1) : 'Not calculable';
  
  const prompt = `You are a professional health and wellness advisor. Analyse the following health data and write a personalised wellness report.

Health Data:
- Exercise frequency: ${data.activity}
- Sleep: ${data.sleep}
- Diet quality: ${data.diet}
- Stress level: ${data.stress}
- Sugar/soda intake: ${data.intake}
- Weight: ${data.weight} kg
- Height: ${data.height} cm
- Body Fat: ${data.bodyFat}%
- Calculated BMI: ${bmiText}
- Wellness Score: ${healthScore}/100

Write a comprehensive but friendly wellness report using markdown. Use the following structure:
# Your Wellness Summary

## Overall Assessment
(2-3 sentences on their general health picture)

## What You're Doing Well
(Bullet points of positives)

## Areas to Improve
(Bullet points of specific, actionable improvements)

## Your Action Plan
(3-5 concrete steps they can start this week)

## Nutrition Notes
(Brief personalised nutrition advice)

Be encouraging, specific, and practical. Do NOT give medical diagnoses. Use **bold** for key points.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ─── Weekly Planner ──────────────────────────────────────────────────────────

export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const prompt = `You are an expert fitness coach. Create a 7-day weekly training schedule based on:
- Goals: ${config.goal.join(', ')}
- Training Split: ${config.split}
- Experience Level: ${config.level}
- Training Frequency: ${config.daysPerWeek}
- Environment: ${config.environment}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "Monday": { "title": "Push Day", "activities": ["Bench Press 4x8", "Overhead Press 3x10", "Tricep Pushdown 3x12"] },
  "Tuesday": { "title": "Rest & Recovery", "activities": ["Light stretching 10 mins", "Walk 20 mins"] },
  "Wednesday": { "title": "Pull Day", "activities": ["Deadlift 4x5", "Barbell Row 3x8", "Pull Ups 3x max"] },
  "Thursday": { "title": "Rest", "activities": ["Active rest", "Foam rolling"] },
  "Friday": { "title": "Leg Day", "activities": ["Squat 4x8", "Leg Press 3x12", "Romanian Deadlift 3x10"] },
  "Saturday": { "title": "Cardio & Core", "activities": ["30 min run", "Plank 3x60s", "Ab circuit"] },
  "Sunday": { "title": "Rest", "activities": ["Full rest day", "Sleep 8+ hours"] }
}

Every day must have a title and activities array. Rest days should have light recovery activities.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return safeParseJSON<WeeklyPlan>(text);
};

// ─── Exercise Video (YouTube Search) ─────────────────────────────────────────

export const generateExerciseVideo = async (exerciseName: string): Promise<string> => {
  // FIX: Instead of asking the AI to generate a YouTube URL (which it cannot
  // reliably do — it hallucinates URLs), we build a direct YouTube search URL.
  // This always works and never returns a broken link.
  const searchQuery = encodeURIComponent(`${exerciseName} exercise tutorial form`);
  return `https://www.youtube.com/results?search_query=${searchQuery}`;
};

// ─── Exercise Dictionary ──────────────────────────────────────────────────────

export const searchExerciseDetail = async (exerciseName: string): Promise<ExerciseDetail> => {
  const prompt = `You are a certified strength and conditioning coach. Provide detailed information about the following exercise: "${exerciseName}"

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "name": "Official exercise name",
  "muscleGroup": "Primary muscle group(s) targeted",
  "type": "Compound / Isolation / Cardio / Flexibility",
  "description": "A detailed 3-5 sentence description covering: what muscles it works, how to perform it correctly, key form cues, common mistakes to avoid, and who should include it in their routine."
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return safeParseJSON<ExerciseDetail>(text);
};
