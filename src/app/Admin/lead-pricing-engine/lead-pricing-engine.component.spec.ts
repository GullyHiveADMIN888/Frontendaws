import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadPricingEngineComponent } from './lead-pricing-engine.component';

describe('LeadPricingEngineComponent', () => {
  let component: LeadPricingEngineComponent;
  let fixture: ComponentFixture<LeadPricingEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadPricingEngineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadPricingEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
