import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularModalComponent } from './regular-modal.component';

describe('RegularModalComponent', () => {
  let component: RegularModalComponent;
  let fixture: ComponentFixture<RegularModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegularModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegularModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
