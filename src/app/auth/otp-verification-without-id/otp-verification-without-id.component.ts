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
  PLATFORM_ID,
  ChangeDetectorRef
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
      <div class="debug-info" *ngIf="false">
        OTP Array Length: {{ otp.length || 0 }} | Verifying: {{ isVerifying }}
      </div>

      <div class="otp-inputs">
        <input
          *ngFor="let digit of otp; let i = index; trackBy: trackByIndex"
          #otpInput
          type="text"
          class="otp-input"
          [value]="otp[i]"
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
          [disabled]="isVerifying || getOtpLength() !== 6">
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
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border: 1px solid #e0e0e0;
    }

    .otp-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .otp-header h3 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .otp-header p {
      margin: 0;
      color: #666;
      font-size: 15px;
      line-height: 1.5;
    }

    .otp-header strong {
      color: #007bff;
      font-weight: 600;
      font-size: 16px;
      display: inline-block;
      background: #f0f7ff;
      padding: 4px 10px;
      border-radius: 20px;
      margin-top: 5px;
    }

    .otp-inputs {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
    }

    .otp-input {
      width: 55px;
      height: 60px;
      text-align: center;
      font-size: 26px;
      font-weight: bold;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      outline: none;
      transition: all 0.2s ease;
      background-color: #fafafa;
      color: #333;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .otp-input:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 4px rgba(0,123,255,0.15);
      background-color: white;
      transform: translateY(-1px);
    }

    .otp-input:hover:not(:disabled) {
      border-color: #999;
      background-color: white;
    }

    .otp-input:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .otp-input::placeholder {
      color: #ccc;
      font-size: 20px;
      font-weight: normal;
    }

    .otp-timer {
      text-align: center;
      margin-bottom: 25px;
      color: #666;
      font-size: 15px;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 30px;
    }

    .otp-timer strong {
      color: #007bff;
      font-size: 18px;
      margin-left: 5px;
    }

    .btn-resend {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      text-decoration: underline;
      padding: 8px 20px;
      border-radius: 20px;
      transition: all 0.2s ease;
    }

    .btn-resend:hover:not(:disabled) {
      color: #0056b3;
      background: #e8f0fe;
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
      padding: 14px 24px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-verify {
      background: linear-gradient(135deg, #007bff, #0062cc);
      color: white;
      flex: 2;
      box-shadow: 0 4px 10px rgba(0,123,255,0.3);
    }

    .btn-verify:hover:not(:disabled) {
      background: linear-gradient(135deg, #0069d9, #0056b3);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0,123,255,0.4);
    }

    .btn-verify:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 5px rgba(0,123,255,0.3);
    }

    .btn-verify:disabled {
      background: linear-gradient(135deg, #6c757d, #5a6268);
      cursor: not-allowed;
      opacity: 0.65;
      transform: none;
      box-shadow: none;
    }

    .btn-back {
      background: linear-gradient(135deg, #6c757d, #5a6268);
      color: white;
      flex: 1;
      box-shadow: 0 4px 10px rgba(108,117,125,0.3);
    }

    .btn-back:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6268, #495057);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(108,117,125,0.4);
    }

    .btn-back:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-back:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .error-message {
      margin-top: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #f8d7da, #f5c6cb);
      border: 1px solid #f5c6cb;
      color: #721c24;
      border-radius: 10px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(220,53,69,0.1);
    }

    .debug-info {
      background: #e3f2fd;
      padding: 8px;
      margin-bottom: 15px;
      border-radius: 4px;
      font-size: 13px;
      text-align: center;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      .otp-verification-container {
        padding: 20px 15px;
      }

      .otp-inputs {
        gap: 8px;
      }

      .otp-input {
        width: 45px;
        height: 50px;
        font-size: 22px;
      }

      .btn-verify, .btn-back {
        padding: 12px 16px;
        font-size: 14px;
      }
    }
  `]
})
export class OTPVerificationWithoutIdComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() mobile: string = '';
  @Output() onVerified = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  otp: string[] = [];
  timer = 60;
  canResend = false;
  isVerifying = false;
  error = '';

  private timerSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('OTP Component constructor - mobile:', this.mobile);
    this.initializeOtp();
  }

  private initializeOtp() {
    this.otp = Array(6).fill('');
    console.log('OTP initialized:', this.otp);
  }

  ngOnInit() {
    console.log('OTP Component ngOnInit - mobile:', this.mobile);
    console.log('OTP array:', this.otp);
    
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
      
      // Force multiple change detections to ensure rendering
      setTimeout(() => {
        this.cdr.detectChanges();
        console.log('After first detectChanges');
      }, 100);
      
      setTimeout(() => {
        this.cdr.detectChanges();
        console.log('After second detectChanges - attempting focus');
        this.focusInput(0);
      }, 300);
    }
  }

  ngAfterViewInit() {
    console.log('OTP Component ngAfterViewInit');
    console.log('OTP Inputs count:', this.otpInputs?.length);
    console.log('OTP array length:', this.otp?.length);
    
    if (this.otpInputs && this.otpInputs.length > 0) {
      console.log('✓ OTP inputs successfully rendered');
    } else {
      console.error('✗ No OTP inputs found! Forcing re-render...');
      // Force re-render if inputs not found
      setTimeout(() => {
        this.cdr.detectChanges();
        console.log('Forced re-render complete');
      }, 500);
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  getOtpLength(): number {
    return this.otp ? this.otp.join('').length : 0;
  }

  startTimer() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.stopTimer();
    this.timer = 60;
    this.canResend = false;

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timer > 0) {
        this.timer--;
        this.cdr.detectChanges();
      } else {
        this.canResend = true;
        this.stopTimer();
        this.cdr.detectChanges();
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
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }
    
    this.otp[index] = value;
    this.error = '';

    if (value && index < 5) {
      setTimeout(() => this.focusInput(index + 1), 10);
    }
    
    this.cdr.detectChanges();
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
      event.preventDefault();
      if (this.otp[index]) {
        this.otp[index] = '';
      } else if (index > 0) {
        this.focusInput(index - 1);
        setTimeout(() => {
          this.otp[index - 1] = '';
          this.cdr.detectChanges();
        }, 10);
      }
      this.cdr.detectChanges();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedData = clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    console.log('Pasted data:', pastedData);
    
    for (let i = 0; i < pastedData.length; i++) {
      this.otp[i] = pastedData.charAt(i);
    }
    
    this.cdr.detectChanges();
    
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
      this.cdr.detectChanges();
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
      this.cdr.detectChanges();
    }
  }

  trackByIndex(index: number) {
    return index;
  }
}
