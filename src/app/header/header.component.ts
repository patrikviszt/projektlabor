import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
 
  userEmail$: Observable<string | null>;
  menuActive = false;
  
  constructor(private router: Router, private authService: AuthService) {

    this.userEmail$ = this.authService.getCurrentUserEmail(); 
  }
  toggleMenu() {
    this.menuActive = !this.menuActive;
  }
  navigateToProfile() {
    this.router.navigate(['/userprofile']);
  }

  navigateToWorkoutPlan() {
    this.router.navigate(['/workout']);
  }

  navigateToMealPlan() {
    this.router.navigate(['/diet']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']); 
  }

  logout() {
    this.authService.logout().then(() => {
      console.log('Successfully logged out.');
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Logout error:', error);
    });
  }
}
