export interface Muscle {
  name: string;
  id: string;
}

export interface BodyPart {
  name: string;
  id: string;
  muscles: Muscle[];
}

export interface Environment {
  name: string;
  id: string;
  description: string;
}

export interface Exercise {
  name: string;
  description: string;
  sets: string;
  reps: string;
  instructions: string[];
  videoUrl?: string;
  isVideoLoading?: boolean;
  videoError?: string | null;
}

export interface WorkoutPlan {
  strategy: string;
  exercises: Exercise[];
}

export interface User {
  id: string;
  email?: string;
}

export interface SavedWorkout {
  id: string;
  userId: string;
  timestamp: number;
  bodyPart: string;
  muscle: string;
  environment: string;
  plan: WorkoutPlan;
}

export interface DayPlan {
  title: string;
  activities: string[];
}

export interface WeeklyPlan {
  [key: string]: DayPlan;
}

export interface WeeklyPlannerConfig {
  goal: string[];
  split: string;
  level: string;
  daysPerWeek: string; // FIX: was 'number' but is actually a string like "4 Days Per Week"
  environment: string;
}

export interface HealthQuizData {
  activity: string;
  sleep: string;
  diet: string;
  stress: string;
  intake: string;
  weight: number;
  height: number;
  bodyFat: number;
}

export interface ExerciseDetail {
  name: string;
  muscleGroup: string;
  type: string;
  description: string;
}
