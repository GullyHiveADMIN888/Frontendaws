// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//     selector: 'app-root',
//     standalone: true,
//     imports: [RouterOutlet],
//     templateUrl: './app.component.html',
//     styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'gullyhiveFrontend';
// }


import { Component, OnInit,Input  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { LandingPageComponent } from './landing/landing.component';

@Component({
  selector: 'app-root',
   standalone: true,
  imports: [RouterOutlet, LandingPageComponent], // 👈 IMPORTANT
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  @Input() showOnlyLogin = false; 
  appReady = false;
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {

    const token = localStorage.getItem('token');

    if (token && this.authService.isLoggedIn()) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }

    this.appReady = true;
  }
}