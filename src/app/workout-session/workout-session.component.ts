import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timer } from 'rxjs';
import { WorkoutSession } from '../user-data.model';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './workout-session.component.html',
  styleUrls: ['./workout-session.component.css']
})
export class WorkoutSessionComponent implements OnInit {
  selectedDay: string = 'Hétfő';
  exercises: any[] = []; 
  elapsedTime: number = 0; 
  isWorkoutStarted: boolean = false; 
  isPaused: boolean = false;
  completedWorkout: boolean = false;
  workoutResults: any[] = []; 
  userEmail: string = '';
  saveStatus: { success: boolean, message: string } | null = null;

  private workoutTimer$: any;

  constructor(private route: ActivatedRoute,private firestoreService: FirestoreService, private authService: AuthService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedDay = params['day']; 
      this.exercises = JSON.parse(params['exercises']); 
      
      this.workoutResults = this.exercises.map(exercise => ({
        name: exercise.name,
        sets: Array(exercise.sets).fill(0), 
        reps: Array(exercise.sets).fill(0)  
      }));
    });

    this.elapsedTime = 0;
    this.authService.getCurrentUserEmail().subscribe(email => {
      if (email) {
        this.userEmail = email;
      } else {
        console.error('Nincs bejelentkezett felhasználó');
      }
    });
  
  }
  isWorkoutValid(): boolean {
    return this.workoutResults.every(result => result.sets > 0 && result.reps > 0);
  }
  startWorkout() {
    if (this.isWorkoutStarted) {
      return; 
    }

    this.isWorkoutStarted = true;
    this.isPaused = false;
    this.workoutTimer$ = timer(0, 1000).subscribe(() => {
      this.elapsedTime++;
    });
  }

  pauseWorkout() {
    this.isPaused = true;
    if (this.workoutTimer$) {
      this.workoutTimer$.unsubscribe();
    }
  }

  resumeWorkout() {
    this.isPaused = false;
    this.startWorkout();
  }

  endWorkout() {
    this.isWorkoutStarted = false;
    this.completedWorkout = true;
    if (this.workoutTimer$) {
      this.workoutTimer$.unsubscribe(); 
    }
  }

  resetWorkout() {
    this.completedWorkout = false;
    this.elapsedTime = 0; 
    this.isWorkoutStarted = false;
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;
    return `${minutes} p, ${seconds} mp`;
  }


  saveResults() {
    console.log('Felhasználói eredmények:', this.workoutResults);

  }
  saveWorkoutSession() {
    if (!this.isWorkoutValid()) {
      this.saveStatus = { success: false, message: 'Valami még nincs kitöltve. Kérlek, töltsd ki a szettek és ismétlések számát!' };
      return;
    }

    const workoutSessionData = {
      exercises: this.workoutResults.map(exercise => ({
        name: exercise.name,
        reps: exercise.reps,
        sets: exercise.sets,
      })),
      duration: this.elapsedTime / 60,
      createdAt: new Date(),
    };

    const workoutName = `${this.selectedDay} edzésterv`;

    this.firestoreService.addWorkoutSession(this.userEmail, workoutName, workoutSessionData)
      .then(() => {
        this.saveStatus = { success: true, message: 'Edzés sikeresen mentve!' };
      })
      .catch(error => {
        this.saveStatus = { success: false, message: 'Hiba történt az edzés mentése során.' };
      });
  }
  
}
