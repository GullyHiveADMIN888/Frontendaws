import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  key: number;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-customer-step-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-step-indicator.component.html'
})
export class CustomerStepIndicatorComponent {
  @Input() currentStep = 1;
  @Input() totalSteps = 3;

  steps: Step[] = [
    { key: 1, title: 'Basic Information', icon: 'ri-user-line' },
    { key: 2, title: 'Address Details', icon: 'ri-map-pin-line' },
    { key: 3, title: 'Preferences', icon: 'ri-settings-line' }
  ];
}