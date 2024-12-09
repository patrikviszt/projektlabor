import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, setDoc, doc, updateDoc, deleteDoc, getDoc, QuerySnapshot, Timestamp } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Exercise, UserData, WorkoutPlan, WorkoutSession } from '../user-data.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  afAuth: any;
  constructor(private firestore: Firestore) {}

  addUserData(userData: any) {
    const userCollection = collection(this.firestore, 'users');
    return addDoc(userCollection, userData);
  }
  checkUserDataExists(email: string): Promise<boolean> {
    const userDataCollection = collection(this.firestore, 'users');
    const q = query(userDataCollection, where('email', '==', email));
  
    return getDocs(q)
      .then((snapshot) => !snapshot.empty)
      .catch((error) => {
        console.error('Error checking user data existence:', error);
        return false;
      });
  }
  

  getUserData(email: string): Observable<UserData | undefined> {
    const usersRef = collection(this.firestore, 'users');
    const userDataRef = collection(this.firestore, 'userData');
    
    return new Observable<UserData | undefined>((observer) => {
      getDocs(usersRef).then((querySnapshotUsers) => {
        let userData: UserData | undefined;
        
        querySnapshotUsers.forEach((doc) => {
          const data = doc.data() as UserData;
          console.log('Users Collection Data:', data); 
          
          if (data.email === email) {
            userData = { ...data };
          }
        });

        // Ha van userData, akkor lekérjük a 'userData' kollekció adatokat
        if (userData) {
          getDocs(userDataRef).then((querySnapshotUserData) => {
            querySnapshotUserData.forEach((doc) => {
              const data = doc.data() as UserData;
              console.log('UserData Collection Data:', data);
              if (data.email === email) {
                userData = { ...userData, ...data }; // Egyesítjük a két adatot
              }
            });

            observer.next(userData); // Visszaadjuk az egyesített adatokat
            observer.complete();
          }).catch((error) => {
            console.error('Error fetching user data from userData collection:', error);
            observer.next(undefined);
            observer.complete();
          });
        } else {
          observer.next(undefined);
          observer.complete();
        }
      }).catch((error) => {
        console.error('Error fetching user data from users collection:', error);
        observer.next(undefined);
        observer.complete();
      });
    });
  }
// getUserData2(email: string): Observable<UserData | undefined> {
//   const usersRef = collection(this.firestore, 'userData'); 
//   return new Observable<UserData | undefined>((observer) => {
//       getDocs(usersRef).then((querySnapshot) => {
//           let userData: UserData | undefined;
//           querySnapshot.forEach((doc) => {
//               const data = doc.data() as UserData;
//               console.log('Document Data:', data); 
//               if (data.email === email) {
//                   userData = { ...data };
//                   console.log('Retrieved User Data:', userData); 
//               }
//           });
//           observer.next(userData);
//           observer.complete();
//       }).catch((error) => {
//           console.error('Error fetching user data:', error);
//           observer.next(undefined);
//           observer.complete();
//       });
//   });
// }

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
  async addCostumDiet(userId: string, costumDietData:any){
    const costumDietCollection = collection(this.firestore, 'CostumDiets')
    const CostumDiets2={
      userId: userId,
      userEmail: costumDietData.userEmail,
      dietName: costumDietData.dietName,
      meals: costumDietData.meals,
      totalCalories: costumDietData.totalCalories,
      createdAt: new Date(),
    };
    try{
      await addDoc(costumDietCollection,costumDietData);
      console.log('Costum Diet saved successfully!');
    }catch(error){
      console.error('Error saving costum diet:',error);
    }
    
  }


  
 /* async saveFavoriteRecipe(recipeName: string, userEmail: string): Promise<void> {
    const favoritesCollection = collection(this.firestore, 'favorites');
    await addDoc(favoritesCollection, {
      recipeName,
      userEmail,
      createdAt: new Date(),
    });
  }*/
  //Recept hozzáadása


async addFavRecipe(userId: string, recipeData: any){
  const favRecipeCollection = collection(this.firestore, 'favRecipes');
  const recipeData2 ={
    userId: userId,
    userEmail: recipeData.userEmail,
    recipeName: recipeData.recipeName,
    createdAt: new Date(),
  };

  try {
    await addDoc(favRecipeCollection,recipeData);
    console.log('Recipe saved successfully!');
  } catch (error) {
    console.error('Error saving workout plan:', error);
  }
}



async removeFromFavorite(userId: string, recipeID: string) {
  const favRecipeCollection = collection(this.firestore, 'favRecipes');
  const recipeQuery = query(
    favRecipeCollection,
    where("userId", "==", userId),
    where("recipeID", "==", recipeID)
  );

  try {
    const querySnapshot = await getDocs(recipeQuery);

    if (!querySnapshot.empty) {
      const recipeDoc = querySnapshot.docs[0];
      await deleteDoc(recipeDoc.ref);
      console.log(`Recipe ${recipeID} removed successfully!`);
    } else {
      console.error(`No favorite found for recipe ${recipeID}`);
    }
  } catch (error) {
    console.error("Error removing recipe:", error);
  }
}






