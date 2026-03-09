import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-error-message',
    imports: [CommonModule],
    template: `
    <p *ngIf="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
  `
})
export class ErrorMessageComponent {
  @Input() error = '';
}
