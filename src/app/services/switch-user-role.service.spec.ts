import { TestBed } from '@angular/core/testing';

import { SwitchUserRoleService } from './switch-user-role.service';

describe('SwitchUserRoleService', () => {
  let service: SwitchUserRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwitchUserRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
