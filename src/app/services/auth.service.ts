import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword,signInWithEmailAndPassword } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  getCurrentUser(): Observable<any> {
    return authState(this.auth); // Visszaadja a bejelentkezett felhasználó állapotát
  }
}
