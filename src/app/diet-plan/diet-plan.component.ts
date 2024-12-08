import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-diet-plan',
  templateUrl: './diet-plan.component.html',
  standalone: true,
  styleUrls: ['./diet-plan.component.css'],
  imports: [FormsModule, CommonModule],
})
export class DietPlanComponent implements OnInit {
  daysOfWeek: string[] = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
  mealTimes: string[] = ['Reggeli', 'Ebéd', 'Vacsora'];
  dietName: string = '';
  showSuccessModal: boolean = false;
  showModal: boolean = false;  // A modális ablak megjelenítése
  errorMessage: string = '';   // Hibaüzenet, ha nem adják meg az étrend nevét
  dietPlan: { name: string, calories: number }[] = []; // Explicit típus megadása
  mealCalories: { [key: string]: number } = {}; // Kalória értékek tárolása ételenként
  mealData: { [key: string]: any } = {}; // Étellel kapcsolatos adatokat tárolunk
  selectedMealTime: string | null = null;
  selectedDay: string | null = null;
  selectedMeal: string | null = null; // Aktuálisan kiválasztott étel
  meals: any = {
    Reggeli: ['Scrambled eggs', 'Ham sandwich', 'Pancakes', 'Sausages', ],
    Ebéd: ['Chicken rice', 'Spaghetti bolognese', 'Chicken salad', 'Caesar salad', 'Pepperoni pizza', 'Meatballs', 'Tofu', 'Sushi'],
    Vacsora: ['Grilled cheese sandwich', 'Grilled vegetables', 'Sandwich', 'Boiled eggs', 'Yoghurt'],
  };

  private apiKey: string = 'KpSqEUoQpkm61puzpSGKTg==9BjkRqrU73LDSZfp'; // API kulcs

  constructor(private httpClient: HttpClient, private firestoreService: FirestoreService, private authService: AuthService) {}

  ngOnInit(): void {
    // Opció: Beállíthatod az alapértelmezett napot, ha szükséges
    if (!this.selectedDay) {
      this.selectedDay = this.daysOfWeek[0]; // Például a Hétfőt választjuk alapértelmezettnek
    }
  }

