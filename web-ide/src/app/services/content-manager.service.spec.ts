import { TestBed } from '@angular/core/testing';

import { ContentManagerService } from './content-manager.service';

describe('ContentManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContentManagerService = TestBed.get(ContentManagerService);
    expect(service).toBeTruthy();
  });
});
