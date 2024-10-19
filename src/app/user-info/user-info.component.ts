import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { SnackbarService } from '../services/snackbar.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./user-info.component.css'],
  standalone: true,
})
export class UserInfoComponent implements OnInit {
  step: number = 1;
  currentValid: boolean[] = Array(7).fill(false);

  mealTimes: string[] = ['Reggeli', 'Ebéd', 'Vacsora'];
  dietPlan: { [day: string]: string[] } = {};
  daysOfWeek: string[] = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

  userData: any = {
    email: '',
    weight: null,
    height: null,
    gender: '',
    age: null,
    goal: '',
    activityLevel: '',
    workoutPreference: ''
  };

  constructor(
    private firestoreService: FirestoreService,
    private snackbar: SnackbarService,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData.email = user.email; // Set email
      }
    });
  }

  nextStep() {
    console.log('Current step:', this.step, 'Valid:', this.currentValid[this.step - 1]);
    if (this.currentValid[this.step - 1]) {
      this.step++;
    }
  }
  
  previousStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  onInputChange() {
    this.validateCurrentStep();
  }

  submit() {
    if (this.validateInputs()) {
      this.generateDefaultWorkoutPlan();
      this.generateDefaultDietPlan(); // Diet plan generálása is
  
      this.firestoreService.addUserData(this.userData).then(() => {
        this.snackbar.open('Adatok sikeresen mentve!', 'Ok');
      }).catch((error) => {
        console.error('Hiba történt az adatok mentése közben:', error);
        this.snackbar.open('Hiba történt az adatok mentése közben!', 'Ok');
      });
    } else {
      this.snackbar.open('Kérjük, érvényes adatokat adj meg!', 'Ok');
    }
  }
  

  validateWeight(weight: number): boolean {
    return weight > 0 && weight <= 300; 
  }

  validateHeight(height: number): boolean {
    return height >= 30 && height <= 250;
  }

  validateAge(age: number): boolean {
    return age >= 1 && age <= 120; 
  }

  validateCurrentStep(): void {
    switch (this.step) {
      case 1:
        this.currentValid[0] = this.validateWeight(this.userData.weight);
        break;
      case 2:
        this.currentValid[1] = this.validateHeight(this.userData.height);
        break;
      case 3:
        this.currentValid[2] = this.validateAge(this.userData.age);
        break;
      case 4:
        this.currentValid[3] = this.userData.gender !== ''; 
        break;
      case 5:
        this.currentValid[4] = this.userData.goal !== ''; 
        break;
      case 6:
        this.currentValid[5] = this.userData.activityLevel !== '';
        break;
      case 7:
        this.currentValid[6] = this.userData.workoutPreference !== ''; 
        break;
      default:
        break;
    }
  }
  
  
  
  validateInputs(): boolean {
    return this.currentValid.every(valid => valid);
  }

  generateDefaultWorkoutPlan() {
    const { goal, activityLevel, gender, age, email, workoutPreference } = this.userData;
    const defaultPlan: { [key: string]: any[] } = {};
  
    // Generating a workout plan based on user goals and workout preference
    if (workoutPreference === 'home') {
      if (goal === 'muscle_gain') {
        defaultPlan['Hétfő'] = [
          { name: 'Fekvőtámasz', sets: 3, reps: 10 },
          { name: 'Lábtolás falnál', sets: 3, reps: 12 },
          { name: 'Törzsemelés', sets: 3, reps: 15 }
        ];
        defaultPlan['Szerda'] = [
          { name: 'Guggolás', sets: 3, reps: 15 },
          { name: 'Kitörés', sets: 3, reps: 12 },
          { name: 'Plank váltott karral', sets: 3, reps: 30 }
        ];
        defaultPlan['Péntek'] = [
          { name: 'Plank', sets: 3, reps: 60 },
          { name: 'Ollózás', sets: 3, reps: 20 },
          { name: 'Biciklizés fekvő helyzetben', sets: 3, reps: 20 }
        ];
      } else if (goal === 'weight_loss') {
        defaultPlan['Hétfő'] = [
          { name: 'Futás (helyben)', sets: 1, reps: 30 },
          { name: 'Ugrókötelezés', sets: 2, reps: 50 },
          { name: 'Fekvőtámasz', sets: 3, reps: 10 }
        ];
        defaultPlan['Szerda'] = [
          { name: 'Jumping Jacks', sets: 3, reps: 20 },
          { name: 'Mountain Climbers', sets: 3, reps: 20 },
          { name: 'Kitörés', sets: 3, reps: 15 }
        ];
        defaultPlan['Péntek'] = [
          { name: 'Burpees', sets: 3, reps: 10 },
          { name: 'Plank', sets: 3, reps: 40 },
          { name: 'High Knees', sets: 3, reps: 20 }
        ];
      } else if (goal === 'strength_gain') {
        defaultPlan['Hétfő'] = [
          { name: 'Húzódzkodás (súlyzók nélkül)', sets: 3, reps: 8 },
          { name: 'Kitörés', sets: 3, reps: 12 },
          { name: 'Fekvőtámasz (széles fogás)', sets: 3, reps: 10 }
        ];
        defaultPlan['Szerda'] = [
          { name: 'Kitörés', sets: 3, reps: 10 },
          { name: 'Plank váltott lábbal', sets: 3, reps: 30 },
          { name: 'Pike Push-up', sets: 3, reps: 8 }
        ];
        defaultPlan['Péntek'] = [
          { name: 'Fekvőtámasz (variációk)', sets: 3, reps: 10 },
          { name: 'Törzsemelés padon', sets: 3, reps: 12 },
          { name: 'Egykezes tolódzkodás székből', sets: 3, reps: 8 }
        ];
      }
    } else {
      // Gym workouts
      if (goal === 'muscle_gain') {
        defaultPlan['Hétfő'] = [
          { name: 'Fekvenyomás', sets: 3, reps: 10 },
          { name: 'Tolódzkodás', sets: 3, reps: 12 },
          { name: 'Bicepsz hajlítás súlyzóval', sets: 3, reps: 10 }
        ];
        defaultPlan['Szerda'] = [
          { name: 'Guggolás', sets: 3, reps: 12 },
          { name: 'Lábtolás gépen', sets: 3, reps: 12 },
          { name: 'Mellhez húzás széles fogással', sets: 3, reps: 10 }
        ];
        defaultPlan['Péntek'] = [
          { name: 'Húzódzkodás', sets: 3, reps: 8 },
          { name: 'Törzsemelés gépen', sets: 3, reps: 12 },
          { name: 'Kardió (futópad)', sets: 1, reps: 20 }
        ];
      } else if (goal === 'weight_loss') {
        defaultPlan['Hétfő'] = [
          { name: 'Futás', sets: 1, reps: 30 },
          { name: 'Elliptikus gép', sets: 1, reps: 30 },
          { name: 'Fekvőtámasz', sets: 3, reps: 12 }
        ];
        defaultPlan['Szerda'] = [
          { name: 'Kerékpározás', sets: 1, reps: 30 },
          { name: 'Jumping Jacks', sets: 3, reps: 25 },
          { name: 'Kitörés', sets: 3, reps: 15 }
        ];
        defaultPlan['Péntek'] = [
          { name: 'Evezőgép', sets: 1, reps: 20 },
          { name: 'Burpees', sets: 3, reps: 12 },
          { name: 'Plank', sets: 3, reps: 40 }
        ];
      } else if (goal === 'strength_gain') {
        defaultPlan['Hétfő'] = [
          { name: 'Deadlift', sets: 5, reps: 5 },
          { name: 'Bicepsz hajlítás rúddal', sets: 4, reps: 8 },
          { name: 'Evezés döntött törzzsel', sets: 4, reps: 8 }
        ];
        defaultPlan['Szerda'] = [
          { name: 'Guggolás', sets: 5, reps: 5 },
          { name: 'Lábtolás gépen', sets: 4, reps: 10 },
          { name: 'Húzódzkodás', sets: 3, reps: 8 }
        ];
        defaultPlan['Péntek'] = [
          { name: 'Vállból nyomás', sets: 5, reps: 5 },
          { name: 'Oldalemelés súlyzóval', sets: 4, reps: 10 },
          { name: 'Tolódzkodás', sets: 4, reps: 8 }
        ];
      }
    }
  
    const orderedDays = ['Hétfő', 'Szerda', 'Péntek'];
    const orderedDefaultPlan: { [key: string]: any[] } = {};
  
    for (const day of orderedDays) {
      orderedDefaultPlan[day] = defaultPlan[day] || [];
    }
  
    console.log('Generált alapértelmezett edzésterv:', orderedDefaultPlan);
  
    // Subscribe to the user's workout plans Observable
    this.firestoreService.getWorkoutPlans(email).subscribe((plans) => {
      const workoutNumber = plans.length + 1;
      const workoutName = `${workoutNumber === 1 ? 'Első' : workoutNumber === 2 ? 'Második' : `${workoutNumber}.`} edzéstervem`;
  
      // Save the workout plan to Firestore with the dynamically generated name
      this.firestoreService.addWorkoutPlan(email, {
        workoutName,
        workoutPlan: orderedDefaultPlan,
        selectedDays: orderedDays,
        userEmail: email
      }).then(() => {
        this.snackbar.open('Edzésterv sikeresen mentve!', 'Ok');
      }).catch((error) => {
        console.error('Hiba történt az edzésterv mentése közben:', error);
        this.snackbar.open('Hiba történt az edzésterv mentése közben!', 'Ok');
      });
    });
  }
  

  
