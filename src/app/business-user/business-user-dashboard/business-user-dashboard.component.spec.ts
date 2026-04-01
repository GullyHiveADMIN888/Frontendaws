import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessUserDashboardComponent } from './business-user-dashboard.component';

describe('BusinessUserDashboardComponent', () => {
  let component: BusinessUserDashboardComponent;
  let fixture: ComponentFixture<BusinessUserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessUserDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessUserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
