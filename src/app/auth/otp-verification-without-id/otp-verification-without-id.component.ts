import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-otp-verification-without-id',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="otp-verification-container">
      <div class="otp-header">
        <h3>Verify Your Mobile Number</h3>
        <p class="text-muted">Enter the 6-digit OTP sent to {{ mobile }}</p>
      </div>

      <div class="otp-inputs">
        <input
          *ngFor="let digit of otp; let i = index"
          #otpInput
          type="text"
          class="otp-input"
          [value]="digit"
          (input)="onInputChange($event, i)"
          (keydown)="onKeyDown($event, i)"
          (paste)="onPaste($event)"
          maxlength="1"
          inputmode="numeric"
          pattern="[0-9]*"
          [disabled]="isVerifying"
        />
      </div>

      <div class="otp-timer">
        <p *ngIf="!canResend">Resend OTP in {{ timer }} seconds</p>
        <button 
          *ngIf="canResend" 
          class="btn-resend" 
          (click)="onResend()" 
          [disabled]="isVerifying">
          Resend OTP
        </button>
      </div>

      <div class="otp-actions">
        <button 
          class="btn-verify" 
          (click)="onVerify()" 
          [disabled]="isVerifying || otp.join('').length !== 6">
          <span *ngIf="!isVerifying">Verify OTP</span>
          <span *ngIf="isVerifying">Verifying...</span>
        </button>
        <button class="btn-back" (click)="onBack.emit()" [disabled]="isVerifying">
          Back
        </button>
      </div>

      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .otp-verification-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .otp-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .otp-header h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .otp-header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .otp-inputs {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 20px;
    }

    .otp-input {
      width: 45px;
      height: 45px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      border: 2px solid #ddd;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.15s ease-in-out;
    }

    .otp-input:focus {
      border-color: #007bff;
    }

    .otp-input:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    .otp-timer {
      text-align: center;
      margin-bottom: 20px;
      color: #666;
    }

    .btn-resend {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      font-size: 14px;
      text-decoration: underline;
    }

    .btn-resend:disabled {
      color: #999;
      cursor: not-allowed;
      text-decoration: none;
    }

    .otp-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .btn-verify, .btn-back {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease-in-out;
    }

    .btn-verify {
      background-color: #007bff;
      color: white;
      flex: 2;
    }

    .btn-verify:hover:not(:disabled) {
      background-color: #0069d9;
    }

    .btn-verify:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .btn-back {
      background-color: #6c757d;
      color: white;
      flex: 1;
    }

    .btn-back:hover:not(:disabled) {
      background-color: #5a6268;
    }

    .btn-back:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message {
      margin-top: 15px;
      padding: 10px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      border-radius: 4px;
      text-align: center;
      font-size: 14px;
    }
  `]
})
export class OTPVerificationWithoutIdComponent implements OnInit, OnDestroy {
  @Input() mobile: string = '';
  @Output() onVerified = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  otp: string[] = Array(6).fill('');
  timer = 60;
  canResend = false;
  isVerifying = false;
  error = '';

  private timerSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
      setTimeout(() => this.focusInput(0), 0);
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.canResend = true;
        this.stopTimer();
      }
    });
  }

  stopTimer() {
    this.timerSubscription?.unsubscribe();
  }

  focusInput(index: number) {
    const input = this.otpInputs?.toArray()[index];
    if (input) input.nativeElement.focus();
  }

  onInputChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);

    this.otp[index] = value;
    this.error = '';

    if (value && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (index > 0) {
        this.focusInput(index - 1);
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (index < 5) {
        this.focusInput(index + 1);
      }
      return;
    }

    if (event.key === 'Backspace') {
      if (this.otp[index]) {
        this.otp[index] = '';
      } else if (index > 0) {
        this.focusInput(index - 1);
        this.otp[index - 1] = '';
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedData = clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    pastedData.split('').forEach((char, i) => {
      this.otp[i] = char;
    });

    setTimeout(() => this.focusInput(Math.min(pastedData.length, 5)), 0);
  }

  async onVerify() {
    const otpValue = this.otp.join('');

    if (otpValue.length !== 6) {
      this.error = 'Please enter complete 6-digit OTP';
      alert(this.error);
      return;
    }

    this.isVerifying = true;
    this.error = '';

    try {
      // Step 1: Firebase OTP verification
      await this.authService.verifyOtp(otpValue);
      
      // Step 2: For registration flow, just emit verified event
      // No server call to verify user existence
      console.log('OTP verified successfully for registration');
      this.onVerified.emit();
      
    } catch (err: any) {
      console.error('Error during OTP verification:', err);
      this.error = err.message || 'Invalid OTP. Please try again.';
      alert(this.error);
    } finally {
      this.isVerifying = false;
    }
  }

  async onResend() {
    this.timer = 60;
    this.canResend = false;
    this.otp = Array(6).fill('');
    this.error = '';

    this.stopTimer();
    this.startTimer();

    try {
      // Extract just the number without +91
      const mobileNumber = this.mobile.replace('+91', '');
      await this.authService.resendOtp(mobileNumber);
    } catch (e: any) {
      alert(e.message);
    }
  }

  trackByIndex(index: number) {
    return index;
  }
}