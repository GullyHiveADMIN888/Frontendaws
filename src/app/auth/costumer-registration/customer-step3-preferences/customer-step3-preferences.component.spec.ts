import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerStep3PreferencesComponent } from './customer-step3-preferences.component';

describe('CustomerStep3PreferencesComponent', () => {
  let component: CustomerStep3PreferencesComponent;
  let fixture: ComponentFixture<CustomerStep3PreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerStep3PreferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerStep3PreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
