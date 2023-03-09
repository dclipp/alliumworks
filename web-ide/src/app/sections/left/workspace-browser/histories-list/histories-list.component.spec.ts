import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriesListComponent } from './histories-list.component';

describe('HistoriesListComponent', () => {
  let component: HistoriesListComponent;
  let fixture: ComponentFixture<HistoriesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoriesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
