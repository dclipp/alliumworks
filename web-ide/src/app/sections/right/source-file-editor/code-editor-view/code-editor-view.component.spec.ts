import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeEditorViewComponent } from './code-editor-view.component';

describe('CodeEditorViewComponent', () => {
  let component: CodeEditorViewComponent;
  let fixture: ComponentFixture<CodeEditorViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeEditorViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeEditorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
