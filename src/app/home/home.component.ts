import { Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';





@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone:true,
  imports:[CommonModule,FormsModule]
})
export class HomeComponent {
  // Példa adatok a receptcsoportokra
  recipeGroups = [
    {
      title: 'Pöcs',
      recipes: [
        {
          title: 'Spaghetti Carbonara',
          description: 'Egy klasszikus olasz tészta recept.',
          image: 'assets/images/spagetti.jpg',
          instruction: 'Forralj vizet, főzd meg a tésztát, és keverd össze a szósszal.',
          showDetails: false
        },
        {
          title: 'Csirkés rizottó',
          description: 'Egy finom és krémes rizottó.',
          image: 'https://via.placeholder.com/150',
          instruction: 'Főzd meg a rizst, majd add hozzá a csirkét és a sajtot.',
          showDetails: false
        }
      ]
    },
    {
      title: 'Egészséges ételek',
      recipes: [
        {
          title: 'Zöld smoothie',
          description: 'Egy egészséges reggeli ital.',
          image: 'https://via.placeholder.com/150',
          instruction: 'Keverj össze spenótot, almát és banánt turmixgépben.',
          showDetails: false
        }
      ]
    }
  ];
  router: any;

  // Metódus a részletek megjelenítéséhez/elrejtéséhez
  toggleDetails(recipe: any) {
    recipe.showDetails = !recipe.showDetails;
  }



  

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
