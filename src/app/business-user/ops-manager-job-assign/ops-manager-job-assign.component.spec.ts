import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpsManagerJobAssignComponent } from './ops-manager-job-assign.component';

describe('OpsManagerJobAssignComponent', () => {
  let component: OpsManagerJobAssignComponent;
  let fixture: ComponentFixture<OpsManagerJobAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpsManagerJobAssignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpsManagerJobAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
