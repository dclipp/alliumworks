import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryWatchBrowserComponent } from './memory-watch-browser.component';

describe('MemoryWatchBrowserComponent', () => {
  let component: MemoryWatchBrowserComponent;
  let fixture: ComponentFixture<MemoryWatchBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemoryWatchBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryWatchBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
