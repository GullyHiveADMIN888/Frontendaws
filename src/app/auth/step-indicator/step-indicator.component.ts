
// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';

// interface Step {
//   key: number; 
//   title: string;
//   icon: string;
// }

// @Component({
//     selector: 'app-step-indicator',
//     standalone: true,
//     imports: [CommonModule], // REQUIRED
//     templateUrl: './step-indicator.component.html'
// })


// export class StepIndicatorComponent {
//   @Input() currentStep = 1;
//   @Input() totalSteps = 3;
//   steps: Step[] = [
//     { key: 1, title: 'Basic Information', icon: 'ri-user-line' },
//     { key: 3, title: 'Legal Identity', icon: 'ri-file-text-line' },
//     { key: 4, title: 'Professional Details', icon: 'ri-award-line' }
//   ];

  
// }

import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  key: number;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-indicator.component.html'
})
export class StepIndicatorComponent implements OnChanges {

  @Input() currentStep = 1;
  @Input() providerType: string | null = null;

  steps: Step[] = [];

  ngOnChanges() {
    if (this.providerType === 'INDIVIDUAL') {
      this.steps = [
        { key: 1, title: 'Basic Information', icon: 'ri-user-line' },
        { key: 3, title: 'Legal Identity', icon: 'ri-file-text-line' },
        { key: 4, title: 'Professional Details', icon: 'ri-award-line' }
      ];
    }

    if (this.providerType === 'MSME' || this.providerType === 'COMPANY') {
      this.steps = [
       
        { key: 10, title: 'Business Details', icon: 'ri-briefcase-line' },
        { key: 11, title: 'Authorization Info', icon: 'ri-building-line' },
        { key: 12, title: 'Professional Details', icon: 'ri-file-upload-line' }
      ];
    }
  }
}