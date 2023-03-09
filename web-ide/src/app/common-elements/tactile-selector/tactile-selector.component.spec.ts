import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TactileSelectorComponent } from './tactile-selector.component';

describe('TactileSelectorComponent', () => {
  let component: TactileSelectorComponent;
  let fixture: ComponentFixture<TactileSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TactileSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TactileSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
