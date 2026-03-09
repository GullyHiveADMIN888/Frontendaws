import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLeadsComponent } from './customer-leads.component';

describe('CustomerLeadsComponent', () => {
  let component: CustomerLeadsComponent;
  let fixture: ComponentFixture<CustomerLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerLeadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
