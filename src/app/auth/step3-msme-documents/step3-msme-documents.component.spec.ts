import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step3MsmeDocumentsComponent } from './step3-msme-documents.component';

describe('Step3MsmeDocumentsComponent', () => {
  let component: Step3MsmeDocumentsComponent;
  let fixture: ComponentFixture<Step3MsmeDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step3MsmeDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step3MsmeDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
