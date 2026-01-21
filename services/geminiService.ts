import { GoogleGenAI, Type } from "@google/genai";
import type { Exercise, HealthQuizData, WorkoutPlan, WeeklyPlan, WeeklyPlannerConfig, ExerciseDetail } from '../types';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
      strategy: {
        type: Type.STRING,
        description: "A simple explanation of the workout focus."
      },
      exercises: {
        type: Type.ARRAY,
        description: "A list of exercises.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The name of the exercise."
            },
            description: {
              type: Type.STRING,
              description: "A brief, encouraging description."
            },
            sets: {
                type: Type.STRING,
                description: "Recommended sets."
            },
            reps: {
                type: Type.STRING,
                description: "Recommended reps."
            },
            instructions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "Simple step-by-step instructions."
            }
          },
          required: ["name", "description", "sets", "reps", "instructions"]
        }
      }
    },
    required: ["strategy", "exercises"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    return {
      strategy: parsed.strategy,
      exercises: parsed.exercises as Omit<Exercise, 'videoUrl' | 'isVideoLoading' | 'videoError'>[]
    };
  } catch (error) {
    console.error("Error generating workout from Gemini:", error);
    throw new Error("Failed to create workout.");
  }
};

/**
 * Search for an exercise detail in the dictionary.
 */
export const searchExerciseDetail = async (query: string): Promise<ExerciseDetail> => {
  const ai = getAiClient();
  const prompt = `Act as an expert fitness coach. Provide detailed information about the exercise: "${query}".
  
  Fields needed:
  1. Name: The standard name of the exercise.
  2. Muscle Group: The primary muscle targeted.
  3. Type: Strength, Hypertrophy, Mobility, etc.
  4. Description: A concise, clear guide on how to perform it correctly.

  Ensure the response is valid JSON.`;

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

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: schema }
  });

  return JSON.parse(response.text.trim());
};

/**
 * Step 1: Generate the Weekly Split (Titles and Basic Logic)
 */
