import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, User } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { BehaviorSubject, firstValueFrom, map, Observable } from 'rxjs';
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

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userId = userCredential.user.uid;

      await setDoc(doc(this.firestore, 'userData', userId), {
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

      const userDoc = await getDoc(doc(this.firestore, 'userData', userId));
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

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      if (user) {
        const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(this.firestore, 'userData', user.uid), {
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || ''
          });
        }
      }
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      throw error;
    }
  }

  getCurrentUser(): Observable<User | null> {
    return authState(this.auth);
  }

  getCurrentUserEmail(): Observable<string | null> {
    return this.user$.pipe(map(user => user?.email || null));
  }

  async getUserId(): Promise<string | null> {
    const user$ = authState(this.auth);
    const currentUser = await firstValueFrom(user$);
    return currentUser ? currentUser.uid : null;
  }

  async getUserData(uid: string): Promise<UserData | null> {
    const userDoc = await getDoc(doc(this.firestore, 'userData', uid));
    return userDoc.exists() ? userDoc.data() as UserData : null;
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }
}
