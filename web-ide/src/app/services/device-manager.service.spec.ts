import { TestBed } from '@angular/core/testing';

import { DeviceManagerService } from './device-manager.service';

describe('DeviceManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeviceManagerService = TestBed.get(DeviceManagerService);
    expect(service).toBeTruthy();
  });
});
