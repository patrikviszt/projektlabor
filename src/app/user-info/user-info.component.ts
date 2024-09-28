import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service.spec';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./user-info.component.css'],
  standalone: true,
})
export class UserInfoComponent {
  step: number = 1;  // Jelenlegi lépés
  userData: any = {
    weight: null,
    height: null,
    age: null,
    goal: '',
    activityLevel: ''
  };

  constructor(private firestoreService: FirestoreService) {}

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
      console.log('Adatok sikeresen mentve!');
    }).catch((error) => {
      console.error('Hiba történt az adatok mentése közben:', error);
    });
  }
}