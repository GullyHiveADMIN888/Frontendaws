import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpVerificationWithoutIdComponent } from './otp-verification-without-id.component';

describe('OtpVerificationWithoutIdComponent', () => {
  let component: OtpVerificationWithoutIdComponent;
  let fixture: ComponentFixture<OtpVerificationWithoutIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpVerificationWithoutIdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtpVerificationWithoutIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
