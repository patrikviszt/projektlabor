import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword,signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth) { 
    this.user$ = authState(this.auth);
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  getCurrentUser(): Observable<any> {
    return authState(this.auth); // Visszaadja a bejelentkezett felhasználó állapotát
  }
  getCurrentUserEmail(): Observable<string | null> {
    return new Observable<string | null>((observer) => {
      this.user$.subscribe(user => {
        observer.next(user ? user.email : null);
      });
    });
  }
}
