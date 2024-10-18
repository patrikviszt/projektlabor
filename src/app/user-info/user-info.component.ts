import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { SnackbarService } from '../services/snackbar.service';
import { AuthService } from '../services/auth.service'; // Firebase Auth Service

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./user-info.component.css'],
  standalone: true,
})
export class UserInfoComponent implements OnInit {
  step: number = 1;  
  userData: any = {
    email: '', 
    weight: null,
    height: null,
    gender: '',
    age: null,
    goal: '',
    activityLevel: ''
  };

  constructor(
    private firestoreService: FirestoreService,
    private snackbar: SnackbarService,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData.email = user.email; // Email cím beállítása
      }
    });
  }

  nextStep() {
    if (this.step < 6) {
      this.step++;
    }
  }

  previousStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  submit() {
    // Call the function to generate a default workout plan
    this.generateDefaultWorkoutPlan();
  
    // Save the user data to Firestore
    this.firestoreService.addUserData(this.userData).then(() => {
      this.snackbar.open('Adatok sikeresen mentve!', 'Ok'); 
    }).catch((error) => {
      console.error('Hiba történt az adatok mentése közben:', error);
      this.snackbar.open('Hiba történt az adatok mentése közben!', 'Ok');
    });
  }
  
  
  generateDefaultWorkoutPlan() {
    const { goal, activityLevel, gender, age, email } = this.userData;
    const defaultPlan: { [key: string]: any[] } = {};
  
    // Generating a workout plan based on user goals
    if (goal === 'muscle_gain') {
      defaultPlan['Hétfő'] = [{ name: 'Fekvenyomás', sets: 3, reps: 10 }];
      defaultPlan['Szerda'] = [{ name: 'Guggolás', sets: 3, reps: 12 }];
      defaultPlan['Péntek'] = [{ name: 'Húzódzkodás', sets: 3, reps: 8 }];
    } else if (goal === 'weight_loss') {
      defaultPlan['Hétfő'] = [{ name: 'Futás', sets: 1, reps: 30 }];
      defaultPlan['Szerda'] = [{ name: 'Kerékpározás', sets: 1, reps: 30 }];
      defaultPlan['Péntek'] = [{ name: 'Evezőgép', sets: 1, reps: 20 }];
    } else if (goal === 'strength_gain') {
      defaultPlan['Hétfő'] = [{ name: 'Deadlift', sets: 5, reps: 5 }];
      defaultPlan['Szerda'] = [{ name: 'Guggolás', sets: 5, reps: 5 }];
      defaultPlan['Péntek'] = [{ name: 'Vállból nyomás', sets: 5, reps: 5 }];
    }
  
    // Logging the generated workout plan for debugging
    console.log('Generált alapértelmezett edzésterv:', defaultPlan);
  
    // Save the workout plan to Firestore
    this.firestoreService.addWorkoutPlan(email, {
      workoutName: 'Alapértelmezett edzésterv',
      workoutPlan: defaultPlan,
      selectedDays: Object.keys(defaultPlan),  // Passing the selected days
      userEmail: email // Ensure the email is passed correctly
    }).then(() => {
      this.snackbar.open('Edzésterv sikeresen mentve!', 'Ok');
    }).catch((error) => {
      console.error('Hiba történt az edzésterv mentése közben:', error);
      this.snackbar.open('Hiba történt az edzésterv mentése közben!', 'Ok');
    });
  }
  
  
}
