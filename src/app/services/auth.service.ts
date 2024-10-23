import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword,signInWithEmailAndPassword, user, User } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { UserData } from '../user-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;
  private userDataSubject = new BehaviorSubject<UserData | null>(null);

  constructor(private auth: Auth, private firestore: Firestore) { 
    this.user$ = authState(this.auth);
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userId = userCredential.user.uid;
  
   
      await setDoc(doc(this.firestore, 'users', userId), {
        email,
        firstName,
        lastName
      });
  
      console.log('User data saved:', { email, firstName, lastName });
    } catch (error) {
      console.error('Hiba történt a regisztráció során:', error);
      throw error;
    }
  }
  
  async login(email: string, password: string): Promise<UserData | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const userId = userCredential.user.uid;

      const userDoc = await getDoc(doc(this.firestore, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserData; 
      } else {
        console.error('No such user data!');
        return null;
      }
    } catch (error) {
      console.error('Hiba történt a bejelentkezés során:', error);
      throw error;
    }
  }
  getCurrentUser(): Observable<User | null> {
    return authState(this.auth);
  }
  getCurrentUserEmail(): Observable<string | null> {
    return new Observable<string | null>((observer) => {
      this.user$.subscribe(user => {
        observer.next(user ? user.email : null);
      });
    });
  }
  async getUserId(): Promise<string | null> {
    const user$ = user(this.auth);
    const currentUser = await firstValueFrom(user$);
    return currentUser ? currentUser.uid : null;
  }
  async getUserData(uid: string): Promise<UserData | null> {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    return userDoc.exists() ? userDoc.data() as UserData : null;
  }
  logout(): Promise<void> {
    return this.auth.signOut();
  }
}
