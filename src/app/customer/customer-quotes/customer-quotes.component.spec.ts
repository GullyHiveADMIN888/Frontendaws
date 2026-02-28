import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerQuotesComponent } from './customer-quotes.component';

describe('CustomerQuotesComponent', () => {
  let component: CustomerQuotesComponent;
  let fixture: ComponentFixture<CustomerQuotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerQuotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerQuotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
