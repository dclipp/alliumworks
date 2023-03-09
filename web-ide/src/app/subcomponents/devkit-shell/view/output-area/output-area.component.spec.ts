import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputAreaComponent } from './output-area.component';

describe('OutputAreaComponent', () => {
  let component: OutputAreaComponent;
  let fixture: ComponentFixture<OutputAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutputAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutputAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
