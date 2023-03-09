import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryExplorerContainerComponent } from './memory-explorer-container.component';

describe('MemoryExplorerContainerComponent', () => {
  let component: MemoryExplorerContainerComponent;
  let fixture: ComponentFixture<MemoryExplorerContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemoryExplorerContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryExplorerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
