import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-error-message',
    imports: [],
    template: `
    @if (error) {
      <p class="text-red-500 text-sm mt-1">{{ error }}</p>
    }
    `
})
export class ErrorMessageComponent {
  @Input() error = '';
}
