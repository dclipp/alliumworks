import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputerPresetsManagerComponent } from './computer-presets-manager.component';

describe('ComputerPresetsManagerComponent', () => {
  let component: ComputerPresetsManagerComponent;
  let fixture: ComponentFixture<ComputerPresetsManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComputerPresetsManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComputerPresetsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
