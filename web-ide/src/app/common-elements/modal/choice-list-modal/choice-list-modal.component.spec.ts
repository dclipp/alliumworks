import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceListModalComponent } from './choice-list-modal.component';

describe('ChoiceListModalComponent', () => {
  let component: ChoiceListModalComponent;
  let fixture: ComponentFixture<ChoiceListModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChoiceListModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoiceListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
