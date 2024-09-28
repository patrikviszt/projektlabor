import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app/app.component';
import { importProvidersFrom } from '@angular/core';
import { UserInfoComponent } from '../app/user-info/user-info.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';

// Útvonalak definiálása
export const routes: Routes = [
  { path: '', component: AppComponent },  // Alapértelmezett útvonal
  { path: 'userinfo', component: UserInfoComponent },  // Útvonal a felhasználói adatkomponenshez
  {path:'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
];

