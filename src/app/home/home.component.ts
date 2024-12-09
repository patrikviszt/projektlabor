import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { group } from 'node:console';
import { Router } from '@angular/router';


// Recept séma (kommentekhez)
interface Recipe {
  recipeID: string;
  recipeName: string;
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
export class HomeComponent implements OnInit {
  // A felhasználó email-je, amely Observable típusú (lehet null vagy string)
  userEmail$!: Observable<string | null>;
  favorites:string[]=[]
  afAuth: any;
  selectedRecipe: any;
  
  constructor(private authService: AuthService, private firestoreService: FirestoreService, private router: Router) {
    // Email lekérése az aszinkron szolgáltatásból
    this.userEmail$ = this.authService.getCurrentUserEmail();
  }
  ngOnInit() {
    // Lekérdezzük a felhasználó kedvenc receptjeit az adatbázisból
    this.userEmail$.subscribe((email) => {
      if (email) {
        this.firestoreService.getFavorites(email).subscribe((favorites: string[]) => {
          this.favorites = favorites;
          this.updateFavoriteStatus();
        });
      }
    });
  }

  // A receptcsoportok
  allRecipe: RecipeGroup[] = [
    {
      title: '50-100 kcal',
      recipes: [
        {
          recipeID: '11',
          recipeName: 'Mogyorós cookie',
          description: '56 kcal  17 perc.',
          image: 'assets/images/cookie.jpg',
          introduction: 'A mogyoróvajas cookie tökéletes rágcsálnivaló az étkezések között...',
          ingredients: '2 banán (200g)<br>étcsokoládé (15g)<br>fehérjepor (vagy teljes kiőrlésű liszt)(60g)<br>zabpehely (85g)<br>mogyoróvaj (2 evőkanál, 40g)',
          instruction: '1. Kapcsoljuk be előre a sütőt 180°C-ra...<br>4. Süssük kb. 12 percig, amíg aranybarna nem lesz.',
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID:'12',
          recipeName: 'Zamatos cukkinis-kaliforniai paprikás muffin',
          description: '84 kcal  45 perc',
          image: 'assets/images/cukkinis_muffin.jpg',
          introduction: 'A muffint bármikor könnyen magaddal viheted...',
          ingredients: '2 cukkini (460g)<br>1 friss piros kaliforniai paprika (150g)<br>...',
          instruction: '1. Kapcsoljuk be a sütőt 200°C-ra...<br>4. Keverjük össze a hozzávalókat...',
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID:'13',
          recipeName: 'Frissítő görögdinnyesaláta',
          description: '65 kcal  10 perc',
          image: 'assets/images/gorogdinnyesalata.jpg',
          introduction: 'Ez a könnyed saláta tökéletes választás a forró nyári napokon.',
          ingredients: 'görögdinnye (300g)<br>feta sajt (20g)<br>mentalevél (néhány levél)<br>citromlé (1 evőkanál)',
          instruction: '1. Kockázzuk fel a görögdinnyét és a feta sajtot...<br>4. Szórjuk meg mentalevéllel, és locsoljuk meg citromlével.',
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID:'14',
          recipeName: 'Zöldborsó krémleves',
          description: '70 kcal  20 perc',
          image: 'assets/images/zoldborsoleves.jpg',
          introduction: 'Gyorsan elkészíthető, könnyű leves, amely tele van vitaminokkal.',
          ingredients: 'zöldborsó (200g)<br>hagyma (50g)<br>fokhagyma (1 gerezd)<br>zöldségalaplé (300ml)',
          instruction: '1. Pároljuk meg a hagymát és fokhagymát...<br>5. Turmixoljuk simára, és tálaljuk.',
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID:'15',
          recipeName: 'Almás-zabpelyhes keksz',
          description: '98 kcal  15 perc',
          image: 'assets/images/almaskeksz.jpg',
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
          recipeID:'21',
          recipeName: 'Krémes lencseleves',
          description: '296 kcal  30 perc',
          image: 'assets/images/kremes_lencseleves.webp',
          introduction: 'A fűszerezésének köszönhetően kellemes...',
          ingredients: '1 répa (150g)<br>1 hagyma (80g)<br>½ póréhagyma (100g)<br>...',
          instruction: '1. Hámozzuk meg és kockázzuk fel a zöldségeket...<br>6. Pürésítsük botmixerrel.',
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID:'22',
          recipeName: 'Gombás-brokkolis csirke',
          description: '292 kcal  25 perc',
          image: 'assets/images/gombas_brokkolis_csirke.jpg',
          introduction: 'Rengeteg ízletes ételt lehet serpenyőben...',
          ingredients: 'gomba (300g)<br>brokkoli (300g)<br>fokhagyma (6g)<br>...',
          instruction: '1. Tisztítsuk meg a gombát, és mossuk meg a brokkolit...<br>5. Ízesítsük chili, só és bors hozzáadásával.',
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID:'23',
          recipeName: 'Cukkinis tócsni',
          description: '210 kcal  20 perc',
          image: 'assets/images/cukkinistocsni.jpg',
          introduction: 'A könnyű tócsni remek választás akár vacsorára is.',
          ingredients: 'cukkini (300g)<br>tojás (1 db)<br>zabpehelyliszt (40g)<br>só, bors',
          instruction: '1. Reszeljük le a cukkinit, és nyomkodjuk ki a levét...<br>4. Serpenyőben süssük aranybarnára.',
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID:'24',
          recipeName: 'Csirkés quinoa saláta',
          description: '295 kcal  30 perc',
          image: 'assets/images/csirkessalata.jpg',
          introduction: 'Egészséges és tápláló saláta, amely tele van fehérjével.',
          ingredients: 'quinoa (70g)<br>csirkemell (100g)<br>paradicsom (150g)<br>spenót (30g)',
          instruction: '1. Főzzük meg a quinoát...<br>4. Keverjük össze a hozzávalókat, és tálaljuk.',
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID:'25',
          recipeName: 'Sütőtökös lasagna',
          description: '298 kcal  40 perc',
          image: 'assets/images/toklasagne.jpg',
          introduction: 'Ez az ínycsiklandó lasagna a hagyományos változat könnyített verziója.',
          ingredients: 'sütőtök (300g)<br>teljes kiőrlésű lasagna lapok (3 db)<br>ricotta (50g)<br>sajt (30g)',
          instruction: '1. Pürésítsük a sütőtököt...<br>6. Süsd 200°C-on 25 percig, amíg a sajt megpirul.',
          showDetails: false,
          isFavorite: false,
        }
        // További receptek...
      ],
    },
  ];
  firestore: any;

