import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFileEditorComponent } from './generic-file-editor.component';

describe('GenericFileEditorComponent', () => {
  let component: GenericFileEditorComponent;
  let fixture: ComponentFixture<GenericFileEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericFileEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericFileEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
