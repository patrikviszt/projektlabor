import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-workout-plan',
  templateUrl: './workout-plan.component.html',
  standalone: true,
  styleUrls: ['./workout-plan.component.css'],
  imports: [FormsModule, CommonModule],
})
export class WorkoutPlanComponent {
  bodyParts: string[] = ['Mell', 'Váll', 'Bicepsz', 'Tricepsz', 'Alkar', 'Láb', 'Has', 'Hát', 'Csuklya', 'Kardió'];
  workoutPlan: string[] = [];
  selectedPart: string | null = null;
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

  addToWorkout(exercise: string) {
    if (!this.workoutPlan.includes(exercise)) {
      this.workoutPlan.push(exercise);
    }
  }

  removeFromWorkout(exercise: string) {
    this.workoutPlan = this.workoutPlan.filter(item => item !== exercise);
  }

  async saveWorkoutPlan() {
    const userId = await this.authService.getUserId();
    const userEmail = await firstValueFrom(this.authService.getCurrentUserEmail());
  
    if (userId && userEmail) {
      const workoutData = {
        userId,
        userEmail,
        workoutPlan: this.workoutPlan,
      };
      this.firestoreService.addWorkoutPlan(userId, workoutData).then(() => {
        console.log('Workout plan saved successfully!');
        this.workoutPlan = []; 
      }).catch((error) => {
        console.error('Error saving workout plan:', error);
      });
    } else {
      console.error('User ID or email is missing. Please ensure the user is logged in.');
    }
  }
  
}
