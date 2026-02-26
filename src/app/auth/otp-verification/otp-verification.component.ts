
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
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
   // imports: [CommonModule],
  templateUrl: './otp-verification.component.html'
})
export class OTPVerificationComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthService, @Inject(PLATFORM_ID) private platformId: Object) {}

  @Input() mobile: string = '';  // default to empty string
@Input() userId: string = '';  // default to empty string
  @Output() onVerified = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();

  @Input() otpToken!: string; // JWT token for email verification
  @Input() email?: string;        // JWT for email
 @Output() onVerifiedEmail = new EventEmitter<{ otp: string }>();
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  otp: string[] = Array(6).fill('');
  timer = 60;
  canResend = false;
  isVerifying = false;
  error = '';


  private timerSubscription: Subscription | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
      setTimeout(() => this.focusInput(0), 0);
    }
  }

  ngOnDestroy() {
    this.stopTimer();
     this.authService.clearRecaptcha();
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

  // ✅ STORE the digit
  this.otp[index] = value;
  this.error = '';

  // Move forward
  if (value && index < 5) {
    this.focusInput(index + 1);
  }
}

 onKeyDown(event: KeyboardEvent, index: number) {


  // ⬅️ Move left
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    if (index > 0) {
      this.focusInput(index - 1);
    }
    return;
  }

  // ➡️ Move right
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    if (index < 5) {
      this.focusInput(index + 1);
    }
    return;
  }

  if (event.key === 'Backspace') {
    if (this.otp[index]) {
      // Clear current box
      this.otp[index] = '';
    } else if (index > 0) {
      // Go to previous box
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



// async onVerify() {
//   const otpValue = this.otp.join('');

//   if (otpValue.length !== 6) {
//     this.error = 'Enter full OTP';
//      alert(this.error); // show alert if OTP is incomplete
//     return;
//   }

//   this.isVerifying = true;
//    this.error = '';


//   try {
//     await this.authService.verifyOtp(otpValue);

//     const userId = this.authService.getUserId();
//     const phone = this.mobile; // or wherever you store the phone number

//     if (userId && phone) {
//       console.log('Calling verifyMobileOnServer...');
//       await this.authService.verifyMobileOnServer(userId, phone).toPromise();
//       console.log('verifyMobileOnServer completed');
//     }
//       console.log('verifyMobileOnServer completed...', userId, phone);
//     this.onVerified.emit();
   

//   } catch (err) {
//     console.error('Error during OTP verification:', err);
//     this.error = 'Invalid OTP';
//   } finally {
//     this.isVerifying = false;
//   }
// }

async onVerify() {
  const otpValue = this.otp.join('');

  if (otpValue.length !== 6) {
    this.error = 'Enter full OTP';
    alert(this.error);
    return;
  }

  this.isVerifying = true;
  this.error = '';

  try {
    await this.authService.verifyOtp(otpValue);

    if (this.userId && this.mobile) {
      console.log('Calling verifyMobileOnServer...', this.userId, this.mobile);
      await this.authService.verifyMobileOnServer(this.userId, this.mobile).toPromise();
      console.log('verifyMobileOnServer completed');
    }
 console.log('verifyMobileOnServer completed...', this.userId, this.mobile);
    this.onVerified.emit();
  } catch (err) {
    console.error('Error during OTP verification:', err);
    this.error = 'Invalid OTP';
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
    await this.authService.resendOtp(this.mobile.replace('+91', ''));
  } catch (e: any) {
    alert(e.message);
  }
}

  trackByIndex(index: number) {
  return index;
}
// Email OTP
async verifyEmailOtp() {
  const otpValue = this.otp.join('');
  if (otpValue.length !== 6) { alert('Enter full OTP'); return; }
  if (!this.email || !this.otpToken) { alert('Email or token missing'); return; }

  this.isVerifying = true;
  try {
    await this.authService.verifyEmailOtp({ otp: otpValue, token: this.otpToken }).toPromise();
    alert('Email verified successfully!');
    this.onVerifiedEmail.emit({ otp: otpValue });
  } catch (err: any) {
    this.error = err?.message || 'Invalid OTP';
  } finally { this.isVerifying = false; }
}
}