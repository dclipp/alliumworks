import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputerControlsComponent } from './computer-controls.component';

describe('ComputerControlsComponent', () => {
  let component: ComputerControlsComponent;
  let fixture: ComponentFixture<ComputerControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComputerControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComputerControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
