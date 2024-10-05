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
  step: number = 1;  
  userData: any = {
    email: '', 
    weight: null,
    height: null,
    gender: '',
    age: null,
    goal: '',
    activityLevel: ''
  };

  constructor(
    private firestoreService: FirestoreService,
    private snackbar: SnackbarService,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData.email = user.email; // Email cím beállítása
      }
    });
  }

  nextStep() {
    if (this.step < 6) {
      this.step++;
    }
  }

  previousStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  submit() {
    this.firestoreService.addUserData(this.userData).then(() => {
      this.snackbar.open('Adatok sikeresen mentve!', 'Ok'); 
    }).catch((error) => {
      console.error('Hiba történt az adatok mentése közben:', error);
      this.snackbar.open('Hiba történt az adatok mentése közben!', 'Ok');
    });
  }
}
