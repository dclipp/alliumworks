import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserButtonBarComponent } from './browser-button-bar.component';

describe('BrowserButtonBarComponent', () => {
  let component: BrowserButtonBarComponent;
  let fixture: ComponentFixture<BrowserButtonBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserButtonBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserButtonBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
