import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpsManagerJobComponent } from './ops-manager-job.component';

describe('OpsManagerJobComponent', () => {
  let component: OpsManagerJobComponent;
  let fixture: ComponentFixture<OpsManagerJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpsManagerJobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpsManagerJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
