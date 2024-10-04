// user-data.model.ts
export interface UserData {
    weight: number;
    height: number;
    age: number;
    email:string;
    goal: string;
    activityLevel: string;
  }
  export interface Exercise {
    name: string;
    reps: number;
    sets: number;
  }
  
  export interface DayExercises {
    day: string;
    exercises: Exercise[];
  }
  
  export interface WorkoutPlan {
    workoutName: string;
    exercises: DayExercises[];
    createdAt: Date;
  }