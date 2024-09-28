import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) {}

  // Adatok mentése a Firestore-ba
  addUserData(userData: any) {
    const userCollection = collection(this.firestore, 'users');  // A 'users' kollekcióba mentjük
    return addDoc(userCollection, userData);
  }
}
