import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerStep2AddressComponent } from './customer-step2-address.component';

describe('CustomerStep2AddressComponent', () => {
  let component: CustomerStep2AddressComponent;
  let fixture: ComponentFixture<CustomerStep2AddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerStep2AddressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerStep2AddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
