import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports:[FormsModule, CommonModule],
  standalone: true,
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  register() {
    this.authService.register(this.email, this.password).then(() => {
      console.log('Sikeres regisztráció!');
    }).catch(error => {
      this.errorMessage = error.message;
      console.error('Hiba történt a regisztráció során:', error);
    });
  }
}
