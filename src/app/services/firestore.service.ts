import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, setDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Exercise, UserData, WorkoutPlan } from '../user-data.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  addUserData(userData: any) {
    const userCollection = collection(this.firestore, 'users');
    return addDoc(userCollection, userData);
  }

  getUserData(email: string): Observable<UserData | undefined> {
    const usersRef = collection(this.firestore, 'users'); // 'users' kollekció
    return new Observable<UserData | undefined>((observer) => {
      getDocs(usersRef).then((querySnapshot) => {
        let userData: UserData | undefined;
        querySnapshot.forEach((doc) => {
          const data = doc.data() as UserData;
          if (data.email === email) {
            userData = { ...data };
          }
        });
        observer.next(userData); 
        observer.complete();
      }).catch((error) => {
        console.error('Hiba történt a felhasználói adatok lekérésekor:', error);
        observer.next(undefined);
        observer.complete();
      });
    });
  }
  addWorkoutPlan(userId: string, workoutData: any) {
    const workoutPlansCollection = collection(this.firestore, 'workoutPlans');
  

    const workoutPlanData = {
      userId: userId,
      userEmail: workoutData.userEmail,
      workoutName: workoutData.workoutName,
      exercises: workoutData.workoutPlan,
      selectedDays: workoutData.selectedDays || [],
      createdAt: new Date(),
    };
  
    return addDoc(workoutPlansCollection, workoutPlanData);
  }
  


  
  getWorkoutPlans(userEmail: string): Observable<WorkoutPlan[]> { 
    const workoutPlansRef = collection(this.firestore, 'workoutPlans');
    const q = query(workoutPlansRef, where('userEmail', '==', userEmail));
    return new Observable<WorkoutPlan[]>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          const workoutPlans: WorkoutPlan[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Workout Plan Data:', data); 
            workoutPlans.push({
              workoutName: data['workoutName'],
              exercises: Object.entries(data['exercises']).map(([day, exercises]) => ({
                day,
                exercises: (exercises as Exercise[]).map((exercise: any) => ({ 
                  name: exercise.name,
                  reps: exercise.reps,
                  sets: exercise.sets,
                })),
              })),
              createdAt: data['createdAt'].toDate(), 
            });
          });
          observer.next(workoutPlans);
          observer.complete();
        })
        .catch((error) => {
          console.error('Error fetching workout plans:', error);
          observer.next([]);
          observer.complete();
        });
    });
  }
  
  

  async addDietPlan(userId: string, dietData: any) {
    const dietPlansCollection = collection(this.firestore, 'dietPlans');
    
   
    const meals = {
      breakfast: dietData.dietPlan.filter((meal: string) => meal.startsWith('Reggeli:')).map((meal: string) => meal.replace('Reggeli: ', '')),
      lunch: dietData.dietPlan.filter((meal: string) => meal.startsWith('Ebéd:')).map((meal: string) => meal.replace('Ebéd: ', '')),
      dinner: dietData.dietPlan.filter((meal: string) => meal.startsWith('Vacsora:')).map((meal: string) => meal.replace('Vacsora: ', '')),
    };
  
    const dietPlanData = {
      userId: userId,
      userEmail: dietData.userEmail,
      selectedDay: dietData.selectedDay,
      meals: meals, 
      createdAt: new Date(),
    };
  
    try {
      await addDoc(dietPlansCollection, dietPlanData);
      console.log('Diet plan saved successfully!');
    } catch (error) {
      console.error('Error saving diet plan:', error);
    }
  }
  
  getDietPlans(userEmail: string): Observable<any[]> {
    const dietPlansRef = collection(this.firestore, 'dietPlans');
    const q = query(dietPlansRef, where('userEmail', '==', userEmail));
    return new Observable<any[]>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          const dietPlans: any[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            dietPlans.push({
              selectedDay: data['selectedDay'],
              meals: data['meals'], 
              createdAt: data['createdAt'].toDate(), 
            });
          });
          observer.next(dietPlans);
          observer.complete();
        })
        .catch((error) => {
          console.error('Error fetching diet plans:', error);
          observer.next([]);
          observer.complete();
        });
    });
  }
}
