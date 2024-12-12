import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { group } from 'node:console';
import { Router } from '@angular/router';


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
  userEmail$!: Observable<string | null>;
  favorites:string[]=[]
  afAuth: any;
  selectedRecipe: any;
  
  constructor(private authService: AuthService, private firestoreService: FirestoreService, private router: Router) {
    this.userEmail$ = this.authService.getCurrentUserEmail();
  }
  ngOnInit() {
    this.userEmail$.subscribe((email) => {
      if (email) {
        this.firestoreService.getFavorites(email).subscribe((favorites: string[]) => {
          this.favorites = favorites;
          this.updateFavoriteStatus();
        });
      }
    });
  }

  allRecipe: RecipeGroup[] = [
    {
      title:'Karácsonyi fogások',
      recipes:[
        {
          recipeID: '31',
          recipeName: 'Sült pulyka',
          description: '350 kcal  120 perc',
          image: 'assets/images/sultpulyka.jpg',
          introduction: 'A klasszikus karácsonyi étel, mely minden ünnepi asztalon helyet kap.',
          ingredients: 'pulyka (2 kg)<br>rozmaring (10g)<br>fokhagyma (5g)<br>citrom (1 db)<br>só, bors',
          instruction: "1. Melegítsük elő a sütőt 180°C-ra.<br> 2. A pulykát sózzuk, borsozzuk, és töltjük meg rozmaringgal, fokhagymával és félbevágott citrommal.<br> 3. Helyezzük a pulykát egy sütőtálba, és locsoljuk meg olívaolajjal.<br> 4. Süssük 1,5-2 órán keresztül, időnként locsoljuk meg a saját levével. <br>5. Amikor a pulyka szép pirosra sül, vegyük ki, és pihentessük 10 percig szeletelés előtt.",
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID: '32',
          recipeName: 'Bejgli',
          description: '280 kcal  60 perc',
          image: 'assets/images/bejgli.jpg',
          introduction: 'A hagyományos karácsonyi desszert, dióval vagy mákkal töltve.',
          ingredients: 'liszt (300g)<br>élesztő (10g)<br>vaj (100g)<br>dió (200g)<br>cukor (50g)',
          instruction: "1. Keverjük el az élesztőt langyos vízben, és hagyjuk felfutni.<br> 2. A lisztet, vajat és cukrot egy tálban keverjük össze.<br> 3. Az élesztőt adjuk hozzá, majd gyúrjuk rugalmas tésztává. <br>4. Hagyjuk pihenni 30 percig.<br> 5. Töltsük meg a tésztát dióval vagy mákkal, majd süssük 180°C-on 25 percig.",
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID: '33',
          recipeName: 'Halászlé',
          description: '150 kcal  40 perc',
          image: 'assets/images/halaszle.jpg',
          introduction: 'Az ünnepi étkezések elmaradhatatlan része, fűszeres és ínycsiklandó.',
          ingredients: 'ponty (500g)<br>paradicsom (100g)<br>paprika (2 db)<br>hagymák (2 db)<br>só, bors',
          instruction: "1. A halat tisztítsuk meg és vágjuk fel kisebb darabokra.<br> 2. A hagymát és paprikát vágjuk fel, majd pirítsuk meg egy lábasban.<br> 3. Adjuk hozzá a paradicsomot és fűszerezzük sóval, borssal.<br> 4. Öntsük fel vízzel és forraljuk fel.<br> 5. Főzzük 40 percig, amíg a hal megpuhul.",
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID: '34',
          recipeName: 'Karácsonyi töltött káposzta',
          description: '400 kcal  150 perc',
          image: 'assets/images/toltottkaposzta.jpg',
          introduction: 'A karácsonyi asztal egyik tradicionális étke, húsos töltelékkel.',
          ingredients: 'káposzta (1 fej)<br>sertéshús (300g)<br>rizs (100g)<br>fűszerpaprika (10g)<br> fokhagyma (2 gerezd)',
          instruction: "1. A káposztát főzzük le, majd a leveleit töltsük meg a húsos keverékkel.<br> 2. A sertéshúst apróra vágjuk, hozzáadjuk a rizst, fűszerpaprikát és fokhagymát.<br> 3. A tölteléket egyenként töltsük a káposztalevelekbe, majd formáljuk meg a káposztákat. <br>4. Tegyük egy fazékba, öntsük fel vízzel és főzzük 1 órán keresztül. <br>5. Főzzük 2 órán keresztül, amíg a töltelék teljesen megpuhul.",
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID: '35',
          recipeName: 'Mézeskalács',
          description: '280 kcal  90 perc',
          image: 'assets/images/mezeskalacs.jpg',
          introduction: 'A karácsonyi mézeskalács a legjobb édesség, amit az ünnepi hangulathoz készíthetsz.',
          ingredients: 'liszt (300g)<br>méz (150g)<br>vaj (100g)<br>tojás (1 db)<br>fahéj (1 teáskanál)<br>szegfűszeg (1/2 teáskanál)<br>cukor (100g)<br>szódabikarbóna (1 teáskanál)',
          instruction: "1. Olvasszuk meg a vajat és a mézet, majd keverjük el. <br>2. A lisztet és a fűszereket szitáljuk át, majd adjuk hozzá a mézes-vajas keveréket.<br> 3. A tojást is adjuk hozzá, és gyúrjuk össze a tésztát. <br>4. Nyújtsuk ki a tésztát, majd formázzuk meg a mézeskalácsokat. <br>5. Süssük 180°C-on 10-12 percig, amíg aranybarna nem lesz.",
          showDetails: false,
          isFavorite: false,
        }
      ]
    },
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
          instruction: "1. Kapcsoljuk be előre a sütőt 180°C-ra. <br>2. A banánokat pürésítsük össze. <br>3. Adjuk hozzá a mogyoróvajat, étcsokoládét és a fehérjeporot. <br>4. Formáljunk kisebb gombócokat, és helyezzük őket a sütőpapíros tepsire.<br> 5. Süssük kb. 12 percig, amíg aranybarna nem lesz.",
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
          instruction: "1. Kapcsoljuk be a sütőt 200°C-ra.<br>2. A cukkinit és a kaliforniai paprikát vágjuk apróra. <br>3. Keverjük össze a lisztet, tojást, sütőport, és a zöldségeket.<br> 4. Keverjük össze a hozzávalókat, majd öntsük a masszát a muffin formákba. <br>5. Süssük 25 percig, amíg átsülnek.",
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
          instruction: "1. Kockázzuk fel a görögdinnyét és a feta sajtot. <br>2. A dinnyét, sajtot és a mentaleveleket keverjük össze egy tálban.<br> 3. Ízesítsük citromlével. <br>4. Szórjuk meg mentalevéllel, és locsoljuk meg citromlével.",
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
          instruction: "1. Pároljuk meg a hagymát és fokhagymát egy lábasban.<br> 2. Adjuk hozzá a zöldborsót és zöldségalaplevet.<br> 3. Főzzük 10 percig, amíg a borsó megpuhul. <br>4. Adjuk hozzá a fűszereket és sót.<br> 5. Turmixoljuk simára, és tálaljuk.",
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
          instruction: "1. Reszeljük le az almát, és keverjük össze a zabpehellyel.<br> 2. Adjunk hozzá mézet és fahéjat.<br> 3. Formáljunk kis korongokat, és süssük 180°C-on 10 percig.<br> 4. Hagyjuk kihűlni, majd tálaljuk.",
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
          instruction: "1. Hámozzuk meg és kockázzuk fel a zöldségeket.<br> 2. Forraljuk fel a vizet egy lábasban, és adjuk hozzá a zöldségeket.<br> 3. Főzzük 15-20 percig, amíg megpuhulnak. <br>4. Adjuk hozzá a lencsét és a fűszereket. <br>5. Pürésítsük botmixerrel, majd tálaljuk.",
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
          instruction: "1. Tisztítsuk meg a gombát, és mossuk meg a brokkolit.<br> 2. Vágjuk fel a csirkemellet kisebb darabokra. <br>3. Süssük meg a csirkét egy serpenyőben, majd vegyük ki. <br>4. A serpenyőben pirítsuk meg a gombát és brokkolit.<br> 5. Ízesítsük chili, só és bors hozzáadásával, majd tálaljuk.",
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
          instruction: "1. Reszeljük le a cukkinit, és nyomkodjuk ki a levét.<br> 2. Keverjük össze a tojást, zabpehelylisztet, sót és borsot.<br> 3. Formáljunk kis tócsnikat a masszából.<br> 4. Serpenyőben süssük aranybarnára mindkét oldalát, majd tálaljuk.",
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
          instruction: "1. Főzzük meg a quinoát a csomagolás szerint.<br> 2. A csirkemellet süssük meg egy serpenyőben, majd vágjuk fel csíkokra. <br>3. A paradicsomot és spenótot aprítsuk fel. <br>4. Keverjük össze a hozzávalókat, és tálaljuk.",
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
          instruction: "1. Pürésítsük a sütőtököt.<br> 2. Főzzük meg a lasagna lapokat. <br>3. Rétegezzük a sütőtököt, ricottát és sajtot egy tepsibe.<br> 4. Ismételjük meg a rétegezést.<br> 5. Süsd 200°C-on 25 percig, amíg a sajt megpirul.",
          showDetails: false,
          isFavorite: false,
        }
        // További receptek...
      ],
    },
    {
      title: '300-800 kcal',
      recipes: [
        {
          recipeID: '41',
          recipeName: 'Baconos sajtburgonya',
          description: '820 kcal  40 perc',
          image: 'assets/images/baconos_sajtburgonya.jpg',
          introduction: 'Ez a gazdag és ínycsiklandó étel tökéletes választás egy kiadós ebédre vagy vacsorára.',
          ingredients: 'krumpli (400g)<br>bacon (100g)<br>cheddar sajt (100g)<br>tejföl (50g)<br>só, bors',
          instruction: "1. Hámozzuk meg és főzzük meg a krumplit.<br> 2. Süssük meg a bacont, majd aprítsuk fel. <br>3. Reszeljük le a cheddar sajtot. <br>4. Keverjük össze a tejfölt a sóval és borssal. <br>5. Tálaljuk a baconos burgonyát a sajttal és tejföllel.",
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID: '42',
          recipeName: 'Sült hal rozmaringgal',
          description: '350 kcal  45 perc',
          image: 'assets/images/sult_hal_rozmaringgal.jpg',
          introduction: 'Egyszerű és finom sült hal, amely tökéletes karácsonyi étkezéshez.',
          ingredients: 'halfilé (4 db)<br>rozmaring (1 ág)<br>citrom (1 db)<br>olívaolaj (2 evőkanál)<br>só, bors',
          instruction: "1. Tisztítsuk meg a halat és helyezzük tepsibe. <br>2. Locsoljuk meg olívaolajjal és szórjuk meg rozmaringgal. <br>3. Szeleteljük fel a citromot és helyezzük a hal mellé. <br>4. Süssük 180°C-on 20-25 percig.<br> 5. Ízesítsük sóval és borssal, majd tálaljuk.",
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID: '43',
          recipeName: 'Rakott krumpli',
          description: '450 kcal  60 perc',
          image: 'assets/images/rakottkrumpli.jpg',
          introduction: 'A rakott krumpli egy gazdag és kiadós étel, mely minden családi összejövetel elmaradhatatlan része.',
          ingredients: 'krumpli (1 kg)<br>tojás (3 db)<br>kolbász (200g)<br>tejföl (250g)<br>mustár (1 evőkanál)<br>só, bors',
          instruction: "1. Főzzük meg a krumplit és a tojásokat. <br>2. Vágjuk fel a kolbászt és a tojásokat. <br>3. Rétegezzük a főtt krumplit, kolbászt, tojásokat és tejfölt egy tálban. <br>4. Rétegezzük a hozzávalókat, és süssük 200°C-on 35-40 percig.<br> 5. Tálaljuk frissen, és ízesítsük sóval és borssal.",
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID: '42',
          recipeName: 'Szénhidrát bombás rakott tészta',
          description: '850 kcal  45 perc',
          image: 'assets/images/rakott_teszta.jpg',
          introduction: 'Ez a rakott tészta gazdag tésztában, hússal és tejfölös szósszal, amely tápláló és laktató.',
          ingredients: 'tészta (250g)<br>darálthús (200g)<br>tejföl (100g)<br>paradicsomszósz (150g)<br>reszelt sajt (50g)<br>hagymák (1 db)<br>fűszerek',
          instruction: "1. Főzzük meg a tésztát. <br>2. Pirítsuk meg a darálthúst, adjuk hozzá a paradicsomszószt és a fűszereket. <br>3. Rétegezzük a tésztát, húst és tejfölt egy tálban.<br>4. Szórjuk meg sajttal, és süssük 180°C-on 25 percig. <br>5. Tálaljuk forrón, ízlés szerint.",
          showDetails: false,
          isFavorite: false,
        },
        {
          recipeID: '45',
          recipeName: 'Töltött édesburgonya',
          description: '380 kcal  50 perc',
          image: 'assets/images/toltott_edesburgonya.jpg',
          introduction: 'Az édesburgonya tökéletes alapanyag a különleges töltelékekhez, és ideális választás karácsonyi étkezéshez.',
          ingredients: 'édesburgonya (4 db)<br>csirkemell (300g)<br>paradicsom (2 db)<br>fokhagyma (2 gerezd)<br>fűszerek (oregánó, paprika)',
          instruction: "1. Főzzük meg az édesburgonyát, majd vágjuk fel és kanalazzuk ki a belsejét. <br>2. Süssük meg a csirkemellet, és vágjuk fel apró darabokra.<br> 3. Keverjük össze a csirkét, paradicsomot és fűszereket.<br> 4. Töltsük meg a burgonyákat a kész töltelékkel, és süssük 180°C-on 25 percig. <br>5. Tálaljuk melegen, ízesítve.",
          showDetails: false,
          isFavorite: false,
        }
      ]
    }
    
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
        ingredients: selectedRecipe.ingredients,
        recipeImage: selectedRecipe.image,
        recipeInstruction: selectedRecipe.instruction
      };
  
      console.log('Sikeresen elmentetted a ',recipeData.recipeName,' receptet a kedvenceid közé:', /*recipeData*/);
      
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
          this.firestoreService.addFavorite(email, recipe.recipeName, recipe.image, recipe.description, recipe.instruction, recipe.ingredients);
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

  

  async loadUserEmail() {
    const email = await firstValueFrom(this.userEmail$);
    console.log(email);  }

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
