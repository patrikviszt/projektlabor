import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, setDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserData } from '../user-data.model';

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
        observer.next(userData); // Visszaadja a felhasználói adatokat
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
      userEmail: workoutData.userEmail,  // Including the user's email
      exercises: workoutData.workoutPlan, // The exercises array
      createdAt: new Date() // Save the creation date for reference
    };
  
    return addDoc(workoutPlansCollection, workoutPlanData);
  }
  getWorkoutPlans(userEmail: string): Observable<any[]> {
    const workoutPlansRef = collection(this.firestore, 'workoutPlans');
    const q = query(workoutPlansRef, where('userEmail', '==', userEmail));
    return new Observable<any[]>((observer) => {
      getDocs(q).then((querySnapshot) => {
        const workoutPlans: any[] = [];
        querySnapshot.forEach((doc) => {
          workoutPlans.push({ id: doc.id, ...doc.data() });
        });
        observer.next(workoutPlans);
        observer.complete();
      }).catch((error) => {
        console.error('Error fetching workout plans:', error);
        observer.next([]);
        observer.complete();
      });
    });
  }

  async addDietPlan(userId: string, dietData: any) {
    const dietPlansCollection = collection(this.firestore, 'dietPlans');
    const dietPlanData = {
      userId: userId,
      userEmail: dietData.userEmail,
      selectedDay: dietData.selectedDay, // A kiválasztott nap elmentése
      meals: {
        Reggeli: dietData.dietPlan.filter((meal: string) => meal.startsWith('Reggeli:')),
        Ebéd: dietData.dietPlan.filter((meal: string) => meal.startsWith('Ebéd:')),
        Vacsora: dietData.dietPlan.filter((meal: string) => meal.startsWith('Vacsora:')),
      },
      createdAt: new Date(),
    };

    try {
      await addDoc(dietPlansCollection, dietPlanData);
      console.log('Diet plan saved successfully!');
    } catch (error) {
      console.error('Error saving diet plan:', error);
    }
  }
}
