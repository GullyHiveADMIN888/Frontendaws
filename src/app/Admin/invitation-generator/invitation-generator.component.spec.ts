import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationGeneratorComponent } from './invitation-generator.component';

describe('InvitationGeneratorComponent', () => {
  let component: InvitationGeneratorComponent;
  let fixture: ComponentFixture<InvitationGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
