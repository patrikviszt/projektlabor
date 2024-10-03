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
  userData$: Observable<UserData | undefined> = of(undefined); 
  workoutPlans$: Observable<any[]> = of([]);
  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    
    if (!this.authService) {
      console.error('AuthService nem elérhető');
      return;
    }

    this.authService.user$?.subscribe((user: User | null) => {
      if (user && user.email) {
        this.userData$ = this.firestoreService.getUserData(user.email);
        this.workoutPlans$ = this.firestoreService.getWorkoutPlans(user.email);
      } else {
        console.warn('No logged-in user or email not available.');
        this.userData$ = of(undefined);
        this.workoutPlans$ = of([]); 
      }
    });
  }
}
