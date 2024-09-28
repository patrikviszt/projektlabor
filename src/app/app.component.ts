import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'projektlabor';
  userEmail$: Observable<string | null>;
  constructor(private router: Router, private authService: AuthService) {
    // Inicializálás
    this.userEmail$ = this.authService.getCurrentUserEmail(); 
  }

  navigateToProfile() {
    this.router.navigate(['/userprofile']);
  }

  navigateToUserInfo() {
    this.router.navigate(['/userinfo']);
  }

  navigateToMealPlan() {
    this.router.navigate(['/meal-plan']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']); // Irányítsd a bejelentkező oldalra
  }

  navigateToRegister() {
    this.router.navigate(['/register']); // Irányítsd a regisztrációs oldalra
  }
  
}
