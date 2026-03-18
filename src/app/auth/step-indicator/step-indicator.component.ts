// import { Component, Input } from '@angular/core';

// interface Step {
//   number: number;
//   title: string;
//   icon: string;
// }

// @Component({
//   selector: 'app-step-indicator',
//   standalone: true,
//   templateUrl: './step-indicator.component.html'
// })
// export class StepIndicatorComponent {
//   @Input() currentStep!: number;
//   @Input() totalSteps!: number;

//   steps: Step[] = [
//     { number: 1, title: 'Basic Information', icon: 'ri-user-line' },
//     { number: 2, title: 'Legal Identity', icon: 'ri-file-text-line' },
//     { number: 3, title: 'Professional Details', icon: 'ri-award-line' },
//   ];
// }


import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  //number: number;
  key: number; 
  title: string;
  icon: string;
}

@Component({
    selector: 'app-step-indicator',
    standalone: true,
    imports: [CommonModule], // REQUIRED
    templateUrl: './step-indicator.component.html'
})
// export class StepIndicatorComponent {
//   @Input() currentStep = 1;
//   @Input() totalSteps = 3;

//   steps: Step[] = [
//     { number: 1, title: 'Basic Information', icon: 'ri-user-line' },
//     { number: 3, title: 'Legal Identity', icon: 'ri-file-text-line' },
//     { number: 4, title: 'Professional Details', icon: 'ri-award-line' }
//   ];
// }



export class StepIndicatorComponent {
  @Input() currentStep = 1;
  @Input() totalSteps = 3;
  steps: Step[] = [
    { key: 1, title: 'Basic Information', icon: 'ri-user-line' },
    { key: 3, title: 'Legal Identity', icon: 'ri-file-text-line' },
    { key: 4, title: 'Professional Details', icon: 'ri-award-line' }
  ];

  
}

