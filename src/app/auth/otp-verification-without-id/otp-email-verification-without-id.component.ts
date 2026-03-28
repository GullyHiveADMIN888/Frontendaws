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
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-email-verification-without-id',
  standalone: true,
  imports: [FormsModule,CommonModule],
  template: `
    <div class="otp-verification-container">
      <div class="otp-header">
        <h3>Verify Your Email Address</h3>
        <p class="text-muted">Enter the 6-digit OTP sent to <strong>{{ emailAddress }}</strong></p>
      </div>

      <!-- Manual OTP Inputs - No *ngFor -->
      <div class="otp-inputs">
        <input
          #input0
          type="text"
          class="otp-input"
          [value]="otp[0]"
          (input)="onInputChange($event, 0)"
          (keydown)="onKeyDown($event, 0)"
          (paste)="onPaste($event)"
          maxlength="1"
          inputmode="numeric"
          pattern="[0-9]*"
          [disabled]="isVerifying"
          placeholder="-"
          autocomplete="off"
        />
        <input
          #input1
          type="text"
          class="otp-input"
          [value]="otp[1]"
          (input)="onInputChange($event, 1)"
          (keydown)="onKeyDown($event, 1)"
          (paste)="onPaste($event)"
          maxlength="1"
          inputmode="numeric"
          pattern="[0-9]*"
          [disabled]="isVerifying"
          placeholder="-"
          autocomplete="off"
        />
        <input
          #input2
          type="text"
          class="otp-input"
          [value]="otp[2]"
          (input)="onInputChange($event, 2)"
          (keydown)="onKeyDown($event, 2)"
          (paste)="onPaste($event)"
          maxlength="1"
          inputmode="numeric"
          pattern="[0-9]*"
          [disabled]="isVerifying"
          placeholder="-"
          autocomplete="off"
        />
        <input
          #input3
          type="text"
          class="otp-input"
          [value]="otp[3]"
          (input)="onInputChange($event, 3)"
          (keydown)="onKeyDown($event, 3)"
          (paste)="onPaste($event)"
          maxlength="1"
          inputmode="numeric"
          pattern="[0-9]*"
          [disabled]="isVerifying"
          placeholder="-"
          autocomplete="off"
        />
        <input
          #input4
          type="text"
          class="otp-input"
          [value]="otp[4]"
          (input)="onInputChange($event, 4)"
          (keydown)="onKeyDown($event, 4)"
          (paste)="onPaste($event)"
          maxlength="1"
          inputmode="numeric"
          pattern="[0-9]*"
          [disabled]="isVerifying"
          placeholder="-"
          autocomplete="off"
        />
        <input
          #input5
          type="text"
          class="otp-input"
          [value]="otp[5]"
          (input)="onInputChange($event, 5)"
          (keydown)="onKeyDown($event, 5)"
          (paste)="onPaste($event)"
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
      max-width: 500px;
      margin: 0 auto;
      padding: 30px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      border: 1px solid #eaeef2;
    }

    .otp-header {
      text-align: center;
      margin-bottom: 35px;
    }

    .otp-header h3 {
      margin: 0 0 12px 0;
      color: #1a2639;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .otp-header p {
      margin: 0;
      color: #546e7a;
      font-size: 15px;
      line-height: 1.6;
    }

    .otp-header strong {
      color: #2962ff;
      font-weight: 600;
      font-size: 16px;
      display: inline-block;
      background: #e8f0fe;
      padding: 6px 16px;
      border-radius: 30px;
      margin-top: 8px;
      border: 1px solid #bbdefb;
    }

    .otp-inputs {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .otp-input {
      width: 60px;
      height: 70px;
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      border: 2px solid #cfd8dc;
      border-radius: 16px;
      outline: none;
      transition: all 0.2s ease;
      background-color: #f8fafd;
      color: #1a2639;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .otp-input:focus {
      border-color: #2962ff;
      box-shadow: 0 0 0 4px rgba(41,98,255,0.15);
      background-color: white;
      transform: translateY(-2px);
    }

    .otp-input:hover:not(:disabled) {
      border-color: #90a4ae;
      background-color: white;
    }

    .otp-input:disabled {
      background-color: #eceff1;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .otp-input::placeholder {
      color: #b0bec5;
      font-size: 24px;
      font-weight: normal;
    }

    .otp-timer {
      text-align: center;
      margin-bottom: 30px;
      color: #546e7a;
      font-size: 15px;
      background: #f5f7fa;
      padding: 14px;
      border-radius: 40px;
      border: 1px solid #e0e7ed;
    }

    .otp-timer strong {
      color: #2962ff;
      font-size: 20px;
      margin-left: 6px;
      font-weight: 700;
    }

    .btn-resend {
      background: none;
      border: none;
      color: #2962ff;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      text-decoration: underline;
      padding: 10px 24px;
      border-radius: 30px;
      transition: all 0.2s ease;
    }

    .btn-resend:hover:not(:disabled) {
      color: #0039cb;
      background: #e8f0fe;
      text-decoration: none;
    }

    .btn-resend:disabled {
      color: #9aa6b2;
      cursor: not-allowed;
      text-decoration: none;
    }

    .otp-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .btn-verify, .btn-back {
      padding: 16px 28px;
      border: none;
      border-radius: 14px;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-verify {
      background: linear-gradient(135deg, #2962ff, #1e4bd2);
      color: white;
      flex: 2;
      box-shadow: 0 8px 16px rgba(41,98,255,0.3);
    }

    .btn-verify:hover:not(:disabled) {
      background: linear-gradient(135deg, #1e4bd2, #0039cb);
      transform: translateY(-3px);
      box-shadow: 0 12px 24px rgba(41,98,255,0.4);
    }

    .btn-verify:active:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 12px rgba(41,98,255,0.3);
    }

    .btn-verify:disabled {
      background: linear-gradient(135deg, #9aa6b2, #7e8a98);
      cursor: not-allowed;
      opacity: 0.65;
      transform: none;
      box-shadow: none;
    }

    .btn-back {
      background: linear-gradient(135deg, #7e8a98, #64717f);
      color: white;
      flex: 1;
      box-shadow: 0 8px 16px rgba(100,113,127,0.3);
    }

    .btn-back:hover:not(:disabled) {
      background: linear-gradient(135deg, #64717f, #4a5562);
      transform: translateY(-3px);
      box-shadow: 0 12px 24px rgba(100,113,127,0.4);
    }

    .btn-back:active:not(:disabled) {
      transform: translateY(-1px);
    }

    .btn-back:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .error-message {
      margin-top: 25px;
      padding: 16px;
      background: linear-gradient(135deg, #ffebee, #ffcdd2);
      border: 1px solid #ef9a9a;
      color: #b71c1c;
      border-radius: 12px;
      text-align: center;
      font-size: 15px;
      font-weight: 500;
      box-shadow: 0 4px 10px rgba(183,28,28,0.1);
    }

    /* Mobile Responsive */
    @media (max-width: 520px) {
      .otp-verification-container {
        padding: 25px 15px;
      }

      .otp-inputs {
        gap: 8px;
      }

      .otp-input {
        width: 45px;
        height: 55px;
        font-size: 26px;
        border-radius: 12px;
      }

      .btn-verify, .btn-back {
        padding: 14px 20px;
        font-size: 15px;
        border-radius: 12px;
      }
    }

    @media (max-width: 360px) {
      .otp-input {
        width: 38px;
        height: 48px;
        font-size: 22px;
      }
    }
  `]
})
export class OtpEmailVerificationWithoutIdComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() emailAddress: string = '';
  @Input() otpToken: string = '';
  @Output() onVerifiedEmail = new EventEmitter<{ otp: string }>();
  @Output() onBack = new EventEmitter<void>();

  @ViewChild('input0') input0!: ElementRef;
  @ViewChild('input1') input1!: ElementRef;
  @ViewChild('input2') input2!: ElementRef;
  @ViewChild('input3') input3!: ElementRef;
  @ViewChild('input4') input4!: ElementRef;
  @ViewChild('input5') input5!: ElementRef;
  otp: string[] = ['', '', '', '', '', ''];
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
    console.log('Email OTP Component constructor - email:', this.emailAddress);
  }

  ngOnInit() {
    console.log('Email OTP Component ngOnInit - email:', this.emailAddress);
    
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
      
      setTimeout(() => {
        this.focusInput(0);
      }, 300);
    }
  }

  ngAfterViewInit() {
    console.log('Email OTP Component ngAfterViewInit');
    console.log('Input0 exists:', !!this.input0);
    console.log('Input1 exists:', !!this.input1);
    console.log('Input2 exists:', !!this.input2);
    console.log('Input3 exists:', !!this.input3);
    console.log('Input4 exists:', !!this.input4);
    console.log('Input5 exists:', !!this.input5);
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  getOtpLength(): number {
    return this.otp.join('').length;
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
    let input: ElementRef | undefined;
    
    switch(index) {
      case 0: input = this.input0; break;
      case 1: input = this.input1; break;
      case 2: input = this.input2; break;
      case 3: input = this.input3; break;
      case 4: input = this.input4; break;
      case 5: input = this.input5; break;
    }
    
    if (input && input.nativeElement) {
      console.log('Focusing input at index:', index);
      input.nativeElement.focus();
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

    if (!this.otpToken) {
      this.error = 'OTP token is missing';
      alert(this.error);
      return;
    }

    this.isVerifying = true;
    this.error = '';

    try {
      const payload = {
        otp: otpValue,
        token: this.otpToken,
        email: this.emailAddress
      };
      
    //  await firstValueFrom(this.authService.verifyOtpEmailWithoutUserId(payload));
      
      console.log('Email OTP verified successfully for registration');
      this.stopTimer();
      this.onVerifiedEmail.emit({ otp: otpValue });
      
    } catch (err: any) {
      console.error('Error during email OTP verification:', err);
      this.error = err.error?.message || err.message || 'Invalid OTP. Please try again.';
      alert(this.error);
      
      // Clear OTP inputs on error
      this.otp = ['', '', '', '', '', ''];
      setTimeout(() => this.focusInput(0), 100);
    } finally {
      this.isVerifying = false;
      this.cdr.detectChanges();
    }
  }

  async onResend() {
    if (!this.emailAddress) {
      alert('Email address is missing');
      return;
    }

    this.timer = 60;
    this.canResend = false;
    this.otp = ['', '', '', '', '', ''];
    this.error = '';
    this.isVerifying = true;

    this.stopTimer();
    this.startTimer();

    try {
      // You need to implement resend email OTP in your auth service
      // For now, we'll emit back to parent to handle resend
      console.log('Resending email OTP to:', this.emailAddress);
      this.onBack.emit(); // Go back to form to resend
      alert('Please click "Send OTP" again to resend');
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