// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from './auth.service';

// export const authGuard: CanActivateFn = (route) => {
//   const auth = inject(AuthService);
//   const router = inject(Router);

//   // Not logged in
//   if (!auth.isLoggedIn()) {
//     router.navigate(['/login']);
//     return false;
//   }

//   // Role-based access
//   const allowedRoles = route.data?.['roles'] as string[];
//   const userRole = auth.getRole();

//   if (allowedRoles && !allowedRoles.includes(userRole!)) {
//     router.navigate(['/']);
//     return false;
//   }

//   return true;
// };
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = auth.isLoggedIn();

  // ❌ NOT LOGGED IN → LOGIN PAGE
  if (!isLoggedIn) {
    router.navigate(['/auth/login'], { replaceUrl: true });
    return false;
  }

  // ✅ ROLE CHECK
  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  const userRole = auth.getRole();

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    router.navigate(['/'], { replaceUrl: true });
    return false;
  }

  return true;
};