getFavRecipes(userEmail: string): Observable<any[]> {
  const favRecipesRef = collection(this.firestore, 'favRecipes');
  const q = query(favRecipesRef, where('userEmail', '==', userEmail));
  
  return new Observable<any[]>((observer) => {
    getDocs(q)
      .then((querySnapshot) => {
        const favRecipes: any[] = [];
        querySnapshot.forEach((doc) => {
          favRecipes.push(doc.data());
        });
        observer.next(favRecipes);
        observer.complete();
      })
      .catch((error) => {
        console.error('Error fetching favorite recipes:', error);
        observer.next([]);
        observer.complete();
      });
  });
}




getCostumDiet(userEmail:string):Observable<any[]>{
  const costumDietCollection = collection(this.firestore, 'CostumDiets');
  const q = query(costumDietCollection,where('userEmail', '==', userEmail));

  return new Observable<any[]>((observer) => {
    getDocs(q)
      .then((querySnapshot) => {
        const costumDiets: any[] = [];
        querySnapshot.forEach((doc) => {
          costumDiets.push(doc.data());
        });
        observer.next(costumDiets);
        observer.complete();
      })
      .catch((error) => {
        console.error('Error fetching favorite recipes:', error);
        observer.next([]);
        observer.complete();
      });
  });
}
getFavorites(email: string): Observable<string[]> {
  const favRecipesRef = collection(this.firestore, 'favRecipes');
  const q = query(favRecipesRef, where('userEmail', '==', email));

  return new Observable((observer) => {
    getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const favorites: string[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          favorites.push(data['recipeName']); // Feltételezzük, hogy a recept neve a 'recipeName' mezőben van
        });
        console.log('Kedvenc receptek:', favorites);  // A kedvenc receptek nevének kiírása
        observer.next(favorites);
      } else {
        console.log('Nincs kedvenc recept.');
        observer.next([]);
      }
    }).catch((error) => {
      console.error('Hiba történt a kedvenc receptek lekérésekor:', error);
      observer.error(error);
    });
  });
}



async addFavorite(userEmail: string, recipeName: string, imageUrl: string, description: string, instructions: string): Promise<void> {
  const favoritesCollection = collection(this.firestore, 'favRecipes');
  try {
    await addDoc(favoritesCollection, {
      userEmail,
      recipeName,
      imageUrl,
      description,
      instructions,
      createdAt: new Date(),
    });
    console.log('Recipe added to favorites!');
  } catch (error) {
    console.error('Error adding favorite recipe:', error);
  }
}


async removeFavorite(userEmail: string, recipeName: string): Promise<void> {
  const favoritesCollection = collection(this.firestore, 'favRecipes');
  const q = query(favoritesCollection, where('userEmail', '==', userEmail), where('recipeName', '==', recipeName));

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      const favoriteDocRef = doc(this.firestore, 'favRecipes', docId);
      await deleteDoc(favoriteDocRef);
      console.log('Recipe removed from favorites!');
    } else {
      console.log('Recipe not found in favorites');
    }
  } catch (error) {
    console.error('Error removing favorite recipe:', error);
  }
}
async updateBMI(userEmail: string, bmi: number): Promise<void> {
  const usersRef = collection(this.firestore, 'users');
  const q = query(usersRef, where('email', '==', userEmail));

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      const userDocRef = doc(this.firestore, 'users', docId);

      // Frissítjük a BMI értékét a Firestore-ban
      await updateDoc(userDocRef, {
        bmi: bmi
      });

      console.log('BMI sikeresen frissítve!');
    } else {
      console.error('Nem található felhasználó a BMI frissítéséhez');
    }
  } catch (error) {
    console.error('Hiba történt a BMI frissítésekor:', error);
  }
}
  getWorkoutSessions(userEmail: string): Observable<WorkoutSession[]> {
    const workoutSessionsCollection = collection(this.firestore, 'workoutSessions');
    const q = query(workoutSessionsCollection, where('userEmail', '==', userEmail));
  
    return new Observable<WorkoutSession[]>((observer) => {
      getDocs(q).then((querySnapshot) => {
        const sessions: WorkoutSession[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as WorkoutSession;
          
          // Check if createdAt is a Firestore Timestamp and convert to Date
          if (data.createdAt instanceof Timestamp) {
            data.createdAt = data.createdAt.toDate();
          }
  
          sessions.push(data);
        });
        observer.next(sessions);
        observer.complete();
      }).catch((error) => {
        console.error('Error fetching workout sessions:', error);
        observer.next([]);
        observer.complete();
      });
    });
  }

  
}
