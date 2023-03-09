import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceInstanceContainerNEWComponent } from './device-instance-container-new.component';

describe('DeviceInstanceContainerNEWComponent', () => {
  let component: DeviceInstanceContainerNEWComponent;
  let fixture: ComponentFixture<DeviceInstanceContainerNEWComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceInstanceContainerNEWComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceInstanceContainerNEWComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
