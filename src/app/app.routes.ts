import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LandingPageComponent } from './landing/landing.component';

export const routes: Routes = [
 {
    path: '',
    component: LandingPageComponent,
    title: 'GullyHive - Find Trusted Professional Services'
  },
  // 🔐 Auth routes (login)
  {
    path: '',
    loadChildren: () =>
      import('./auth/auth.routes')
        .then(m => m.AUTH_ROUTES)
  },

  // 🔒 Admin routes
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['Admin', 'SuperAdmin'] },
    loadChildren: () =>
      import('./Admin/admin.module')
        .then(m => m.AdminModule)
  },

  {
  path: 'seller',
  loadChildren: () =>
    import('./Seller/seller.module').then(m => m.SellerModule)
},

// customer routes
 {
    path: 'buyer',
    canActivate: [authGuard],
    data: { roles: ['Buyer'] },
    loadChildren: () =>
      import('./customer/customer.module')
        .then(m => m.CustomerModule)
  },


  { path: '**', redirectTo: '' }
// this path redirect to home page if the url is not get 
 // { path: '**', redirectTo: '' }
];
