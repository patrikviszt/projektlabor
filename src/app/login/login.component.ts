import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../services/snackbar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  passwordVisible: boolean = false;
  constructor(private authService: AuthService, private snackbar: SnackbarService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password).then(() => {
      this.snackbar.open('Sikeres bejelentkezés!', 'Ok');
      this.router.navigate(['/userinfo']); 
    }).catch(error => {
      this.errorMessage = error.message;
      console.error('Hiba történt a bejelentkezés során:', error);
    });
  }
  navigateToRegister() {
    this.router.navigate(['/register']); 
  }
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

}