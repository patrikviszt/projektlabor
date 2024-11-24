import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { WorkoutPlan, WorkoutSession } from '../user-data.model';
import { Router } from '@angular/router';

interface Workout {
  name: string;
  sets: number;
  reps: number;
  completedReps?: number;
}

@Component({
  selector: 'app-workout-plan',
  templateUrl: './workout-plan.component.html',
  standalone: true,
  styleUrls: ['./workout-plan.component.css'],
  imports: [FormsModule, CommonModule],
})
export class WorkoutPlanComponent implements OnInit{
  bodyParts: string[] = ['Mell', 'Váll', 'Bicepsz', 'Tricepsz', 'Alkar', 'Láb', 'Has', 'Hát', 'Csuklya', 'Kardió'];
  days: string[] = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
  workoutPlan: { [key: string]: Workout[] } = {};
  workoutName: string = '';
  showWorkoutPlans = false;
  selectedPart: string | null = null;
  isCreatingWorkoutPlan: boolean = false;
  selectedDay: string | null = null;
  userWorkoutPlans: WorkoutPlan[] = [];
  exercises: any = {
    Mell: ['Fekvenyomás', 'Tárogatás', 'Tolódzkodás'],
    Váll: ['Vállból nyomás', 'Oldalemelés', 'Előreemelés'],
    Bicepsz: ['Bicepsz állva', 'Koncentrált bicepsz'],
    Tricepsz: ['Letolás', 'Szűknyomás', 'Francia rúd'],
    Alkar: ['Alkarhajlítás', 'Csuklóforgatás'],
    Láb: ['Guggolás', 'Kitörés', 'Lábtolás'],
    Has: ['Hasprés', 'Lábemelés', 'Plank'],
    Hát: ['Húzódzkodás', 'Evezés', 'Deadlift'],
    Csuklya: ['Vállvonogatás', 'Evezés csuklyára'],
    Kardió: ['Futás', 'Kerékpározás', 'Evezőgép'],
  };
  currentWorkout: Workout[] = [];
  currentExercise: string = '';
  isWorkoutStarted = false;
  remainingTime: number = 0;
  timer: any;

  constructor(private firestoreService: FirestoreService,private router: Router, private authService: AuthService) {}
  ngOnInit(): void {
    console.log('Workout plan:', this.workoutPlan);

    this.authService.getCurrentUserEmail().subscribe(email => {
      if (email) {
        this.firestoreService.getWorkoutPlans(email).subscribe(plans => {
          this.userWorkoutPlans = plans;
        });
      }
    });
  }
  toggleExercises(part: string) {
    this.selectedPart = this.selectedPart === part ? null : part;
  }

  selectDay(day: string) {
    console.log(`Selected day: ${day}`);  
    this.selectedDay = day;
  }
  

  addToWorkout(day: string, exercise: string) {
    if (!this.workoutPlan[day]) {
      this.workoutPlan[day] = [];
    }

    if (!this.workoutPlan[day].some(workout => workout.name === exercise)) {
      this.workoutPlan[day].push({ name: exercise, sets: 3, reps: 10 });
    }
  }

  removeFromWorkout(day: string, exerciseName: string) {
    if (this.workoutPlan[day]) {
      this.workoutPlan[day] = this.workoutPlan[day].filter(workout => workout.name !== exerciseName);
    }
  }

  async saveWorkoutPlan() {
    const userId = await this.authService.getUserId();
    const userEmail = await firstValueFrom(this.authService.getCurrentUserEmail());
  
    if (!this.workoutName || this.workoutName.trim() === '') {
      console.error('Workout name is missing.');
      return;
    }
  
    if (userId && userEmail) {
   
      const workoutData = {
        userId,
        userEmail,
        workoutName: this.workoutName,
        workoutPlan: this.workoutPlan, 
        selectedDays: Object.keys(this.workoutPlan), 
      };
  
      console.log('Workout Data to Save:', workoutData); 
  // Ez menti el a firestoreba a workout planeket
      this.firestoreService.addWorkoutPlan(userId, workoutData).then(() => {
        console.log('Workout plan saved successfully!');
        this.workoutPlan = {};
        this.workoutName = '';
      }).catch((error) => {
        console.error('Error saving workout plan:', error);
      });
    } else {
      console.error('User ID or email is missing. Please ensure the user is logged in.');
    }
  }
  toggleCreateWorkoutPlan() {
    this.isCreatingWorkoutPlan = !this.isCreatingWorkoutPlan;
  }

  viewWorkoutPlans(): void {
    this.showWorkoutPlans = !this.showWorkoutPlans;
    if (this.showWorkoutPlans) {
      // Optional: Refresh workout plans data from Firestore
      this.authService.getCurrentUserEmail().subscribe(email => {
        if (email) {
          this.firestoreService.getWorkoutPlans(email).subscribe(plans => {
            this.userWorkoutPlans = plans;
          });
        }
      });
    }
  }
  // startWorkoutForDay(day: any) {
  //   // Set the current workout for the selected day
  //   this.currentWorkout = day.exercises.map((exercise: { name: any; sets: any; reps: any; }) => ({
  //     name: exercise.name,
  //     sets: exercise.sets,
  //     reps: exercise.reps,
  //     completedReps: 0
  //   }));
    
  //   this.currentExercise = this.currentWorkout[0].name;  
  //   this.remainingTime = 30;  
  //   this.isWorkoutStarted = true;  
  //   console.log('Edzés indítása a következő napra:', day.day);
  //   console.log('Aktuális edzés:', this.currentExercise);
  //   this.startTimer();
  // }
  startWorkoutForDay(day: any) {
  
    this.currentWorkout = day.exercises.map((exercise: { name: any; sets: any; reps: any; }) => ({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      completedReps: 0
    }));
    
 
    this.router.navigate(['/workout-session'], {
      queryParams: {
        day: day.day,
        exercises: JSON.stringify(day.exercises)
      }
    });

    console.log('Edzés indítása a következő napra:', day.day);
    console.log('Aktuális edzés:', this.currentWorkout);
}


  
  
}
