import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { firstValueFrom, Observable } from 'rxjs';
import { Router } from '@angular/router';

// Recept séma (kommentekhez)
interface Recipe {
  title: string;
  description: string;
  image: string;
  introduction: string;
  ingredients: string;
  instruction: string;
  showDetails: boolean;
  isFavorite: boolean;
}

interface RecipeGroup {
  title: string;
  recipes: Recipe[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class HomeComponent {
  // A felhasználó email-je, amely Observable típusú (lehet null vagy string)
  userEmail$!: Observable<string | null>;

  // A receptcsoportok
  recipeGroups: RecipeGroup[] = [
    {
      title: '50-100 kcal',
      recipes: [
        {
          title: 'Mogyorós cookie',
          description: '56 kcal  17 perc.',
          image: 'assets/images/cookie.jpg',
          introduction: 'A mogyoróvajas cookie tökéletes rágcsálnivaló az étkezések között...',
          ingredients: '2 banán (200g)<br>étcsokoládé (15g)<br>fehérjepor (vagy teljes kiőrlésű liszt)(60g)<br>zabpehely (85g)<br>mogyoróvaj (2 evőkanál, 40g)',
          instruction: '1. Kapcsoljuk be előre a sütőt 180°C-ra...<br>4. Süssük kb. 12 percig, amíg aranybarna nem lesz.',
          showDetails: false,
          isFavorite: false,
        },
        {
          title: 'Zamatos cukkinis-kaliforniai paprikás muffin',
          description: '84 kcal  45 perc',
          image: 'assets/images/cukkinis_muffin.jpg',
          introduction: 'A muffint bármikor könnyen magaddal viheted...',
          ingredients: '2 cukkini (460g)<br>1 friss piros kaliforniai paprika (150g)<br>...',
          instruction: '1. Kapcsoljuk be a sütőt 200°C-ra...<br>4. Keverjük össze a hozzávalókat...',
          showDetails: false,
          isFavorite: false,
        },
        {
          title: 'Frissítő görögdinnyesaláta',
          description: '65 kcal  10 perc',
          image: 'assets/images/gorogdinnyesalata.jpg',
          introduction: 'Ez a könnyed saláta tökéletes választás a forró nyári napokon.',
          ingredients: 'görögdinnye (300g)<br>feta sajt (20g)<br>mentalevél (néhány levél)<br>citromlé (1 evőkanál)',
          instruction: '1. Kockázzuk fel a görögdinnyét és a feta sajtot...<br>4. Szórjuk meg mentalevéllel, és locsoljuk meg citromlével.',
          showDetails: false,
          isFavorite: false,
        },
        {
          title: 'Zöldborsó krémleves',
          description: '70 kcal  20 perc',
          image: 'assets/images/zoldborso_kremleves.jpg',
          introduction: 'Gyorsan elkészíthető, könnyű leves, amely tele van vitaminokkal.',
          ingredients: 'zöldborsó (200g)<br>hagyma (50g)<br>fokhagyma (1 gerezd)<br>zöldségalaplé (300ml)',
          instruction: '1. Pároljuk meg a hagymát és fokhagymát...<br>5. Turmixoljuk simára, és tálaljuk.',
          showDetails: false,
          isFavorite: false,
        },
        {
          title: 'Almás-zabpelyhes keksz',
          description: '98 kcal  15 perc',
          image: 'assets/images/almas_keksz.jpg',
          introduction: 'Ez a ropogós keksz tökéletes délutáni nasi.',
          ingredients: 'alma (150g)<br>zabpehely (60g)<br>méz (1 evőkanál)<br>fahéj (csipet)',
          instruction: '1. Reszeljük le az almát...<br>3. Formáljunk kis korongokat, és süssük 180°C-on 10 percig.',
          showDetails: false,
          isFavorite: false,
        }
        // További receptek...
      ],
    },
    {
      title: '200-300 kcal',
      recipes: [
        {
          title: 'Krémes lencseleves',
          description: '296 kcal  30 perc',
          image: 'assets/images/kremes_lencseleves.webp',
          introduction: 'A fűszerezésének köszönhetően kellemes...',
          ingredients: '1 répa (150g)<br>1 hagyma (80g)<br>½ póréhagyma (100g)<br>...',
          instruction: '1. Hámozzuk meg és kockázzuk fel a zöldségeket...<br>6. Pürésítsük botmixerrel.',
          showDetails: false,
          isFavorite: false,
        },
        {
          title: 'Gombás-brokkolis csirke',
          description: '292 kcal  25 perc',
          image: 'assets/images/gombas_brokkolis_csirke.jpg',
          introduction: 'Rengeteg ízletes ételt lehet serpenyőben...',
          ingredients: 'gomba (300g)<br>brokkoli (300g)<br>fokhagyma (6g)<br>...',
          instruction: '1. Tisztítsuk meg a gombát, és mossuk meg a brokkolit...<br>5. Ízesítsük chili, só és bors hozzáadásával.',
          showDetails: false,
          isFavorite: false,
        },
        {
          title: 'Cukkinis tócsni',
          description: '210 kcal  20 perc',
          image: 'assets/images/cukkinis_tocsni.jpg',
          introduction: 'A könnyű tócsni remek választás akár vacsorára is.',
          ingredients: 'cukkini (300g)<br>tojás (1 db)<br>zabpehelyliszt (40g)<br>só, bors',
          instruction: '1. Reszeljük le a cukkinit, és nyomkodjuk ki a levét...<br>4. Serpenyőben süssük aranybarnára.',
          showDetails: false,
          isFavorite: false,
        },
        {
          title: 'Csirkés quinoa saláta',
          description: '295 kcal  30 perc',
          image: 'assets/images/csirkes_quinoa_salata.jpg',
          introduction: 'Egészséges és tápláló saláta, amely tele van fehérjével.',
          ingredients: 'quinoa (70g)<br>csirkemell (100g)<br>paradicsom (150g)<br>spenót (30g)',
          instruction: '1. Főzzük meg a quinoát...<br>4. Keverjük össze a hozzávalókat, és tálaljuk.',
          showDetails: false,
          isFavorite: false,
        },
        {
          title: 'Sütőtökös lasagne',
          description: '298 kcal  40 perc',
          image: 'assets/images/sutotokos_lasagna.jpg',
          introduction: 'Ez az ínycsiklandó lasagne a hagyományos változat könnyített verziója.',
          ingredients: 'sütőtök (300g)<br>teljes kiőrlésű lasagne lapok (3 db)<br>ricotta (50g)<br>sajt (30g)',
          instruction: '1. Pürésítsük a sütőtököt...<br>6. Süsd 200°C-on 25 percig, amíg a sajt megpirul.',
          showDetails: false,
          isFavorite: false,
        }
        // További receptek...
      ],
    },
  ];
constructor(private firestoreService: FirestoreService, private router: Router) {
  
}
  // constructor(private authService: AuthService, private firestoreService: FirestoreService) {
  //   Email lekérése az aszinkron szolgáltatásból
  //   this.userEmail$ = this.firestoreService.getUserEmail();
  // }

  

  // Hozzáférés az aszinkron user emailhez és bejelentkezés
  async loadUserEmail() {
    const email = await firstValueFrom(this.userEmail$);
    console.log(email); // Az email most már string vagy null típusú
  }

  // Módosíthatod a login és regisztrációs módokat a további igények szerint
  showRecipeModal: any;


 
  selectedRecipe: any;
  showLoginModal: any;
  redirectToLogin() {
    this.router.navigate(['/login']);
  }
  redirectToRegister() {
    this.router.navigate(['/register']);
  }
  closeLoginModal() {
    this.showLoginModal = false;
  }



  toggleDetails(recipe: any) {
    this.selectedRecipe = recipe;
    this.showRecipeModal = true;
  }
  closeRecipeModal() {
    this.selectedRecipe = null;
    this.showRecipeModal = false;
  }

  toggleFavorite(recipe: Recipe): void {
    if (!this.userEmail$) {
      this.showLoginModal = true;
      return;
    }
  
    recipe.isFavorite = !recipe.isFavorite;
  
    firstValueFrom(this.userEmail$).then((email) => {
      if (email && recipe.isFavorite) {
        this.firestoreService.saveFavoriteRecipe(recipe.title, email);
      }
    });
  }
}
