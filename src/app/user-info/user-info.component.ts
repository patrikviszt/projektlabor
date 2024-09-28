import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { SnackbarService } from '../services/snackbar.service';
import { AuthService } from '../services/auth.service'; // Firebase Auth Service

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./user-info.component.css'],
  standalone: true,
})
export class UserInfoComponent implements OnInit {
  step: number = 1;  // Jelenlegi lépés
  userData: any = {
    email: '',  // Email mező hozzáadása
    weight: null,
    height: null,
    age: null,
    goal: '',
    activityLevel: ''
  };

  constructor(
    private firestoreService: FirestoreService,
    private snackbar: SnackbarService,
    private authService: AuthService // Firebase Auth Service injektálása
  ) {}

  ngOnInit() {
    // Bejelentkezett felhasználó adatainak lekérése
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData.email = user.email; // Email cím beállítása
      }
    });
  }

  nextStep() {
    if (this.step < 5) {
      this.step++;
    }
  }

  previousStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  submit() {
    // Adatok mentése a Firestore-ba
    this.firestoreService.addUserData(this.userData).then(() => {
      this.snackbar.open('Adatok sikeresen mentve!', 'Ok');  // Sikeres mentés értesítése
    }).catch((error) => {
      console.error('Hiba történt az adatok mentése közben:', error);
      this.snackbar.open('Hiba történt az adatok mentése közben!', 'Ok');
    });
  }
}
