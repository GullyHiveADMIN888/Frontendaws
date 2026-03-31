
import { Routes } from '@angular/router';
// import { LoginComponent } from './login/login.component';
import { RegisterLayoutComponent } from './register/register-layout/register-layout.component';
import { RegisterComponent } from './register/register.component';
import { CustomerRegisterComponent } from './costumer-registration/customer-register/customer-register.component';
// import { LandingPageComponent } from '../landing/landing.component';
import { LoginComponent } from './login/login.component';
export const AUTH_ROUTES: Routes = [

 {
    path: 'login',
    component: LoginComponent
  },


  {
    path: 'register',
    component: RegisterLayoutComponent,
    children: [
      {
        path: '',
        component: RegisterComponent
      }
    ]
  },

  {
    path: 'customer/register',
    component: CustomerRegisterComponent // Direct component, no layout needed
  },

  // DEFAULT REDIRECT
  // {
  //   path: '',
  //   redirectTo: 'register',
  //   pathMatch: 'full'
  // }
];
