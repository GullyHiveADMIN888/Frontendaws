import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionMasterComponent } from './question-master.component';

describe('QuestionMasterComponent', () => {
  let component: QuestionMasterComponent;
  let fixture: ComponentFixture<QuestionMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
