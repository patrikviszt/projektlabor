import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, setDoc, doc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Exercise, UserData, WorkoutPlan, WorkoutSession } from '../user-data.model';

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
    const usersRef = collection(this.firestore, 'users'); 
    return new Observable<UserData | undefined>((observer) => {
        getDocs(usersRef).then((querySnapshot) => {
            let userData: UserData | undefined;
            querySnapshot.forEach((doc) => {
                const data = doc.data() as UserData;
                console.log('Document Data:', data); 
                if (data.email === email) {
                    userData = { ...data };
                    console.log('Retrieved User Data:', userData); 
                }
            });
            observer.next(userData);
            observer.complete();
        }).catch((error) => {
            console.error('Error fetching user data:', error);
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
  

  async updateWorkoutPlan(userEmail: string, workoutName: string, updatedExercises: any) {
    const workoutPlansRef = collection(this.firestore, 'workoutPlans');
    const q = query(workoutPlansRef, where('userEmail', '==', userEmail), where('workoutName', '==', workoutName));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const workoutPlanDocRef = doc(this.firestore, 'workoutPlans', docId);

       
        await updateDoc(workoutPlanDocRef, {
          exercises: updatedExercises
        });
        console.log('Workout plan updated successfully');
      } else {
        console.error('No workout plan found for update');
      }
    } catch (error) {
      console.error('Error updating workout plan:', error);
    }
  }
  async deleteWorkoutPlan(userEmail: string, workoutName: string) {
    const workoutPlansRef = collection(this.firestore, 'workoutPlans');
    const q = query(workoutPlansRef, where('userEmail', '==', userEmail), where('workoutName', '==', workoutName));
  
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const workoutPlanDocRef = doc(this.firestore, 'workoutPlans', docId);
        await deleteDoc(workoutPlanDocRef);
        console.log('Workout plan deleted successfully');
      } else {
        console.error('No workout plan found for deletion');
      }
    } catch (error) {
      console.error('Error deleting workout plan:', error);
    }
  }
  
  
  async deleteExercise(userEmail: string, workoutName: string, day: string, exerciseName: string) {
    const workoutPlansRef = collection(this.firestore, 'workoutPlans');
    const q = query(workoutPlansRef, where('userEmail', '==', userEmail), where('workoutName', '==', workoutName));
  
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const workoutPlanDocRef = doc(this.firestore, 'workoutPlans', docId);
  
        const workoutPlan = querySnapshot.docs[0].data() as WorkoutPlan;
  
       
        const dayExercises = workoutPlan.exercises.find(d => d.day === day);
  
        if (dayExercises) {
          
          dayExercises.exercises = dayExercises.exercises.filter(exercise => exercise.name !== exerciseName);
  
        
          await updateDoc(workoutPlanDocRef, {
            exercises: workoutPlan.exercises
          });
  
          console.log('Exercise removed successfully');
        } else {
          console.error(`No exercises found for day: ${day}`);
        }
      } else {
        console.error('No workout plan found for deleting exercise');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
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
                exercises: Array.isArray(exercises) ? exercises.map((exercise: any) => ({ 
                  name: exercise.name,
                  reps: exercise.reps,
                  sets: exercise.sets,
                })) : []
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
  
    const meals: { [key: string]: { breakfast: string; lunch: string; dinner: string } } = {};
  
    for (const day in dietData.dietPlan) {
      if (dietData.dietPlan.hasOwnProperty(day)) {
        const dailyMeals = dietData.dietPlan[day];
  
        meals[day] = {
          breakfast: dailyMeals[0] || '',
          lunch: dailyMeals[1] || '',
          dinner: dailyMeals[2] || '',
        };
      }
    }
  
    const dietPlanData = {
      userId: userId,
      userEmail: dietData.userEmail,
      dietPlanName: dietData.dietPlanName || `Étrend ${new Date().toISOString()}`,
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
              dietPlanName: data['dietPlanName'],
              selectedDay: data['selectedDay'],
              meals: data['meals'],
              createdAt: data['createdAt'].toDate(),
            });
          });
          
         
          dietPlans.sort((a, b) => {
            const dayA = new Date(a.selectedDay); 
            const dayB = new Date(b.selectedDay);
            return dayA.getTime() - dayB.getTime(); 
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
  
  async addWorkoutSession(userEmail: string, workoutName: string, sessionData: any) {
    const workoutSessionsCollection = collection(this.firestore, 'workoutSessions');
    

    const workoutSessionData = {
      userEmail: userEmail,
      workoutName: workoutName,
      exercises: sessionData.exercises.map((exercise: any) => ({
        name: exercise.name,
        reps: exercise.reps,
        sets: exercise.sets,
      })),
      duration: sessionData.duration,
      createdAt: new Date(),
    };

    try {
      await addDoc(workoutSessionsCollection, workoutSessionData);
      console.log('Workout session saved successfully!');
    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  }


  
}
