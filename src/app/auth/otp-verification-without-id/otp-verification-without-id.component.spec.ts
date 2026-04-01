import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OTPVerificationWithoutIdComponent } from './otp-verification-without-id.component';

describe('OtpVerificationWithoutIdComponent', () => {
  let component: OTPVerificationWithoutIdComponent;
  let fixture: ComponentFixture<OTPVerificationWithoutIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OTPVerificationWithoutIdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OTPVerificationWithoutIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
