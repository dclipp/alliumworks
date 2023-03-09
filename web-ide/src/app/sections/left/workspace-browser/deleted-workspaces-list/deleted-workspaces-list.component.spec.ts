import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedWorkspacesListComponent } from './deleted-workspaces-list.component';

describe('DeletedWorkspacesListComponent', () => {
  let component: DeletedWorkspacesListComponent;
  let fixture: ComponentFixture<DeletedWorkspacesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeletedWorkspacesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletedWorkspacesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
