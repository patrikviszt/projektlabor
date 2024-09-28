import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  addUserData(userData: any) {
    const userCollection = collection(this.firestore, 'users');
    return addDoc(userCollection, userData);
  }
}
