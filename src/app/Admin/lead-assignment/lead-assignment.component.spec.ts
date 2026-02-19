import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadAssignmentComponent } from './lead-assignment.component';

describe('LeadAssignmentComponent', () => {
  let component: LeadAssignmentComponent;
  let fixture: ComponentFixture<LeadAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
