 import { Component } from '@angular/core';
 import { RouterModule, RouterOutlet } from '@angular/router';
 import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register-layout',
    imports: [RouterOutlet, CommonModule, RouterModule], // ✅ include CommonModule
    templateUrl: './register-layout.component.html'
})
export class RegisterLayoutComponent {
  currentStep = 1;
  totalSteps = 3; // define totalSteps for ngFor line
  steps = [
    { number: 1, title: 'Basic Info', icon: 'ri-user-line' },
    { number: 2, title: 'Legal Identity', icon: 'ri-file-text-line' },
    { number: 3, title: 'Professional Details', icon: 'ri-briefcase-line' },
  ];
}

