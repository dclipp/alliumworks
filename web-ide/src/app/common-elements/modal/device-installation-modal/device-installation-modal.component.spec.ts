import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceInstallationModalComponent } from './device-installation-modal.component';

describe('DeviceInstallationModalComponent', () => {
  let component: DeviceInstallationModalComponent;
  let fixture: ComponentFixture<DeviceInstallationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceInstallationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceInstallationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
