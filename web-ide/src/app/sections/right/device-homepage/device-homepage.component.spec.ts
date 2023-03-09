import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceHomepageComponent } from './device-homepage.component';

describe('DeviceHomepageComponent', () => {
  let component: DeviceHomepageComponent;
  let fixture: ComponentFixture<DeviceHomepageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceHomepageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
