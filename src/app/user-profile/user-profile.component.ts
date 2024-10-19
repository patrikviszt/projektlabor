import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { map, Observable, of } from 'rxjs';
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
  editingPlans: WorkoutPlan[] = [];
  workoutPlans: WorkoutPlan[] = [];
  newExercise: any = { name: '', sets: undefined, reps: undefined };

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
        this.loadUserData(user.email);
      } else {
        this.resetUserData();
      }
    });
  }

  private loadUserData(email: string) {
    this.userData$ = this.firestoreService.getUserData(email);
    this.workoutPlans$ = this.firestoreService.getWorkoutPlans(email).pipe(
      map((plans) => {
        this.workoutPlans = plans; // Assign the fetched plans to the local array
        return plans;
      })
    );
    this.dietPlans$ = this.firestoreService.getDietPlans(email);

    // Subscribe to user data to set local variables
    this.userData$.subscribe((userData) => {
      if (userData) {
        this.firstName = userData.firstName;
        this.lastName = userData.lastName;
        this.email = userData.email;
      }
    });
  }

  private resetUserData() {
    this.userData$ = of(undefined);
    this.workoutPlans$ = of([]);
    this.dietPlans$ = of([]);
  }

  removeExercise(plan: WorkoutPlan, day: any, exerciseIndex: number) {
    day.exercises.splice(exerciseIndex, 1);
    this.updateWorkoutPlan(plan);
  }

  addExercise(plan: WorkoutPlan, day: any) {
    if (this.newExercise.name && this.newExercise.sets > 0 && this.newExercise.reps > 0) {
      day.exercises.push({ ...this.newExercise });
      this.updateWorkoutPlan(plan);
      this.newExercise = { name: '', sets: undefined, reps: undefined }; // Reset values to undefined
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

  removeWorkoutPlan(plan: WorkoutPlan, userEmail: string): void {
    if (!userEmail || !plan.workoutName) {
      console.error('User email or workout name is undefined.');
      return;
    }

    console.log('Removing workout plan:', plan);
    this.firestoreService.deleteWorkoutPlan(userEmail, plan.workoutName).then(() => {
      console.log('Workout plan removed successfully.');
      this.workoutPlans = this.workoutPlans.filter(p => p.workoutName !== plan.workoutName); // Remove from local array
      this.workoutPlans$ = of(this.workoutPlans); // Update observable
    }).catch(error => {
      console.error('Error removing workout plan:', error);
    });
  }

  isEditing(plan: WorkoutPlan): boolean {
    return this.editingPlans.includes(plan);
  }

  toggleEdit(plan: WorkoutPlan): void {
    if (this.isEditing(plan)) {
      this.editingPlans = this.editingPlans.filter(p => p !== plan);
    } else {
      this.editingPlans.push(plan);
    }
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
