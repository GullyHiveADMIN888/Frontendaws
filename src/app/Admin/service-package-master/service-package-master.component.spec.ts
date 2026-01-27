import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePackageMasterComponent } from './service-package-master.component';

describe('ServicePackageMasterComponent', () => {
  let component: ServicePackageMasterComponent;
  let fixture: ComponentFixture<ServicePackageMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicePackageMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePackageMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
