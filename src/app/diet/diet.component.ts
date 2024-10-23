import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { AppComponent } from '../app.component';
import { BrowserModule } from '@angular/platform-browser';




@Component({
  selector: 'app-diet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diet.component.html',
  styleUrl: './diet.component.css'
})
export class DietComponent {
days: string[] = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
  selectedDay: string = '';
  selectedMeal: string = '';


  toggleMeals(day: string) {
    this.selectedDay = this.selectedDay === day ? '' : day; 
    this.selectedMeal = ''; 
  }


  showMeals(meal: string) {
    this.selectedMeal = meal;
  }
}


