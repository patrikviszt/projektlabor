import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-diet-plan',
  templateUrl: './diet-plan.component.html',
  standalone: true,
  styleUrls: ['./diet-plan.component.css'],
  imports: [FormsModule, CommonModule],
})
export class DietPlanComponent {
  // Hét napjai
  daysOfWeek: string[] = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
  // Étkezési időpontok
  mealTimes: string[] = ['Reggeli', 'Ebéd', 'Vacsora'];
  dietPlan: string[] = [];
  selectedMealTime: string | null = null;
  selectedDay: string | null = null; // Kiválasztott nap tárolása

  // Ételek listája étkezési időpontok szerint
  meals: any = {
    Reggeli: ['Zabkása', 'Tükörtojás', 'Szendvics'],
    Ebéd: ['Csirke rizs', 'Tészta', 'Saláta'],
    Vacsora: ['Leves', 'Grillezett zöldségek', 'Tojásrántotta']
  };

  constructor(private firestoreService: FirestoreService, private authService: AuthService) {}

   // Nap kiválasztása
   selectDay(day: string) {
    this.selectedDay = this.selectedDay === day ? null : day;
    this.selectedMealTime = null; // Ha új napot választunk, állítsuk vissza az étkezési időpontot
    this.dietPlan = []; // Új nap kiválasztásakor ürítsük ki az étrendet
  }

  // Étkezési időpont kiválasztása
  toggleMealTime(mealTime: string) {
    if (this.selectedDay) {
      this.selectedMealTime = this.selectedMealTime === mealTime ? null : mealTime;
    }
  }

  // Étel hozzáadása az étrendhez
  addToDiet(meal: string) {
    if (this.selectedMealTime && this.selectedDay) {
      const formattedMeal = `${this.selectedMealTime}: ${meal}`;
      if (!this.dietPlan.includes(formattedMeal)) {
        this.dietPlan.push(formattedMeal);
      }
    }
  }
  

  // Étel eltávolítása az étrendből
  removeFromDiet(meal: string) {
    this.dietPlan = this.dietPlan.filter(item => item !== meal);
  }

   // Étrend mentése a Firestore-ba
   async saveDietPlan() {
    const userId = await this.authService.getUserId();
    const userEmail = await firstValueFrom(this.authService.getCurrentUserEmail());

    if (userId && userEmail && this.selectedDay) {
      const dietData = {
        userId,
        userEmail,
        dietPlan: this.dietPlan,
        selectedDay: this.selectedDay, // A kiválasztott nap elmentése
      };
      this.firestoreService.addDietPlan(userId, dietData).then(() => {
        console.log('Diet plan saved successfully!');
        this.dietPlan = [];
        this.selectedDay = null; // Nap visszaállítása
      }).catch((error: any) => {
        console.error('Error saving diet plan:', error);
      });
    } else {
      console.error('User ID, email, or day is missing. Please ensure the user is logged in and a day is selected.');
    }
  }
}
