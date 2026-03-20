import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step2MsmeBusinessDetailsComponent } from './step2-msme-business-details.component';

describe('Step2MsmeBusinessDetailsComponent', () => {
  let component: Step2MsmeBusinessDetailsComponent;
  let fixture: ComponentFixture<Step2MsmeBusinessDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step2MsmeBusinessDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step2MsmeBusinessDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