const generateWeeklySplitStructure = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  const ai = getAiClient();
  const prompt = `Act as a world-class fitness coach. Create a 7-day workout split structure.
  CRITERIA:
  - Goal: ${config.goal.join(', ')}
  - Split Type: ${config.split}
  - Experience Level: ${config.level}
  - Training Frequency: ${config.daysPerWeek}
  - Location/Environment: ${config.environment}
  
  REQUIREMENTS:
  - Assign a simple, plain-language title to each of the 7 days (Monday-Sunday).
  - DO NOT use complex or scientific jargon in titles.
  - EXAMPLE: Use "Rest Day" instead of "Rest Recovery: Systemic Muscular Repair".
  - EXAMPLE: Use "Lower Body (Legs)" instead of "Leg Focus: Lower Body Compound Strength and Stability".
  - Ensure titles are clear and short (2-4 words).
  - Ensure rest/recovery days are strategically placed.
  - At this stage, only provide titles and empty activity arrays.

  Return valid JSON.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      Monday: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "activities"] },
      Tuesday: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "activities"] },
      Wednesday: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "activities"] },
      Thursday: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "activities"] },
      Friday: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "activities"] },
      Saturday: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "activities"] },
      Sunday: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "activities"] }
    },
    required: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: schema }
  });

  return JSON.parse(response.text.trim());
};

/**
 * Step 2: Generate Specific Exercises for a single day
 */
const generateDayActivities = async (dayTitle: string, config: WeeklyPlannerConfig): Promise<string[]> => {
  // If it's clearly a rest day, just give recovery activities
  const lowerTitle = dayTitle.toLowerCase();
  if (lowerTitle.includes('rest') || lowerTitle.includes('recovery') || lowerTitle.includes('off')) {
    return ["Light Stretching (10-15 mins)", "Active Recovery Walk", "Mobility Drills"];
  }

  const ai = getAiClient();
  const prompt = `As a professional trainer, list exactly 4-6 exercises for a training session titled: "${dayTitle}".
  USER PROFILE:
  - Goal: ${config.goal.join(', ')}
  - Level: ${config.level}
  - Equipment Available: ${config.environment}
  
  STRICT FITNESS PRINCIPLES:
  1. START with the most important heavy compound movements (appropriate for the equipment available).
  2. FOLLOW with accessory and isolation movements.
  3. Include sets and reps for each exercise in the string.
  4. Ensure volume is appropriate for ${config.level} level.
  5. If Home, only bodyweight. If Home Dumbbells, only dumbbells. If Gym, full access.
  
  Return a JSON array of strings. Each string should be "Exercise Name - Sets x Reps (Brief Tip)".`;

  const schema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: schema }
  });

  return JSON.parse(response.text.trim());
};

export const generateWeeklyPlan = async (config: WeeklyPlannerConfig): Promise<WeeklyPlan> => {
  try {
    // 1. Generate Split
    const split = await generateWeeklySplitStructure(config);
    
    // 2. Generate Exercises for each day independently to ensure high quality and detail
    const days = Object.keys(split);
    const dayResults = await Promise.all(days.map(async (day) => {
      const exercises = await generateDayActivities(split[day].title, config);
      return {
        day,
        title: split[day].title,
        activities: exercises
      };
    }));

    // Merge back into WeeklyPlan structure
    const fullPlan: WeeklyPlan = {};
    dayResults.forEach(res => {
      fullPlan[res.day] = { title: res.title, activities: res.activities };
    });

    return fullPlan;
  } catch (error) {
    console.error("Error in complex weekly plan generation:", error);
    throw new Error("Failed to create high-quality weekly plan.");
  }
};

export const generateHealthAnalysis = async (answers: HealthQuizData, bmi: number | null, healthScore: number): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    You are a friendly health and wellness coach. Provide a clear, helpful, and direct assessment of the user's habits.
    
    Use markdown for formatting. Use headings for sections and bullet points for lists.

    **User's Data:**
    - Exercise: ${answers.activity}
    - Sleep: ${answers.sleep}
    - Diet: ${answers.diet}
    - Stress: ${answers.stress}
    - Sugar: ${answers.intake}
    - Weight: ${answers.weight} kg
    - Height: ${answers.height} cm
    - Estimated Body Fat: ${answers.bodyFat}%
    - **Health Score**: **${healthScore}/100**
    - **BMI**: **${bmi ? bmi.toFixed(1) : 'N/A'}**

    **Structure:**
    1.  **Summary:** A clear, one-sentence summary of their current health.
    2.  **Your Score:** Explain what their score and BMI mean in simple terms.
    3.  **Habit Analysis:** A bulleted list looking at their answers. Explain how these habits affect their daily life in simple terms.
    4.  **Action Steps:** Provide 3 specific, simple things they can start today.
    5.  **Encouragement:** A short, motivating closing.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.5,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating health analysis from Gemini:", error);
    throw new Error("Failed to get analysis.");
  }
};

/**
 * Fetch a YouTube tutorial link for the exercise using Google Search grounding.
 */
export const generateExerciseVideo = async (exerciseName: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find a standard YouTube video link for a professional tutorial of the exercise: "${exerciseName}". Provide only the URL.`,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    // Extract URL from response text or grounding chunks
    const text = response.text || '';
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?([^#\&\?\s]*)/g;
    const match = text.match(youtubeRegex);
    
    if (match && match[0]) {
        return match[0];
    }

    // Fallback search in grounding chunks if text regex fails
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        for (const chunk of chunks) {
            if (chunk.web?.uri && (chunk.web.uri.includes('youtube.com') || chunk.web.uri.includes('youtu.be'))) {
                return chunk.web.uri;
            }
        }
    }

    throw new Error("YouTube video not found.");
  } catch(error) {
    console.error("Error fetching exercise video:", error);
    throw new Error(`Failed to find tutorial.`);
  }
};