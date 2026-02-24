import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-step3-professional-details',
  standalone: true,
  imports: [CommonModule],
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

  onSelectHowKnow(event: any) {
    const selectedId = Number(event.target.value);
    this.onInput('howToKnowId', selectedId);

    // Show "Other" textarea if OTHER_ID selected
    this.showOtherInput = selectedId === this.OTHER_ID;

    // Clear "Other" field if not OTHER_ID
    if (!this.showOtherInput) {
      this.onInput('howToKnowOther', '');
    }
  }
}