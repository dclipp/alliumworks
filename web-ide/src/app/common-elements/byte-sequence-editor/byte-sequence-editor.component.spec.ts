import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ByteSequenceEditorComponent } from './byte-sequence-editor.component';

describe('ByteSequenceEditorComponent', () => {
  let component: ByteSequenceEditorComponent;
  let fixture: ComponentFixture<ByteSequenceEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ByteSequenceEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ByteSequenceEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
