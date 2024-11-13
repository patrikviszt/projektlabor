import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app/app.component';
import { importProvidersFrom, NgModule } from '@angular/core';
import { UserInfoComponent } from '../app/user-info/user-info.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HeaderComponent } from './header/header.component';
import { DietComponent } from './diet/diet.component';
import { WorkoutPlanComponent } from './workout-plan/workout-plan.component';
import { DietPlanComponent } from './diet-plan/diet-plan.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { WorkoutSessionComponent } from './workout-session/workout-session.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'userinfo', component: UserInfoComponent }, 
  {path:'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  { path: 'userprofile', component: UserProfileComponent},
  { path: 'header', component: HeaderComponent},
  { path: 'diet', component: DietPlanComponent},
  { path: 'workout', component: WorkoutPlanComponent},
  {path: 'exercises', component: ExercisesComponent},
  { path: 'workout-session', component: WorkoutSessionComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}