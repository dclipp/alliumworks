import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryBrowserComponent } from './memory-browser.component';

describe('MemoryBrowserComponent', () => {
  let component: MemoryBrowserComponent;
  let fixture: ComponentFixture<MemoryBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemoryBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
