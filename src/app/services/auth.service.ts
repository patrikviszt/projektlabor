import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword,signInWithEmailAndPassword, user, User } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from '@firebase/firestore';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth, private firestore: Firestore) { 
    this.user$ = authState(this.auth);
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userId = userCredential.user.uid;

      // Save user data to Firestore
      await setDoc(doc(this.firestore, 'users', userId), {
        email,
        firstName,
        lastName
      });

      console.log('Sikeres regisztráció és adatok mentése!');
    } catch (error) {
      console.error('Hiba történt a regisztráció során:', error);
      throw error;
    }
  }
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
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
  logout(): Promise<void> {
    return this.auth.signOut();
  }
}
