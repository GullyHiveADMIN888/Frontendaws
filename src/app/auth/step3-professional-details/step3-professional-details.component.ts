import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step3-professional-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step3-professional-details.component.html'
})
export class Step3ProfessionalDetailsComponent implements OnInit {
  @Input() errors: any;
  @Input() formData: any;
  @Input() isSubmitting = false;

  @Output() inputChange = new EventEmitter<{ field: string; value: any }>();
  @Output() submit = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  howKnowList: any[] = [];
  showOtherInput = false;
  OTHER_ID = 6; // ID of "Other"

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadHowKnow();
  }

  loadHowKnow() {
    this.authService.getHowKnow().subscribe({
      next: (res) => {
        this.howKnowList = res;
        // Show "Other" textarea if pre-selected ID is OTHER_ID
        this.showOtherInput = this.formData.howToKnowId === this.OTHER_ID;
      },
      error: (err) => console.error(err)
    });
  }

  onInput(field: string, value: any) {
    this.inputChange.emit({ field, value });
  }

  // onSelectHowKnow(event: any) {
  //   const selectedId = Number(event.target.value);
  //   this.onInput('howToKnowId', selectedId);

  //   // Show "Other" textarea if OTHER_ID selected
  //   this.showOtherInput = selectedId === this.OTHER_ID;

  //   // Clear "Other" field if not OTHER_ID
  //   if (!this.showOtherInput) {
  //     this.onInput('howToKnowOther', '');
  //   }
  // }
onHowToKnowChange(value: number | null) {

  this.formData.howToKnowId = value;

  // Show textarea if Other (ID = 6)
  this.showOtherInput = value === 6;

  // Clear error when user selects
  if (this.errors.howToKnowId) {
    delete this.errors.howToKnowId;
  }

  // If not Other, clear other field
  if (value !== 6) {
    this.formData.howToKnowOther = '';
    delete this.errors.howToKnowOther;
  }
}

  validateStep4(): boolean {

  this.errors = {};

  const overview = this.formData.selfOverview?.trim() || '';
  const skills = this.formData.skillsBackground?.trim() || '';

  if (!overview || overview.length < 150) {
    this.errors.selfOverview = 'Minimum 150 characters required';
  }

  if (!skills || skills.length < 50) {
    this.errors.skillsBackground = 'Minimum 50 characters required';
  }

  if (!this.formData.howToKnowId) {
    this.errors.howToKnowId = 'Please select an option';
  }

  // If "Other" selected (ID = 6)
  if (
    this.formData.howToKnowId === 6 &&
    (!this.formData.howToKnowOther || this.formData.howToKnowOther.trim().length < 3)
  ) {
    this.errors.howToKnowOther = 'Please specify how you heard about us';
  }

  return Object.keys(this.errors).length === 0;
}
scrollToFirstError() {
  setTimeout(() => {
    const firstError = document.querySelector('.text-red-500');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}
onSubmitClick() {

  if (!this.validateStep4()) {
    this.scrollToFirstError();
    return;
  }

  this.submit.emit();   // 🔥 Only emit if valid
}
}