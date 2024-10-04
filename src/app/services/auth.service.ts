import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword,signInWithEmailAndPassword, user, User } from '@angular/fire/auth';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth) { 
    this.user$ = authState(this.auth);
  }

  register(email: string, password: string): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(() => {
     
        console.log('Sikeres regisztráció!');
      })
      .catch(error => {
       
        console.error('Hiba történt a regisztráció során:', error);
        throw error; 
      });
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
