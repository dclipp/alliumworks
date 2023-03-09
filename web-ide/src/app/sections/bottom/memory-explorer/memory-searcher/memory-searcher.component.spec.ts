import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorySearcherComponent } from './memory-searcher.component';

describe('MemorySearcherComponent', () => {
  let component: MemorySearcherComponent;
  let fixture: ComponentFixture<MemorySearcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemorySearcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemorySearcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
