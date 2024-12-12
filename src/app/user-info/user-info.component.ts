import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { SnackbarService } from '../services/snackbar.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

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
  dataExists: boolean = false;
  userData: any = {
    email: '',
    weight: null,
    height: null,
    gender: '',
    age: null,
    goal: '',
    activityLevel: '',
    workoutPreference: '',
    bmi:''
  };

  constructor(
    private firestoreService: FirestoreService,
    private snackbar: SnackbarService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.email) { 
        this.userData.email = user.email;
        this.firestoreService.checkUserDataExists(user.email).then(exists => {
          this.dataExists = exists;
console.log('Profile exists:', this.dataExists);

          if (this.dataExists) {
            this.snackbar.open('Már létezik profil az email-címhez.', 'Ok');
            this.router.navigate(['/userprofile']); 
          }
        });
      } else {
        this.snackbar.open('Felhasználói email nem érhető el.', 'Ok');
        this.router.navigate(['/login']); 
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
      this.generateDefaultDietPlan();
      this.calculateBMI();
  
      this.firestoreService.addUserData(this.userData).then(() => {
        this.snackbar.open('Adatok sikeresen mentve!', 'Ok');
      }).catch((error) => {
        console.error('Hiba történt az adatok mentése közben:', error);
        this.snackbar.open('Hiba történt az adatok mentése közben!', 'Ok');
      });
    } else {
      this.snackbar.open('Kérjük, érvényes adatokat adj meg!', 'Ok');
    }
    this.router.navigate(['/home']);
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
  

    this.firestoreService.getWorkoutPlans(email).subscribe((plans) => {
      const workoutNumber = plans.length + 1;
      const workoutName = `${workoutNumber === 1 ? 'Első' : workoutNumber === 2 ? 'Második' : `${workoutNumber}.`} edzéstervem`;
  
  
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
  

  



  generateDefaultDietPlan() {
    const defaultDietPlan: { [day: string]: string[] } = {};
  
    const mealsMapping: { [goal: string]: { [activityLevel: string]: { [mealTime: string]: string[] } } } = {
      weight_loss: {
        low: {
          Reggeli: ['Zabkása', 'Gyümölcs turmix', 'Főtt tojás', 'Joghurt granolával', 'Túrós piték', 'Teljes kiőrlésű pirítós avokádóval', 'Almával töltött túró', 'Omelette', 'Főtt tojásos saláta', 'Kávé mandulatejjel'],
          Ebéd: ['Csirke rizs', 'Grillezett lazac', 'Sült zöldségek', 'Grillezett pulyka', 'Töltött paprika', 'Cukkinis rakottas', 'Zöldség curry', 'Quinoa saláta', 'Zöldséges rizs', 'Csirke saláta'],
          Vacsora: ['Leves', 'Saláta tonhallal', 'Zöldségleves', 'Tonhal saláta', 'Töltött paradicsom', 'Könnyű zöldséges pörkölt', 'Fokhagymás zöldségek', 'Vörös lencse leves', 'Párolt zöldségek', 'Sült hal salátával']
        },
        medium: {
          Reggeli: ['Zabkása', 'Avokádós pirítós', 'Gyümölcs smoothie', 'Képviselőfánk', 'Kókuszos túró', 'Banános palacsinta', 'Pancake', 'Zöldséges omlett', 'Görög joghurt', 'Túrós palacsinta'],
          Ebéd: ['Csirke quinoa', 'Grillezett hal', 'Pulyka saláta', 'Sült pulyka', 'Csirke steak', 'Lazacos wrap', 'Grillezett csirke wrap', 'Tenger gyümölcsei saláta', 'Saláta pulykával', 'Sült zöldségek'],
          Vacsora: ['Könnyű zöldség leves', 'Töltött paprika', 'Saláta fetával', 'Tonhal pörkölt', 'Fűszeres túró', 'Rizstészta pulykával', 'Grillezett zöldségek', 'Töltött padlizsán', 'Cukkini lecsó', 'Sült tofu']
        },
        high: {
          Reggeli: ['Főtt tojás', 'Gyümölcs turmix', 'Kétszersült', 'Müzli', 'Túrós piték', 'Almával töltött túró', 'Kávé tejhabbal', 'Rántotta szalonnával', 'Avokádós smoothie', 'Tükörtojás'],
          Ebéd: ['Csirke saláta', 'Grillezett pulyka', 'Sült zöldségek', 'Grillezett lazac', 'Lazacos wrap', 'Quinoa saláta', 'Grillezett zöldségek', 'Fűszeres csirke', 'Fokhagymás hal', 'Zöldséges pulyka pörkölt'],
          Vacsora: ['Leves', 'Zöldséges wrap', 'Pikáns tonhal saláta', 'Grillezett csirke', 'Csirke saláta', 'Grillezett lazac', 'Sült brokkoli', 'Quinoa és zöldség tál', 'Saláta tonhallal', 'Sült pulyka']
        }
      },
      muscle_gain: {
        low: {
          Reggeli: ['Tükörtojás', 'Fehérjeturmix', 'Rántotta', 'Omelette', 'Túró', 'Kétszersült túróval', 'Főtt tojásos saláta', 'Túróval töltött palacsinta', 'Túrós palacsinta', 'Banános zabkása'],
          Ebéd: ['Tészta', 'Csirke steak', 'Marha steak', 'Grillezett csirke', 'Füstölt hal', 'Köleses pulyka', 'Grillezett lazac', 'Burgonyás rakottas', 'Tojásos saláta', 'Sült marha'],
          Vacsora: ['Grillezett zöldségek', 'Sült csirke', 'Omelette', 'Túró', 'Tésztasaláta', 'Sült lazac', 'Fehérjés wrap', 'Pulyka ragu', 'Zöldséges rizottó', 'Marhahúsos rakottas']
        },
        medium: {
          Reggeli: ['Fehérjeturmix', 'Rántotta', 'Tükörtojás', 'Zabkása fehérjével', 'Banános palacsinta', 'Grillezett sajt', 'Főtt tojás', 'Fűszeres túró', 'Fehérje shake', 'Túró rudi'],
          Ebéd: ['Marha steak', 'Grillezett csirke', 'Tészta pulykával', 'Grillezett lazac', 'Marha pörkölt', 'Rizs csirkével', 'Pulyka steak', 'Marhasült', 'Grillezett hal', 'Quinoa saláta'],
          Vacsora: ['Tökéletes zöldségek', 'Sült marha', 'Sült csirke', 'Fűszeres lazac', 'Csirke wrap', 'Marhasült', 'Grillezett csirke', 'Túrós palacsinta', 'Fehérjeturmix', 'Grillezett pulyka']
        },
        high: {
          Reggeli: ['Omelette', 'Főtt tojás', 'Fehérjeturmix', 'Rántotta', 'Baconos tojás', 'Zabkása fehérjével', 'Kókuszos tojás', 'Banános shake', 'Almás túró', 'Túrókrém'],
          Ebéd: ['Marha steak', 'Grillezett csirke', 'Pulykás tészta', 'Lazac steak', 'Sült marha', 'Tészta pulykával', 'Csirke saláta', 'Grillezett hal', 'Pulykás wrap', 'Fűszeres marha'],
          Vacsora: ['Sült csirke', 'Grillezett lazac', 'Marha saláta', 'Sült pulyka', 'Marhás pörkölt', 'Grillezett csirke saláta', 'Marha burger', 'Túróval töltött csirke', 'Pulykás rakottas', 'Zöldséges lazac']
        }
      },
      healthy: {
        low: {
          Reggeli: ['Gyümölcs smoothie', 'Zabkása dióval', 'Avokádós pirítós', 'Teljes kiőrlésű pirítós', 'Túrós zabkása', 'Müzli', 'Tojásos saláta', 'Főtt tojás', 'Rántotta', 'Almával túró'],
          Ebéd: ['Quinoa saláta', 'Grillezett csirke saláta', 'Zöldséges wrap', 'Vega burger', 'Grillezett pulyka', 'Csirke tál zöldségekkel', 'Sült lazac', 'Zöldséges saláta', 'Hummuszos wrap', 'Töltött paprika'],
          Vacsora: ['Sült hal', 'Töltött paprika', 'Sütőtökkrémleves', 'Töltött cukkini', 'Zöldségleves', 'Grillezett pulyka', 'Zöldség pörkölt', 'Töltött paradicsom', 'Quinoa zöldségekkel', 'Párolt zöldségek']
        },
        medium: {
          Reggeli: ['Zabkása', 'Sült tojás', 'Töltött avokádó', 'Banános palacsinta', 'Müzli', 'Zöldséges omlett', 'Túróval töltött pirítós', 'Zöldséges tojás', 'Tökéletes zabkása', 'Gyümölcsös joghurt'],
          Ebéd: ['Csirke saláta', 'Kéksajtos zöldségek', 'Zöldségleves', 'Sült lazac', 'Saláta zöldségekkel', 'Hummuszos wrap', 'Quinoa wrap', 'Cézár saláta', 'Zöldség curry', 'Pulyka saláta'],
          Vacsora: ['Grillezett csirke', 'Saláta zöldségekkel', 'Töltött paprika', 'Zöldséges rizs', 'Töltött cukkini', 'Grillezett pulyka', 'Töltött gomba', 'Sült zöldségek', 'Minestrone leves', 'Fűszeres tofu']
        },
        high: {
          Reggeli: ['Sült tojás', 'Sült avokádó', 'Gyümölcsös zabkása', 'Kókuszos túró', 'Banános zabkása', 'Tökéletes smoothie', 'Müzli', 'Avokádós pirítós', 'Friss gyümölcs', 'Pancake'],
          Ebéd: ['Csirke wrap', 'Grillezett lazac', 'Kéksajtos saláta', 'Lazacos tészta', 'Töltött paprika', 'Quinoa saláta', 'Fűszeres hal', 'Töltött padlizsán', 'Sült csirke', 'Zöldség tál'],
          Vacsora: ['Töltött paprika', 'Zöldségleves', 'Sült hal', 'Sütőtökkrémleves', 'Fűszeres csirke', 'Zöldséges wrap', 'Sült csirke saláta', 'Fokhagymás zöldségek', 'Grillezett lazac', 'Zöldséges pörkölt']
        }
      }
    };
  
    
    const { bmi, activity_level } = this.userData;
  
    let goal = 'healthy'; 
    if (bmi >= 25) {
      goal = 'weight_loss'; 
    } else if (bmi <= 18.5) {
      goal = 'muscle_gain'; 
    }
  
    
    const mealsForGoalAndActivity = mealsMapping[goal][activity_level] || mealsMapping['healthy']['medium'];
  
    for (const day of this.daysOfWeek) {
      defaultDietPlan[day] = [];
      for (const mealTime of this.mealTimes) {
        const mealOptions = mealsForGoalAndActivity[mealTime];
        if (mealOptions && mealOptions.length > 0) {
          const randomMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];
          defaultDietPlan[day].push(randomMeal);
        }
      }
    }
  
    this.dietPlan = defaultDietPlan;
    console.log('Generált étrend:', this.dietPlan);
  
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


async calculateBMI() {
  const { weight, height, email } = this.userData;

  if (weight && height) {
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    this.userData.bmi = bmi.toFixed(2); 

    console.log(`Kiszámított BMI: ${this.userData.bmi}`);

    
    try {
      await this.firestoreService.updateBMI(email, parseFloat(this.userData.bmi));
      console.log('BMI sikeresen frissítve a Firestore-ban!');
    } catch (error) {
      console.error('Hiba történt a BMI frissítésekor:', error);
    }

  } else {
    console.error('Súly vagy magasság hiányzik a BMI számításhoz.');
  }
}












}

