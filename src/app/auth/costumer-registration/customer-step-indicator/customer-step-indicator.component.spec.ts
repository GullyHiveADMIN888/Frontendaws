import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerStepIndicatorComponent } from './customer-step-indicator.component';

describe('CustomerStepIndicatorComponent', () => {
  let component: CustomerStepIndicatorComponent;
  let fixture: ComponentFixture<CustomerStepIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerStepIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerStepIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
