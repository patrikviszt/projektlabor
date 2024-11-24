import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { BrowserModule } from '@angular/platform-browser';
import bootstrap from '../main.server';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule, HeaderComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'projektlabor';
  constructor(private router: Router) {}

navigateToHome(){
  this.router.navigate(['/home']);
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
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
