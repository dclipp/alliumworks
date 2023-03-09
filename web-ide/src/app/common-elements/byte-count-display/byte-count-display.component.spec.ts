import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ByteCountDisplayComponent } from './byte-count-display.component';

describe('ByteCountDisplayComponent', () => {
  let component: ByteCountDisplayComponent;
  let fixture: ComponentFixture<ByteCountDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ByteCountDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ByteCountDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
