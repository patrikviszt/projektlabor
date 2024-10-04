import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

interface Workout {
  name: string;
  sets: number;
  reps: number;
}

@Component({
  selector: 'app-workout-plan',
  templateUrl: './workout-plan.component.html',
  standalone: true,
  styleUrls: ['./workout-plan.component.css'],
  imports: [FormsModule, CommonModule],
})
export class WorkoutPlanComponent {
  bodyParts: string[] = ['Mell', 'Váll', 'Bicepsz', 'Tricepsz', 'Alkar', 'Láb', 'Has', 'Hát', 'Csuklya', 'Kardió'];
  days: string[] = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
  workoutPlan: { [key: string]: Workout[] } = {};
  workoutName: string = '';
  selectedPart: string | null = null;
  selectedDay: string | null = null;
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

  constructor(private firestoreService: FirestoreService, private authService: AuthService) {}

  toggleExercises(part: string) {
    this.selectedPart = this.selectedPart === part ? null : part;
  }

  selectDay(day: string) {
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
  
}