// Étrendgeneráló


generateDefaultDietPlan() {
  const defaultDietPlan: { [day: string]: string[] } = {};

  const mealsMapping: { [goal: string]: { [mealTime: string]: string } } = {
    weight_loss: {
      Reggeli: 'Zabkása',
      Ebéd: 'Csirke rizs',
      Vacsora: 'Leves'
    },
    muscle_gain: {
      Reggeli: 'Tükörtojás',
      Ebéd: 'Tészta',
      Vacsora: 'Grillezett zöldségek'
    },
    healthy: {
      Reggeli: 'Gyümölcs smoothie',
      Ebéd: 'Quinoa saláta',
      Vacsora: 'Sült hal'
    }
  };

  for (const day of this.daysOfWeek) {
    defaultDietPlan[day] = [];
    const mealsForGoal = mealsMapping[this.userData.goal] || mealsMapping['healthy'];

    for (const mealTime of this.mealTimes) {
      const meal = mealsForGoal[mealTime];
      if (meal) {
        defaultDietPlan[day].push(meal);
      }
    }
  }

  this.dietPlan = defaultDietPlan;
  console.log('Generált étrend:', this.dietPlan);

  // Save the diet plan with a name
  this.saveDietPlan();
}







async saveDietPlan() {
  const userId = await this.authService.getUserId();
  const userEmail = await firstValueFrom(this.authService.getCurrentUserEmail());

  if (userId && userEmail && this.dietPlan) {
    const dietPlans = await firstValueFrom(this.firestoreService.getDietPlans(userEmail));
    const dietNumber = dietPlans.length + 1;
    const dietPlanName = dietNumber === 1 ? 'Első étrendem' : `${dietNumber}. étrendem`;

    const dietData = {
      userId,
      userEmail,
      dietPlanName,
      dietPlan: this.dietPlan,
      createdAt: new Date(),
    };

    if (Object.keys(this.dietPlan).length > 0) {
      this.firestoreService.addDietPlan(userId, dietData).then(() => {
        this.snackbar.open('Étrend sikeresen mentve!', 'Ok');
      }).catch((error: any) => {
        console.error('Hiba történt az étrend mentése közben:', error);
        this.snackbar.open('Hiba történt az étrend mentése közben!', 'Ok');
      });
    } else {
      console.error('A dietPlan üres, nem tud menteni.');
    }
  } else {
    console.error('Felhasználói ID vagy email hiányzik. Kérjük, győződjön meg arról, hogy a felhasználó be van jelentkezve.');
  }
}



}

