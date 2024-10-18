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
        this.userData.email = user.email; // Email cím beállítása
      }
    });
  }

  nextStep() {
    if (this.step < 7) {
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
    const { goal, activityLevel, gender, age, email, workoutPreference } = this.userData;
    const defaultPlan: { [key: string]: any[] } = {};
  
    // Generating a workout plan based on user goals and workout preference
    if (workoutPreference === 'home') {
      if (goal === 'muscle_gain') {
        defaultPlan['Hétfő'] = [{ name: 'Fekvőtámasz', sets: 3, reps: 10 }]; // Push-ups
        defaultPlan['Szerda'] = [{ name: 'Guggolás', sets: 3, reps: 15 }]; // Squats
        defaultPlan['Péntek'] = [{ name: 'Plank', sets: 3, reps: 30 }]; // Plank hold in seconds
      } else if (goal === 'weight_loss') {
        defaultPlan['Hétfő'] = [{ name: 'Futás (helyben)', sets: 1, reps: 30 }]; // Running in place
        defaultPlan['Szerda'] = [{ name: 'Jumping Jacks', sets: 3, reps: 20 }];
        defaultPlan['Péntek'] = [{ name: 'Burpees', sets: 3, reps: 10 }];
      } else if (goal === 'strength_gain') {
        defaultPlan['Hétfő'] = [{ name: 'Húzódzkodás (súlyzók nélkül)', sets: 3, reps: 8 }]; // Bodyweight pull-ups
        defaultPlan['Szerda'] = [{ name: 'Kitörés', sets: 3, reps: 10 }]; // Lunges
        defaultPlan['Péntek'] = [{ name: 'Fekvőtámasz (variációk)', sets: 3, reps: 8 }]; // Push-ups (variations)
      }
    } else {
      // Gym workouts
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
    }
  
    const orderedDays = ['Hétfő', 'Szerda', 'Péntek'];
    const orderedDefaultPlan: { [key: string]: any[] } = {};
  
    for (const day of orderedDays) {
      orderedDefaultPlan[day] = defaultPlan[day];
    }
  
    console.log('Generált alapértelmezett edzésterv:', orderedDefaultPlan);
  
    // Save the workout plan to Firestore
    this.firestoreService.addWorkoutPlan(email, {
      workoutName: 'Alapértelmezett edzésterv',
      workoutPlan: orderedDefaultPlan,
      selectedDays: orderedDays,
      userEmail: email
    }).then(() => {
      this.snackbar.open('Edzésterv sikeresen mentve!', 'Ok');
    }).catch((error) => {
      console.error('Hiba történt az edzésterv mentése közben:', error);
      this.snackbar.open('Hiba történt az edzésterv mentése közben!', 'Ok');
    });
  }
  
  
  
}
