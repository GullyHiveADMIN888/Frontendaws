import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadStatusMasterComponent } from './lead-status-master.component';

describe('LeadStatusMasterComponent', () => {
  let component: LeadStatusMasterComponent;
  let fixture: ComponentFixture<LeadStatusMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadStatusMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadStatusMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
