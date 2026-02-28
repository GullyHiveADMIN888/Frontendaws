import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerStep1BasicInfoComponent } from './customer-step1-basic-info.component';

describe('CustomerStep1BasicInfoComponent', () => {
  let component: CustomerStep1BasicInfoComponent;
  let fixture: ComponentFixture<CustomerStep1BasicInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerStep1BasicInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerStep1BasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
