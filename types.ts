// Fix: Define the AIStudio interface to be used for window.aistudio typing.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

export type UserRole = 'free' | 'pro' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: number;
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
  daysPerWeek: string;
  environment: string;
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

export interface Exercise {
  name: string;
  description: string;
  instructions: string[];
  sets: string;
  reps: string;
  videoUrl?: string;
  isVideoLoading?: boolean;
  videoError?: string | null;
}

export interface ExerciseDetail {
  name: string;
  muscleGroup: string;
  type: string;
  description: string;
}

export interface WorkoutPlan {
  strategy: string;
  exercises: Exercise[];
}

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

export interface HealthQuizData {
  activity: string;
  sleep: string;
  diet: string;
  stress: string;
  intake: string;
  weight: string;
  height: string;
  bodyFat: string;
}