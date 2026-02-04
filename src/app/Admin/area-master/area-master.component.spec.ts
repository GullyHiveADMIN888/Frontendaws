import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaMasterComponent } from './area-master.component';

describe('AreaMasterComponent', () => {
  let component: AreaMasterComponent;
  let fixture: ComponentFixture<AreaMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
