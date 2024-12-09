import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { map, Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserData, WorkoutPlan, WorkoutSession } from '../user-data.model';
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
  private dayOrder = ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'];
  workoutPlans$: Observable<WorkoutPlan[]> = of([]);
  dietPlans$: Observable<any[]> = of([]);
  editingPlans: WorkoutPlan[] = [];
  workoutPlans: WorkoutPlan[] = [];
  workoutSessions$: Observable<WorkoutSession[]> = new Observable();
  costumDiet:[]=[];
  favRecipes$: Observable<any[]> = of([]);
  costumDiets$: Observable<any[]> = of([]);  stepCount: number = 0;
  selectedInstruction: string = ''; 
  isModalOpen = false;
goalSteps: number = 10000;
  newExercise: any = { name: '', sets: undefined, reps: undefined };
  meals: any[] = [];
sections = {
    data: false,
    workouts: false,
    diets: false
  };
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
        this.firestoreService.getWorkoutSessions(user.email).subscribe(sessions => {
          console.log('Workout Sessions:', sessions);
        });
      } else {
        this.resetUserData();
      }
    });
    this.startStepCounter();
  }
  

  private loadUserData(email: string) {
    this.userData$ = this.firestoreService.getUserData(email);
    this.favRecipes$ = this.firestoreService.getFavRecipes(email);
    this.costumDiets$ = this.firestoreService.getCostumDiet(email);
    this.workoutSessions$ = this.firestoreService.getWorkoutSessions(email);

    this.workoutPlans$ = this.firestoreService.getWorkoutPlans(email).pipe(
      map((plans) => {
        this.workoutPlans = plans;
        return plans;
      })
    );
    this.dietPlans$ = this.firestoreService.getDietPlans(email).pipe(
      map((plans) => {
        return plans.map(plan => ({
          ...plan,
          sortedMeals: this.sortDays(plan.meals)
        }));
      })
    );
    
    
   

    this.userData$.subscribe((userData) => {
      if (userData) {
        this.firstName = userData.firstName;
        this.lastName = userData.lastName;
        this.email = userData.email;
      }
    });
  }
  openModal(instruction: string) {
    this.selectedInstruction = instruction;
    this.isModalOpen = true;
  }
  
  closeModal() {
    this.isModalOpen = false;
  }
  private sortDays(meals: { [key: string]: any }): any[] {
    const sortedMeals: any[] = [];
  
    Object.keys(meals)
      .sort((a, b) => this.dayOrder.indexOf(a.toLowerCase()) - this.dayOrder.indexOf(b.toLowerCase()))
      .forEach(key => {
        sortedMeals.push({ day: key, ...meals[key] }); 
      });
  
    return sortedMeals;
  }
  
  startStepCounter() {
    if ('Accelerometer' in window) {
      try {
        const accelerometer = new (window as any).Accelerometer({ frequency: 10 });
        let previousY: number | null = null;
        let stepThreshold = 1.2; // Érzékenység beállítása
  
        accelerometer.addEventListener('reading', () => {
          if (previousY !== null && Math.abs(accelerometer.y - previousY) > stepThreshold) {
            this.stepCount++;
          }
          previousY = accelerometer.y;
        });
  
        accelerometer.start();
      } catch (error) {
        console.error('Accelerometer initialization failed:', error);
      }
    } else {
      console.error('Accelerometer API is not supported on this device');
    }
  }
  viewRecipe(recipe: any) {
    // Here you can display the recipe instructions in a modal or a new view
    alert(`Recept: ${recipe.recipeName}\n\n${recipe.instructions}`);
  }

  private resetUserData() {
    this.userData$ = of(undefined);
    this.workoutPlans$ = of([]);
    this.favRecipes$ = of([]);
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
      this.newExercise = { name: '', sets: undefined, reps: undefined };
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
      this.workoutPlans = this.workoutPlans.filter(p => p.workoutName !== plan.workoutName); 
      this.workoutPlans$ = of(this.workoutPlans); 
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
