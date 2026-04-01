import { Routes } from '@angular/router';
import { authGuard ,rootRedirectGuard} from './auth/auth.guard';
import { LandingPageComponent } from './landing/landing.component';
import { EmployeeRegistrationComponent } from './invitationForm/employee-registration/employee-registration.component';
import { InvitationGeneratorComponent } from './Admin/invitation-generator/invitation-generator.component';



// export const routes: Routes = [

 
// {
//   path: '',
//   pathMatch: 'full',
//   canActivate: [authGuard]
// },
//   // AUTH
//   {
//     path: 'auth',
//     loadChildren: () =>
//       import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
//   },

//   // ADMIN
//   {
//     path: 'admin',
//     canActivate: [authGuard],
//     data: { roles: ['Admin', 'SuperAdmin'] },
//     loadChildren: () =>
//       import('./Admin/admin.module').then(m => m.AdminModule)
//   },

//   // SELLER
//   {
//     path: 'seller',
//     canActivate: [authGuard],
//     data: { roles: ['Seller'] },
//     loadChildren: () =>
//       import('./Seller/seller.module').then(m => m.SellerModule)
//   },

//   // PROVIDER ADMIN
//   {
//     path: 'provider_User_Admin',
//     canActivate: [authGuard],
//     data: { roles: ['Provider_User_Admin'] },
//     loadChildren: () =>
//       import('./business/business.module').then(m => m.BusinessModule)
//   },

//   // OPS MANAGER
//   {
//     path: 'provider_User_Ops_Manager',
//     canActivate: [authGuard],
//     data: { roles: ['Provider_User_Ops_Manager'] },
//     loadChildren: () =>
//       import('./business-user/business-user.module')
//         .then(m => m.BusinessUserModule)
//   },

//   // BUYER
//   {
//     path: 'buyer',
//     canActivate: [authGuard],
//     data: { roles: ['Buyer'] },
//     loadChildren: () =>
//       import('./customer/customer.module')
//         .then(m => m.CustomerModule)
//   },

//   // PUBLIC ROUTES
//   {
//     path: 'register/member',
//     component: EmployeeRegistrationComponent
//   },
//   {
//     path: 'invite/generate',
//     component: InvitationGeneratorComponent
//   },

//   // fallback
//   { path: '**', redirectTo: '' }
// ];

export const routes: Routes = [

  // // 🔥 ROOT DECISION POINT

  //   // ROOT HANDLER
  // {
  //   path: '',
  //   pathMatch: 'full',
  //   canActivate: [rootRedirectGuard]
  // },
{
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
    // canActivate: [rootRedirectGuard]
  },
  // Landing Page (desktop only)
  {
    path: 'home',
    component: LandingPageComponent
  },


  // AUTH
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // ADMIN
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['Admin', 'SuperAdmin'] },
    loadChildren: () =>
      import('./Admin/admin.module').then(m => m.AdminModule)
  },

  // SELLER
  {
    path: 'seller',
    canActivate: [authGuard],
    data: { roles: ['Seller'] },
    loadChildren: () =>
      import('./Seller/seller.module').then(m => m.SellerModule)
  },

  // PROVIDER ADMIN
  {
    path: 'provider_User_Admin',
    canActivate: [authGuard],
    data: { roles: ['Provider_User_Admin'] },
    loadChildren: () =>
      import('./business/business.module').then(m => m.BusinessModule)
  },

  // OPS MANAGER
  {
    path: 'provider_User_Ops_Manager',
    canActivate: [authGuard],
    data: { roles: ['Provider_User_Ops_Manager'] },
    loadChildren: () =>
      import('./business-user/business-user.module')
        .then(m => m.BusinessUserModule)
  },

  // BUYER
  {
    path: 'buyer',
    canActivate: [authGuard],
    data: { roles: ['Buyer'] },
    loadChildren: () =>
      import('./customer/customer.module')
        .then(m => m.CustomerModule)
  },

  // PUBLIC
  {
    path: 'register/member',
    component: EmployeeRegistrationComponent
  },
  {
    path: 'invite/generate',
    component: InvitationGeneratorComponent
  },

  // FALLBACK
  { path: '**', redirectTo: '' }
];