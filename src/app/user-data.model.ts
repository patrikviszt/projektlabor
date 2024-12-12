// user-data.model.ts
export interface UserData {
userEmail: WorkoutPlan;
    bmi: any;
    updatedWeight: any;
    firstName: string;
    lastName: string;
    weight: number;
    height: number;
    age: number;
    email:string;
    gender: string;
    goal: string;
    activityLevel: string;
    workoutType: string;
    
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
  export interface WorkoutSession {
    userEmail: string;
    workoutName: string;
    day: string;
    exercises: { name: string, reps: number, sets: number }[];
    sessionDate: any; 
    createdAt: Date;
    duration: number; 
  }
  
  