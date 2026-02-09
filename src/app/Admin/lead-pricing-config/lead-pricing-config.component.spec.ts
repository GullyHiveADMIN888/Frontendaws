import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadPricingConfigComponent } from './lead-pricing-config.component';

describe('LeadPricingConfigComponent', () => {
  let component: LeadPricingConfigComponent;
  let fixture: ComponentFixture<LeadPricingConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadPricingConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadPricingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
