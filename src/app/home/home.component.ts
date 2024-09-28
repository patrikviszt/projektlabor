import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToUserInfo() {
    this.router.navigate(['/userinfo']);
  }

  navigateToMealPlan() {
    this.router.navigate(['/meal-plan']);
  }
}
