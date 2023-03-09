import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceFileEditorComponent } from './source-file-editor.component';

describe('SourceFileEditorComponent', () => {
  let component: SourceFileEditorComponent;
  let fixture: ComponentFixture<SourceFileEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceFileEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceFileEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
