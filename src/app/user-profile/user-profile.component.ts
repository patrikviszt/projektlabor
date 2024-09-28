import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserData } from '../user-data.model';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  userData$: Observable<UserData | undefined> = of(undefined); // Inicializálás undefined értékkel

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Ellenőrizzük, hogy az authService nem undefined
    if (!this.authService) {
      console.error('AuthService nem elérhető');
      return;
    }

    // Feliratkozás a user$ observable-ra
    this.authService.user$?.subscribe((user: User | null) => {
      if (user && user.email) { // Ellenőrizd, hogy a user és az email nem null
        this.userData$ = this.firestoreService.getUserData(user.email); 
      } else {
        console.warn('Nincs bejelentkezett felhasználó, vagy az email nem érhető el.');
        this.userData$ = of(undefined); 
      }
    });
  }
}