  // API hívás egy étel kalóriáinak lekérdezésére
  getMealCalories(meal: string) {
    const apiUrl = `https://api.calorieninjas.com/v1/nutrition?query=${meal}`;
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey, // Az API kulcs itt szerepel
    });
  
    this.httpClient.get<any>(apiUrl, { headers }).subscribe((data) => {
      if (data && data.items && data.items.length > 0) {
        // Az API válaszában az étel adatainak tárolása
        this.mealData[meal] = {
          calories: data.items[0].calories,
          serving_size_g: data.items[0].serving_size_g,
          fat_total_g: data.items[0].fat_total_g,
          protein_g: data.items[0].protein_g,
          sodium_mg: data.items[0].sodium_mg,
          potassium_mg: data.items[0].potassium_mg,
          cholesterol_mg: data.items[0].cholesterol_mg,
          carbohydrates_total_g: data.items[0].carbohydrates_total_g,
          fiber_g: data.items[0].fiber_g,
          sugar_g: data.items[0].sugar_g,
        };
        console.log('API hivasa sikeres -1 ');
      } else {
        console.log('Nem található kalória adat az ételhez');
      }
    }, error => {
      console.error('Hiba az API hívásban:', error);
    });
  }
  
  // Az étel kiválasztásakor hívjuk meg a kalória lekérést
  selectMeal(meal: string) {
    this.selectedMeal = meal;
  
    // Ellenőrizzük, hogy az étel adatai már lekérésre kerültek-e
    if (!this.mealData[meal]) {
      this.getMealCalories(meal); // Ha még nem történt adatlekérés, kérjük le az adatokat
    }
  }

  // Nap kiválasztása
  selectDay(day: string) {
    this.selectedDay = this.selectedDay === day ? null : day;
    this.selectedMealTime = null;
    this.dietPlan = [];
    this.selectedMeal = null; // Reset selected meal
  }

  // Étkezés típusának kiválasztása
  toggleMealTime(mealTime: string) {
    if (this.selectedDay) {
      this.selectedMealTime = this.selectedMealTime === mealTime ? null : mealTime;
    }
  }

  addToDiet(meal: string, calories: number) {
    const existingMeal = this.dietPlan.find(m => m.name === meal);
    if (!existingMeal) {
      this.dietPlan.push({ name: meal, calories: calories });
    } else {
      // Üzenet beállítása és modális megjelenítése
      this.errorMessage = `A(z) "${meal}" már szerepel az étrendedben!`;
      this.showModal = true;
    }
  }
  

  // Ételt eltávolítani a diétából
  removeFromDiet(meal: { name: string, calories: number }) {
    const index = this.dietPlan.indexOf(meal);
    if (index !== -1) {
      this.dietPlan.splice(index, 1);
    }
  }

  // Étrend mentése a Firestore-ba
  async saveDietPlan() {
    if (!this.dietName || this.dietPlan.length === 0) {
      // Ha nincs étrend név vagy étel, akkor megjelenítjük a hibát
      this.errorMessage = "Kérjük, add meg az étrend nevét és adj hozzá ételt a tervhez.";
      this.showModal = true;  // Megjelenítjük a modális ablakot
      return;
    }
    const userId = await this.authService.getUserId();
    const userEmail = await firstValueFrom(this.authService.getCurrentUserEmail());

    if (userId && userEmail && this.selectedDay) {
      const dietData = {
        userId,
        userEmail,
        dietPlan: this.dietPlan,
        selectedDay: this.selectedDay,
      };
      this.firestoreService.addDietPlan(userId, dietData).then(() => {
        console.log('Diet plan saved successfully!');
        this.dietPlan = [];
        this.selectedDay = null;
      }).catch((error: any) => {
        console.error('Error saving diet plan:', error);
      });
    } else {
      console.error('User ID, email, or day is missing. Please ensure the user is logged in and a day is selected.');
    }
  }

  getTotalCalories() {
    return this.dietPlan.reduce((total, meal) => total + meal.calories, 0);
  }

  closeModal() {
    this.showModal = false; // Bezárja a modális ablakot
  }

  async saveCostumDiet(dietName: string) {
    if (!this.dietName || this.dietPlan.length === 0) {
      // Ha nincs étrend név vagy étel, akkor megjelenítjük a hibát
      this.errorMessage = "Kérjük, add meg az étrend nevét az étrend mentéséhez.";
      this.showModal = true;  // Megjelenítjük a modális ablakot
      return;
    }
  
    const userId = await this.authService.getUserId();
    const userEmail = await firstValueFrom(this.authService.getCurrentUserEmail());
    const totalCalories = this.dietPlan.reduce((sum, meal) => sum + meal.calories, 0);
  
    if (!userId || !userEmail) {
      console.error('Felhasználó azonosítója vagy email címe nem található.');
      return;
    }
  
    const costumDietData = {
      userId,
      userEmail,
      dietName: this.dietName,
      meals: this.dietPlan,
      totalCalories
    };
  
    console.log('Costum Diet to Save:', costumDietData);
    
    try {
      // Az étrend mentése a Firestore-ba
      await this.firestoreService.addCostumDiet(userId, costumDietData);
      console.log('Costum Diet saved successfully!');
  
      // Sikeres mentés esetén modális ablak megjelenítése
      this.showSuccessModal = true;
  
      // Oldal resetelése
      this.resetPage();
    } catch (error) {
      console.error('Error saving Costum Diet', error);
    }
  }
  
  // Oldal resetelése
  resetPage() {
    this.dietName = '';
    this.selectedDay = null;
    this.selectedMealTime = null;
    this.selectedMeal = null;
    this.dietPlan = [];
  }
  
  // Modális ablak bezárása
  closeSuccessModal() {
    this.showSuccessModal = false;
  }
  translations: { [key: string]: string } = {
    'Scrambled eggs': 'Rántotta',
    'Ham sandwich': 'Sonkás szendvics',
    'Pancakes': 'Palacsinta',
    'Sausages': 'Kolbász',
    'Chicken rice': 'Csirke rizs',
    'Spaghetti bolognese': 'Bolognai spagetti',
    'Chicken salad': 'Csirke saláta',
    'Caesar salad': 'Cézár saláta',
    'Pepperoni pizza': 'Pepperoni pizza',
    'Meatballs': 'Húsgombóc',
    'Tofu': 'Tofu',
    'Sushi': 'Sushi',
    'Grilled cheese sandwich': 'Grillezett sajtos szendvics',
    'Grilled vegetables': 'Grillezett zöldségek',
    'Sandwich': 'Szendvics',
    'Boiled eggs': 'Főtt tojás',
    'Yoghurt': 'Joghurt',
  };
  translateMeal(meal: string): string {
    return this.translations[meal] || meal;
  }
  
  
}



