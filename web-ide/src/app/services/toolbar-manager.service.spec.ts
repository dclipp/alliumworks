import { TestBed } from '@angular/core/testing';

import { ToolbarManagerService } from './toolbar-manager.service';

describe('ToolbarManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToolbarManagerService = TestBed.get(ToolbarManagerService);
    expect(service).toBeTruthy();
  });
});
