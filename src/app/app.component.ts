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
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const isWebView = this.authService.isWebView();
    const token = localStorage.getItem('token');

    const isLoggedIn = !!token && this.authService.isLoggedIn();

    // ✅ FIX: Route based on login state
    if (isLoggedIn) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    }

    this.setupBackButtonHandler(isWebView);
  }

  private setupBackButtonHandler(isWebView: boolean) {

    history.pushState(null, '', location.href);

    window.addEventListener('popstate', () => {

      history.pushState(null, '', location.href);

      const currentUrl = this.router.url;

      if (!isWebView) return;

      // 🔥 LOGIN PAGE → EXIT APP
      if (currentUrl === '/auth/login') {
        console.log('Exit app');
        return;
      }

      // 🔥 DASHBOARD or other pages → go to login OR exit logic
      if (currentUrl === '/dashboard') {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      } else {
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      }
    });
  }
}