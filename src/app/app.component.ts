// // import { Component } from '@angular/core';
// // import { RouterOutlet } from '@angular/router';

// // @Component({
// //     selector: 'app-root',
// //     standalone: true,
// //     imports: [RouterOutlet],
// //     templateUrl: './app.component.html',
// //     styleUrl: './app.component.css'
// // })
// // export class AppComponent {
// //   title = 'gullyhiveFrontend';
// // }


// import { Component, OnInit,Input  } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { AuthService } from './auth/auth.service';
// import { LandingPageComponent } from './landing/landing.component';

// @Component({
//   selector: 'app-root',
//    standalone: true,
//   imports: [RouterOutlet, LandingPageComponent], // 👈 IMPORTANT
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent implements OnInit {
//   @Input() showOnlyLogin = false; 
//   appReady = false;
//   isLoggedIn = false;

//   constructor(private authService: AuthService) {}

//   ngOnInit(): void {

//     const token = localStorage.getItem('token');

//     if (token && this.authService.isLoggedIn()) {
//       this.isLoggedIn = true;
//     } else {
//       this.isLoggedIn = false;
//     }

//     this.appReady = true;
//   }
// }

import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet  } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // ✅ THIS IS REQUIRED
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  appReady = false;
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const isWebView = this.authService.isWebView();
    const token = localStorage.getItem('token');

    this.isLoggedIn = !!token && this.authService.isLoggedIn();

    // ✅ Prevent landing page history issue in APK
    if (isWebView) {
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    } else {
      this.router.navigate(['/'], { replaceUrl: true });
    }

    // ✅ Handle Android back button behavior
    this.setupBackButtonHandler(isWebView);

    this.appReady = true;
  }

  private setupBackButtonHandler(isWebView: boolean) {
    history.pushState(null, '', location.href);

    window.addEventListener('popstate', () => {
      history.pushState(null, '', location.href);

      if (isWebView) {
        // 🔥 In APK: stay on login or exit app behavior
        const currentUrl = this.router.url;

        if (currentUrl === '/auth/login') {
          // optional: close app in real APK (Capacitor/Cordova needed)
          console.log('Exit app trigger point');
        } else {
          this.router.navigate(['/auth/login'], { replaceUrl: true });
        }
      }
    });
  }
}