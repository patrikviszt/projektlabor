import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app/app.component';
import { importProvidersFrom, NgModule } from '@angular/core';
import { UserInfoComponent } from '../app/user-info/user-info.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HeaderComponent } from './header/header.component';

// Útvonalak definiálása
export const routes: Routes = [
  { path: '', component: LoginComponent },  // Alapértelmezett útvonal
  { path: 'userinfo', component: UserInfoComponent },  // Útvonal a felhasználói adatkomponenshez
  {path:'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  { path: 'userprofile', component: UserProfileComponent},
  { path: 'header', component: HeaderComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}