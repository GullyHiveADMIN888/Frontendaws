// import { ApplicationConfig } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { routes } from './app.routes';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { jwtInterceptor } from './auth/jwt.interceptor';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes),
//       provideAnimations(),
//     provideHttpClient(
//       withInterceptors([jwtInterceptor])
//     )
//   ]
// };



import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { jwtInterceptor } from './auth/jwt.interceptor';
import { environment } from '../environments/environment';
import { debugInterceptor } from './auth/debug.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    // provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([jwtInterceptor])),

    // 🔥 Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
  ]
};



