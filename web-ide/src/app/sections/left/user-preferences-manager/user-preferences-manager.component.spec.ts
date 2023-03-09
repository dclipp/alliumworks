import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPreferencesManagerComponent } from './user-preferences-manager.component';

describe('UserPreferencesManagerComponent', () => {
  let component: UserPreferencesManagerComponent;
  let fixture: ComponentFixture<UserPreferencesManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPreferencesManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPreferencesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
