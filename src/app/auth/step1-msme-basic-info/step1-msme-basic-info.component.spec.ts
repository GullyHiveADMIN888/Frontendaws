import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step1MsmeBasicInfoComponent } from './step1-msme-basic-info.component';

describe('Step1MsmeBasicInfoComponent', () => {
  let component: Step1MsmeBasicInfoComponent;
  let fixture: ComponentFixture<Step1MsmeBasicInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step1MsmeBasicInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step1MsmeBasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
