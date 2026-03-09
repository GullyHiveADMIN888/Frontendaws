import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterFormData } from '../models/register.model';
import { validateForm } from '../register/validation-scripts';

@Component({
    selector: 'app-submit-handler',
    imports: [CommonModule],
    templateUrl: './submit-handler.component.component.html'
})
export class SubmitHandlerComponent {
  @Input() formData!: RegisterFormData;
  @Input() isSubmitting = false;

  @Output() errorsChange = new EventEmitter<Record<string, string>>();
  @Output() submittingChange = new EventEmitter<boolean>();
  @Output() submitSuccess = new EventEmitter<boolean>();

  async handleSubmit() {
    const validationErrors = validateForm(this.formData);

    if (Object.keys(validationErrors).length > 0) {
      this.errorsChange.emit(validationErrors);
      return;
    }

    this.submittingChange.emit(true);

    try {
      await new Promise(res => setTimeout(res, 2000));
      this.submitSuccess.emit(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      this.submittingChange.emit(false);
    }
  }
}
