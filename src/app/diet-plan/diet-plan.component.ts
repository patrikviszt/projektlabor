import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom, Subscribable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { HomeComponent } from '../home/home.component';
import { User } from '@angular/fire/auth';
@Component({
  selector: 'app-diet-plan',
  templateUrl: './diet-plan.component.html',
  standalone: true,
  styleUrls: ['./diet-plan.component.css'],
  imports: [FormsModule, CommonModule],
})
export class DietPlanComponent implements OnInit {
  daysOfWeek: string[] = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];
  mealTimes: string[] = ['Reggeli', 'Ebéd', 'Vacsora'];
  dietName: string = '';
  selectedRecipe:any=null;
  favRecipes: boolean=false;
  showSuccessModal: boolean = false;
  showModal: boolean = false;  // A modális ablak 
  errorMessage: string = '';   
  dietPlan: { name: string, calories: number }[] = []; 
  mealCalories: { [key: string]: number } = {}; 
  mealData: { [key: string]: any } = {}; 
  selectedMealTime: string | null = null;
  selectedDay: string | null = null;
  selectedMeal: string | null = null; 
  mealAmounts: { [key: string]: number } = {};
  costumDiet:[]=[];
  email: string='';
  showRecipeDetails:boolean=false;
  
  currentView: string = 'diet-creation'; 
  meals: any = {
    Reggeli: ['Scrambled eggs', 'Ham sandwich', 'Pancakes', 'Sausages', ],
    Ebéd: ['Chicken rice', 'Spaghetti bolognese', 'Chicken salad', 'Caesar salad', 'Pepperoni pizza', 'Meatballs', 'Tofu', 'Sushi'],
    Vacsora: ['Grilled cheese sandwich', 'Grilled vegetables', 'Sandwich', 'Boiled eggs', 'Yoghurt'],
  };
  
  private apiKey: string = 'KpSqEUoQpkm61puzpSGKTg==9BjkRqrU73LDSZfp'; // API kulcs
  costumDiets$: Observable<any[]> = of([]);  stepCount: number = 0;
  favRecipes$: Observable<any[]> = of([]);
  afAuth: any;
  
  constructor(private httpClient: HttpClient, private firestoreService: FirestoreService, private authService: AuthService,) {}
  




  ngOnInit(): void {
    this.authService.user$.subscribe((user: User | null) => {
      if (user && user.email) {
        this.email = user.email; 
        //this.loadUserData(user.email); // Felhasználói adat betöltése
        this.costumDiets$ = this.firestoreService.getCostumDiet(this.email);
      } else {
        //this.resetUserData(); // Ha nincs bejelentkezett felhasználó, alapértelmezett adatokat állítunk
      }
    });
  }




  
  /*ngOnInit(): void {
    if (!this.selectedDay) {
      this.selectedDay = this.daysOfWeek[0]; // Például a Hétfőt választjuk alapértelmezettnek
    }
  }*/

  // API hívás egy étel kalóriáinak lekérdezésére
  getMealCalories(meal: string, amount?: number) {
    const query = amount ? `${amount}g ${meal}` : meal; // Gramm hozzáadása a kéréshez
    const apiUrl = `https://api.calorieninjas.com/v1/nutrition?query=${query}`;
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey,
    });
  
    this.httpClient.get<any>(apiUrl, { headers }).subscribe(
      (data) => {
        if (data && data.items && data.items.length > 0) {
          // Étkezési adatok tárolása
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
        } else {
          console.warn(`Nincs adat az ételhez: ${meal}`);
        }
      },
      (error) => {
        console.error('Hiba az API hívásban:', error);
      }
    );
  }
  
  selectMeal(meal: string) {
    this.selectedMeal = meal;
  
    if (!this.mealData[meal]) {
      this.getMealCalories(meal); 
    }
  }

  setMealAmount(meal:string, amount: number){
    this.mealAmounts[meal]=amount;
  }

  addMeal(meal: string) {
    const amount = this.mealAmounts[meal]; 
    this.getMealCalories(meal, amount); // API hívás az adott mennyiséggel
  }

  selectDay(day: string) {
    this.selectedDay = this.selectedDay === day ? null : day;
    this.selectedMealTime = null;
    this.dietPlan = [];
    this.selectedMeal = null; 
  }

  toggleMealTime(mealTime: string) {
    if (this.selectedDay) {
      this.selectedMealTime = this.selectedMealTime === mealTime ? null : mealTime;
    }
  }

  addToDiet(meal: string, calories: number) {
    const existingMeal = this.dietPlan.find((m) => m.name === meal);
    if (!existingMeal) {
      this.dietPlan.push({ name: meal, calories });
    } else {
      this.errorMessage = `A(z) "${meal}" már szerepel az étrendedben!`;
      this.showModal = true;
    }
  }
  

  removeFromDiet(meal: { name: string, calories: number }) {
    const index = this.dietPlan.indexOf(meal);
    if (index !== -1) {
      this.dietPlan.splice(index, 1);
    }
  }

  async saveDietPlan() {
    if (!this.dietName || this.dietPlan.length === 0) {
      
      this.errorMessage = "Kérjük, add meg az étrend nevét és adj hozzá ételt a tervhez.";
      this.showModal = true;  
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
    return Math.round(this.dietPlan.reduce((total, meal) => total + meal.calories, 0));
  }

  

  async saveCostumDiet(dietName: string) {
    if (!this.dietName || this.dietPlan.length === 0) {
      this.errorMessage = "Kérjük, add meg az étrend nevét az étrend mentéséhez.";
      this.showModal = true;  
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
      totalCalories,
      selectedDay: this.selectedDay
    };
  
    console.log('Costum Diet to Save:', costumDietData);
    
    try {
      await this.firestoreService.addCostumDiet(userId, costumDietData);
      console.log('Costum Diet saved successfully!');
  
      this.showSuccessModal = true;
  
      this.resetPage();
    } catch (error) {
      console.error('Error saving Costum Diet', error);
    }
  }
  
  resetPage() {
    this.dietName = '';
    this.selectedDay = null;
    this.selectedMealTime = null;
    this.selectedMeal = null;
    this.dietPlan = [];
  }
  
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
  



  

  switchToMain(): void {
    this.currentView = 'diet-creation';  
    console.log('Switching to main view');
  }

  switchToCustomDiets(): void {
    console.log('Switching to custom diets view');
    console.log('Current user email:', this.email);  
    if (!this.email) {
      console.error('No email available');  
      return;
    }
  
    this.costumDiets$ = this.firestoreService.getCostumDiet(this.email);
    this.currentView = 'diet-display';
    this.costumDiets$.subscribe({
      next: (costumDiets) => {
        console.log('Received custom diets:', costumDiets);  
      },
      error: (error) => {
        console.error('Error in getting custom diets:', error);  
      }
    });
  }

  switchToRecipes(): void {
    this.currentView = 'recipes';  
    this.favRecipes$ = this.firestoreService.getFavRecipes(this.email);

    console.log('Switching to recipes view');
  }
  
  viewRecipe(recipe: any) {
    console.log('Recept részletek:', recipe);
    this.selectedRecipe = recipe;
    console.log('Selected Recipe in viewRecipe:', this.selectedRecipe);  
    this.showRecipeDetails = true;
  }

  closeModal() {
    this.showRecipeDetails = false;
    this.selectedRecipe = null;  
  }
  
}