  updateFavoriteStatus() {
    this.allRecipe.forEach(group => {
      group.recipes.forEach(recipe => {
        recipe.isFavorite = this.favorites.includes(recipe.recipeName);
      });
    });
  }
  async addToFavorite(recipeID: string) {
    if (!recipeID) {
      console.error('RecipeID is undefined!');
      return;
    }
  
    const userId = await this.authService.getUserId();
    const userEmail = await firstValueFrom(this.authService.getCurrentUserEmail());
  
    if (userId && userEmail) {
      // Megkeressük a receptet az összes receptcsoportból
      const selectedRecipe = this.allRecipe.flatMap(group => group.recipes).find(recipe => recipe.recipeID === recipeID);
      
      if (!selectedRecipe) {
        console.error('Recipe not found!');
        return;
      }
  
      const recipeData = {
        userId,
        userEmail,
        recipeID: selectedRecipe.recipeID,
        recipeName: selectedRecipe.recipeName,
        description: selectedRecipe.description,
        recipeImage: selectedRecipe.image,
        recipeInstruction: selectedRecipe.instruction
      };
  
      console.log('Sikeresen elmentetted a ',recipeData.recipeName,' receptet a kedvenceid közé:', /*recipeData*/);
      
      // Mentsük el a receptet a firestore-ba
      this.firestoreService.addFavRecipe(userId, recipeData).then(() => {
        console.log('Recipe ${this.selectedRecipe.recipeName} saved successfully!');
      }).catch((error) => {
        console.error('Error saving recipe:${this.selectedRecipe.recipeName}', error);
      });
    } else {
      console.error('User ID or email is missing. Please ensure the user is logged in.');
    }
  }
  
  async removeFromFavorite(recipeID: string) {
    const userId = await this.authService.getUserId();
    const userEmail = await this.authService.getCurrentUserEmail();
  
    if (userId && userEmail) {
      const selectedRecipe = this.allRecipe
        .flatMap(group => group.recipes)
        .find(recipe => recipe.recipeID === recipeID);
  
      console.log(`Removing recipe from favorites: ${selectedRecipe?.recipeName}`);
  
      this.firestoreService.removeFromFavorite(userId, recipeID).then(() => {
        console.log(`Recipe ${selectedRecipe?.recipeName} was removed successfully!`);
      }).catch((error: any) => {
        console.log(`Error removing ${selectedRecipe?.recipeName} recipe!`, error);
      });
    }
  }

  toggleFavorite(recipe: Recipe) {
    this.authService.getCurrentUserEmail().subscribe(email => {
      if (email) {
        if (this.favorites.includes(recipe.recipeName)) {
          this.firestoreService.removeFavorite(email, recipe.recipeName);
          this.favorites = this.favorites.filter(fav => fav !== recipe.recipeName);
        } else {
          this.firestoreService.addFavorite(email, recipe.recipeName, recipe.image, recipe.description, recipe.instruction);
          this.favorites.push(recipe.recipeName);
        }
        recipe.isFavorite = !recipe.isFavorite;
      }
    });
  }
  

  getCurrentUserEmail(): Observable<string | null> {
    return this.afAuth.authState.pipe(
      map(user => user ? this.userEmail$ : null)
    );
  }

  

  // Hozzáférés az aszinkron user emailhez és bejelentkezés
  async loadUserEmail() {
    const email = await firstValueFrom(this.userEmail$);
    console.log(email); // Az email most már string vagy null típusú
  }

  // Módosíthatod a login és regisztrációs módokat a további igények szerint
  showRecipeModal: any;


 
  
  showLoginModal: any;
  redirectToLogin() {
    this.router.navigate(['/login']);
  }
  redirectToRegister() {
    this.router.navigate(['/register'])
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


  
}
