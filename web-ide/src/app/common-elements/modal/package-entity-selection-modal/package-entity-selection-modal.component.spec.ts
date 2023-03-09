import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageEntitySelectionModalComponent } from './package-entity-selection-modal.component';

describe('PackageEntitySelectionModalComponent', () => {
  let component: PackageEntitySelectionModalComponent;
  let fixture: ComponentFixture<PackageEntitySelectionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PackageEntitySelectionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageEntitySelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
