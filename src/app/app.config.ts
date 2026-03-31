// // import { ApplicationConfig } from '@angular/core';
// // import { provideRouter } from '@angular/router';
// // import { provideHttpClient, withInterceptors } from '@angular/common/http';
// // import { routes } from './app.routes';
// // import { provideAnimations } from '@angular/platform-browser/animations';
// // import { jwtInterceptor } from './auth/jwt.interceptor';

// // export const appConfig: ApplicationConfig = {
// //   providers: [
// //     provideRouter(routes),
// //       provideAnimations(),
// //     provideHttpClient(
// //       withInterceptors([jwtInterceptor])
// //     )
// //   ]
// // };



// import { ApplicationConfig } from '@angular/core';
// import { provideRouter, withHashLocation } from '@angular/router';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { provideAnimations } from '@angular/platform-browser/animations';

// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideAuth, getAuth } from '@angular/fire/auth';

// import { routes } from './app.routes';
// import { jwtInterceptor } from './auth/jwt.interceptor';
// import { environment } from '../environments/environment';
// import { debugInterceptor } from './auth/debug.interceptor';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes, withHashLocation()),
//     // provideRouter(routes),
//     provideAnimations(),
//     provideHttpClient(withInterceptors([jwtInterceptor])),

//     // 🔥 Firebase
//     provideFirebaseApp(() => initializeApp(environment.firebase)),
//     provideAuth(() => getAuth()),
//   ]
// };



import { ApplicationConfig, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter, withHashLocation, Router } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { jwtInterceptor } from './auth/jwt.interceptor';
// import { environment } from '../environments/environment';
  import { environment } from '../environments/environment.prod';
import { AuthService } from './auth/auth.service';


// 🔥 AUTO LOGIN + ROLE REDIRECT
export function appInitializer() {
  return () => {

    const auth = inject(AuthService);
    const router = inject(Router);

    const token = auth.getToken();

    if (token && auth.isLoggedIn()) {

      const role = auth.getRole();

      switch (role) {

        case 'Admin':
        case 'SuperAdmin':
          router.navigate(['/admin']);
          break;

        case 'Seller':
          router.navigate(['/seller']);
          break;

        case 'Buyer':
          router.navigate(['/buyer']);
          break;

        case 'Provider_User_Admin':
          router.navigate(['/provider_User_Admin']);
          break;

        case 'Provider_User_Ops_Manager':
          router.navigate(['/provider_User_Ops_Manager']);
          break;

        default:
          router.navigate(['/']);
      }
    }
  };
}


// 🔥 APP CONFIG
export const appConfig: ApplicationConfig = {
  providers: [

    // Router (WebView safe)
    provideRouter(routes, withHashLocation()),

    // Animations
    provideAnimations(),

    // HTTP + JWT Interceptor
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),

    // Firebase
    provideFirebaseApp(() =>
      initializeApp(environment.firebase)
    ),
    provideAuth(() => getAuth()),

    // 🔥 AUTO LOGIN INITIALIZER
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true
    }
  ]
};