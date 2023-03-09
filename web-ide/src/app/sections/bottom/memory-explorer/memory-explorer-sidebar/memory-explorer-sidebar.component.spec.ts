import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryExplorerSidebarComponent } from './memory-explorer-sidebar.component';

describe('MemoryExplorerSidebarComponent', () => {
  let component: MemoryExplorerSidebarComponent;
  let fixture: ComponentFixture<MemoryExplorerSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemoryExplorerSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryExplorerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
