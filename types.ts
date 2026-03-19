export interface Exercise {
  name: string;
  description: string;
  sets: string;
  reps: string;
  instructions: string[];
}

export interface WorkoutPlan {
  strategy: string;
  exercises: Exercise[];
}

export interface WeeklyPlan {
  [key: string]: {
    title: string;
    activities: string[];
  };
}

export interface WeeklyPlannerConfig {
  goal: string[];
  split: string;
  level: string;
  daysPerWeek: number;
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
