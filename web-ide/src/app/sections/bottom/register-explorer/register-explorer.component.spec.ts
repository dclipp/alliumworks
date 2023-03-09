import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterExplorerComponent } from './register-explorer.component';

describe('RegisterExplorerComponent', () => {
  let component: RegisterExplorerComponent;
  let fixture: ComponentFixture<RegisterExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterExplorerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
