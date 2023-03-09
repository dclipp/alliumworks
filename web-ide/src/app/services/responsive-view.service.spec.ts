import { TestBed } from '@angular/core/testing';

import { ResponsiveViewService } from './responsive-view.service';

describe('ResponsiveViewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResponsiveViewService = TestBed.get(ResponsiveViewService);
    expect(service).toBeTruthy();
  });
});
