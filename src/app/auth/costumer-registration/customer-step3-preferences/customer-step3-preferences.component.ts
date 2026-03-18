import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-customer-step3-preferences',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './customer-step3-preferences.component.html'
})
export class CustomerStep3PreferencesComponent {
  @Input() formData: any;
  @Input() errors: any;
  @Input() isSubmitting = false;
  @Output() inputChange = new EventEmitter<{ field: string; value: any }>();
  @Output() submit = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  termsAccepted = false;
  termsError = '';

  languageMap: { [key: string]: string } = {
    'en': 'English',
    'hi': 'हिन्दी (Hindi)',
    'mr': 'मराठी (Marathi)',
    'bn': 'বাংলা (Bengali)',
    'te': 'తెలుగు (Telugu)',
    'ta': 'தமிழ் (Tamil)',
    'gu': 'ગુજરાતી (Gujarati)',
    'kn': 'ಕನ್ನಡ (Kannada)',
    'ml': 'മലയാളം (Malayalam)',
    'or': 'ଓଡ଼ିଆ (Odia)',
    'pa': 'ਪੰਜਾਬੀ (Punjabi)'
  };

  onInput(field: string, value: any) {
    this.formData[field] = value;
    this.inputChange.emit({ field, value });
  }

  onTermsChange() {
    this.termsError = '';
  }

  getLanguageName(code: string): string {
    return this.languageMap[code] || code || 'English';
  }

  onSubmit() {
    if (!this.termsAccepted) {
      this.termsError = 'Please accept the Terms and Conditions to continue';
      return;
    }
    this.submit.emit();
  }
}