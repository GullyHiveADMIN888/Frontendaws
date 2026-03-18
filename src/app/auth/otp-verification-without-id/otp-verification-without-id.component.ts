import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  AfterViewInit,
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
        <p class="text-muted">Enter the 6-digit OTP sent to <strong>{{ mobile }}</strong></p>
      </div>

      <!-- Debug info - remove after fixing -->
      <div style="background: #f0f0f0; padding: 5px; margin-bottom: 10px; font-size: 12px; text-align: center;">
        OTP Inputs: {{ otp.length }} boxes | First value: "{{ otp[0] }}" | Verifying: {{ isVerifying }}
      </div>

      <div class="otp-inputs">
        <input
          *ngFor="let digit of otp; let i = index; trackBy: trackByIndex"
          #otpInput
          type="text"
          class="otp-input"
          [value]="digit"
          (input)="onInputChange($event, i)"
          (keydown)="onKeyDown($event, i)"
          (paste)="onPaste($event)"
          (focus)="$event.target.select()"
          maxlength="1"
          inputmode="numeric"
          pattern="[0-9]*"
          [disabled]="isVerifying"
          placeholder="-"
          autocomplete="off"
        />
      </div>

      <div class="otp-timer">
        <p *ngIf="!canResend">Resend OTP in <strong>{{ timer }}</strong> seconds</p>
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
      max-width: 450px;
      margin: 0 auto;
      padding: 25px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1px solid #e0e0e0;
    }

    .otp-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .otp-header h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.4rem;
      font-weight: 600;
    }

    .otp-header p {
      margin: 0;
      color: #666;
      font-size: 15px;
    }

    .otp-header strong {
      color: #007bff;
      font-weight: 600;
    }

    .otp-inputs {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
    }

    .otp-input {
      width: 50px;
      height: 55px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      border: 2px solid #ddd;
      border-radius: 10px;
      outline: none;
      transition: all 0.2s ease;
      background-color: #fafafa;
      color: #333;
    }

    .otp-input:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
      background-color: white;
    }

    .otp-input:disabled {
      background-color: #f0f0f0;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .otp-input::placeholder {
      color: #ccc;
      font-size: 18px;
    }

    .otp-timer {
      text-align: center;
      margin-bottom: 25px;
      color: #666;
      font-size: 15px;
    }

    .otp-timer strong {
      color: #007bff;
      font-size: 18px;
    }

    .btn-resend {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      font-size: 15px;
      text-decoration: underline;
      padding: 8px 16px;
      font-weight: 500;
    }

    .btn-resend:hover:not(:disabled) {
      color: #0056b3;
      text-decoration: none;
    }

    .btn-resend:disabled {
      color: #999;
      cursor: not-allowed;
      text-decoration: none;
    }

    .otp-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-verify, .btn-back {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-verify {
      background-color: #007bff;
      color: white;
      flex: 2;
    }

    .btn-verify:hover:not(:disabled) {
      background-color: #0069d9;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,123,255,0.3);
    }

    .btn-verify:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
      opacity: 0.65;
      transform: none;
      box-shadow: none;
    }

    .btn-back {
      background-color: #6c757d;
      color: white;
      flex: 1;
    }

    .btn-back:hover:not(:disabled) {
      background-color: #5a6268;
      transform: translateY(-1px);
    }

    .btn-back:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .error-message {
      margin-top: 20px;
      padding: 12px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
    }
  `]
})
export class OTPVerificationWithoutIdComponent implements OnInit, OnDestroy, AfterViewInit {
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
  ) {
    console.log('OTP Component constructor - mobile:', this.mobile);
  }

  ngOnInit() {
    console.log('OTP Component ngOnInit - mobile:', this.mobile);
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
      // Focus first input after a short delay
      setTimeout(() => {
        console.log('Attempting to focus first input');
        this.focusInput(0);
      }, 300);
    }
  }

  ngAfterViewInit() {
    console.log('OTP Component ngAfterViewInit');
    console.log('OTP Inputs count:', this.otpInputs?.length);
    
    if (this.otpInputs && this.otpInputs.length > 0) {
      console.log('First input exists:', this.otpInputs.first);
    } else {
      console.error('No OTP inputs found in DOM!');
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.stopTimer(); // Clear any existing timer
    this.timer = 60;
    this.canResend = false;

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
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  focusInput(index: number) {
    if (!this.otpInputs) {
      console.log('otpInputs not available yet');
      return;
    }
    
    const inputs = this.otpInputs.toArray();
    if (inputs && inputs[index]) {
      console.log('Focusing input at index:', index);
      inputs[index].nativeElement.focus();
    } else {
      console.log('Input at index', index, 'not found');
    }
  }

  onInputChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Allow only digits
    value = value.replace(/\D/g, '');
    
    // Take only the last character if multiple are entered
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }
    
    this.otp[index] = value;
    this.error = '';

    console.log(`Input ${index} changed to:`, value);
    console.log('Current OTP:', this.otp.join(''));

    // Auto-focus next input
    if (value && index < 5) {
      setTimeout(() => this.focusInput(index + 1), 10);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    // Left arrow
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (index > 0) {
        this.focusInput(index - 1);
      }
      return;
    }

    // Right arrow
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (index < 5) {
        this.focusInput(index + 1);
      }
      return;
    }

    // Backspace
    if (event.key === 'Backspace') {
      if (this.otp[index]) {
        // Clear current box
        this.otp[index] = '';
      } else if (index > 0) {
        // Move to previous box and clear it
        this.focusInput(index - 1);
        setTimeout(() => {
          this.otp[index - 1] = '';
        }, 10);
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedData = clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    console.log('Pasted data:', pastedData);
    
    // Fill OTP inputs
    for (let i = 0; i < pastedData.length; i++) {
      this.otp[i] = pastedData.charAt(i);
    }
    
    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    setTimeout(() => this.focusInput(nextIndex), 10);
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
      console.log('Verifying OTP:', otpValue);
      await this.authService.verifyOtp(otpValue);
      
      console.log('OTP verified successfully for registration');
      this.stopTimer();
      this.onVerified.emit();
      
    } catch (err: any) {
      console.error('Error during OTP verification:', err);
      this.error = err.message || 'Invalid OTP. Please try again.';
      alert(this.error);
      
      // Clear OTP inputs on error
      this.otp = Array(6).fill('');
      setTimeout(() => this.focusInput(0), 100);
    } finally {
      this.isVerifying = false;
    }
  }

  async onResend() {
    this.timer = 60;
    this.canResend = false;
    this.otp = Array(6).fill('');
    this.error = '';
    this.isVerifying = true;

    this.stopTimer();
    this.startTimer();

    try {
      console.log('Resending OTP for mobile:', this.mobile);
      await this.authService.resendOtp(this.mobile);
      alert('OTP resent successfully!');
      setTimeout(() => this.focusInput(0), 100);
    } catch (e: any) {
      console.error('Error resending OTP:', e);
      alert(e.message || 'Failed to resend OTP');
    } finally {
      this.isVerifying = false;
    }
  }

  trackByIndex(index: number) {
    return index;
  }
}