import { TestBed } from '@angular/core/testing';

import { BusinessUserService } from './business-user.service';

describe('BusinessUserService', () => {
  let service: BusinessUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
