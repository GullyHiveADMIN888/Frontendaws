import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpsManagerProfileComponent } from './ops-manager-profile.component';

describe('OpsManagerProfileComponent', () => {
  let component: OpsManagerProfileComponent;
  let fixture: ComponentFixture<OpsManagerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpsManagerProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpsManagerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
