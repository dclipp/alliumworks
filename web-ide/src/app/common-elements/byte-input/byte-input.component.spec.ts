import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ByteInputComponent } from './byte-input.component';

describe('ByteInputComponent', () => {
  let component: ByteInputComponent;
  let fixture: ComponentFixture<ByteInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ByteInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ByteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
