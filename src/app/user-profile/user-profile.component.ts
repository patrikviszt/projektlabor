import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserData, WorkoutPlan } from '../user-data.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  userData$: Observable<UserData | undefined> = of(undefined); 
  workoutPlans$: Observable<WorkoutPlan[]> = of([]);
  dietPlans$: Observable<any[]> = of([]);
  newExercise: any = { name: '', sets: 0, reps: 0 };
  firstName: string = '';
  lastName: string = '';
  email: string = '';

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
        if (user && user.email) {
            this.userData$ = this.firestoreService.getUserData(user.email);
            this.workoutPlans$ = this.firestoreService.getWorkoutPlans(user.email);
            this.dietPlans$ = this.firestoreService.getDietPlans(user.email);


            this.userData$.subscribe((userData) => {
                if (userData) {
                    this.firstName = userData.firstName; 
                    this.lastName = userData.lastName; 
                    this.email = userData.email;
                }
            });
        } else {
            this.userData$ = of(undefined);
            this.workoutPlans$ = of([]);
            this.dietPlans$ = of([]);
        }
    });
}

removeExercise(plan: WorkoutPlan, day: any, exerciseIndex: number) {
  day.exercises.splice(exerciseIndex, 1);
  this.updateWorkoutPlan(plan);
}

addExercise(plan: WorkoutPlan, day: any) {
  if (this.newExercise.name && this.newExercise.sets > 0 && this.newExercise.reps > 0) {
    day.exercises.push({ ...this.newExercise });
    this.newExercise = { name: '', sets: 0, reps: 0 };
    this.updateWorkoutPlan(plan);
  }
}

updateWorkoutPlan(plan: WorkoutPlan) {
  this.userData$.subscribe((userData) => {
    if (userData) {
      this.firestoreService.updateWorkoutPlan(userData.email, plan.workoutName, plan.exercises)
        .then(() => {
          console.log('Workout plan updated successfully');
        })
        .catch((error) => {
          console.error('Error updating workout plan:', error);
        });
    } else {
      console.error('No user data available for updating workout plan');
    }
  });
  
  
}
  getGoal(goal: string): string {
    return goal === 'weight_loss' ? 'Fogyás' : goal === 'muscle_gain' ? 'Izomépítés' : 'Erőnövelés';
  }
  
  getActivityLevel(level: string): string {
    return level === 'low' ? 'Alacsony' : level === 'medium' ? 'Közepes' : 'Magas';
  }
  
  getGender(gender: string): string {
    return gender === 'male' ? 'Férfi' : gender === 'female' ? 'Nő' : 'Egyéb';
  }
}
