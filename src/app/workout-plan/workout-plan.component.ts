import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { WorkoutPlan, WorkoutSession } from '../user-data.model';

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
  isCreatingWorkout: boolean = false;
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

  constructor(private firestoreService: FirestoreService, private authService: AuthService) {}
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
    this.isCreatingWorkout = !this.isCreatingWorkout;
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
  startWorkoutForDay(day: any) {
    // Set the current workout for the selected day
    this.currentWorkout = day.exercises.map((exercise: { name: any; sets: any; reps: any; }) => ({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      completedReps: 0
    }));
    
    this.currentExercise = this.currentWorkout[0].name;  // Set the first exercise as the current exercise
    this.remainingTime = 30;  // Set the initial remaining time for the exercise
    this.isWorkoutStarted = true;  // Start the workout
    console.log('Edzés indítása a következő napra:', day.day);
    console.log('Aktuális edzés:', this.currentExercise);
    this.startTimer();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.completeExercise();
      }
    }, 1000);
  }

  completeExercise() {
    clearInterval(this.timer);
    const currentIndex = this.currentWorkout.findIndex(workout => workout.name === this.currentExercise);
    if (currentIndex < this.currentWorkout.length - 1) {
      this.currentExercise = this.currentWorkout[currentIndex + 1].name;
      this.remainingTime = 30;
      this.startTimer();
    } else {
      this.isWorkoutStarted = false;
    }
  }
  nextExercise() {
    const currentIndex = this.currentWorkout.findIndex(workout => workout.name === this.currentExercise);
  
    // Ha nincs több gyakorlat, fejezd be az edzést
    if (currentIndex < this.currentWorkout.length - 1) {
      this.currentExercise = this.currentWorkout[currentIndex + 1].name;
      this.remainingTime = 30; // újraindítjuk a timer-t
      this.startTimer();
    } else {
      this.endWorkout(); // Ha vége az edzésnek, fejezd be
    }
  }
  
  endWorkout() {
    this.isWorkoutStarted = false;
    this.currentWorkout = [];
    this.remainingTime = 0;
    clearInterval(this.timer); // Állítsuk le a timer-t
    alert('Az edzés befejeződött!'); // Jelzést adunk, hogy vége a munkamenetnek
    this.saveWorkoutSession(); 
  }
  
  async saveWorkoutSession() {
    const userId = await this.authService.getUserId();
    const userEmail = await firstValueFrom(this.authService.getCurrentUserEmail());
  
    console.log('Debug - Workout Session Fields:', {
      userId,
      userEmail,
      workoutName: this.workoutName,
      selectedDay: this.selectedDay,
      currentWorkout: this.currentWorkout
    });
  
    if (!this.workoutName.trim() || !this.selectedDay || !userId || !userEmail) {
      console.error('Missing required fields in workout session:', {
        workoutName: this.workoutName,
        selectedDay: this.selectedDay,
        userId,
        userEmail,
      });
      return;
    }
  
    const workoutSession: WorkoutSession = {
      userId,
      userEmail,
      workoutName: this.workoutName,
      day: this.selectedDay,
      date: new Date(),
      exercises: this.currentWorkout.map(exercise => ({
        name: exercise.name,
        completedSets: exercise.sets,
        completedReps: exercise.completedReps ?? exercise.reps,
      })),
    };
  
    try {
      await this.firestoreService.addWorkoutSession(workoutSession);
      console.log('Workout session saved successfully');
    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  }
  
  
}
