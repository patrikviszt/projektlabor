import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
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
}
