import { Component, OnInit, Input } from '@angular/core';
import { ContentReference } from 'src/app/view-models/content/content-reference';
import { DeviceManagerService } from 'src/app/services/device-manager.service';
import { ContentManagerService } from 'src/app/services/content-manager.service';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Aq4wComponent } from 'src/app/aq4w-component';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'aq4w-device-homepage',
  templateUrl: './device-homepage.component.html',
  styleUrls: ['./device-homepage.component.scss']
})
export class DeviceHomepageComponent extends Aq4wComponent implements OnInit {

  @Input('content')
  public set content(content: ContentReference) {
    this._componentContentKey = content.contentKey;
    if (!!content.contentKey) {
      this._bundleId = content.data.bundleId;
      // this.view.readme = content.data.readme;
    }
    // const contentText: string = content.data.text;
    // this._initialContent = contentText;
    // this.view.control.setValue(contentText, { emitEvent: false });
  }
  
  public view = {
    readme: undefined,
    metadata: undefined,
    developerName: ''
    // readme: {
    //   readmeVersion: '',
    //   deviceReferenceId: '',
    //   deviceCategory: 'input',
    //   humanReadableDeviceName: 'TEST DEVICE',
    //   humanReadableDeviceDeveloperName: '@allium',
    //   descriptionParagraphs: ['djfl sddmnsf djksfsdj fkasf'],
    //   sections: [{ title: 'sect1 ds', order: 0, paragraphs: ['para1', 'para2']}, { title: 'sect2 ds', order: 1, paragraphs: ['para1', 'para2']}],
    //   embeddedResources: []
    // } as DeviceReadme
  }

  public on = {
    newInstance: () => {
      this._deviceManagerService.installDevice(this._bundleId).then(() => {
        
      });
    }
  }

  constructor(private _deviceManagerService: DeviceManagerService, private _contentManagerService: ContentManagerService, private _sessionService: SessionService) {
    super();
  }

  ngOnInit() {
    this._contentManagerService.onActiveContentChanged().pipe(takeUntil(this.destroyed), distinctUntilChanged()).subscribe(activeContentKey => {
      if (!!this._componentContentKey && this._componentContentKey === activeContentKey && !!this._bundleId) {
        this._sessionService.platform.devices.getBundle(this._bundleId).then(bundle => {
          if (!!bundle) {
            this._sessionService.platform.devices.getDeveloperName(bundle.metadata.developerId).then(developerName => {
              this.view.readme = bundle.readme;
              this.view.metadata = bundle.metadata;
              this.view.developerName = developerName || 'Not available';
            })
          }
        })
      }
    })
    // this._backendClient.devices.findBundle(decodedKey.contextualId).then((bundle) => {
    //   if (!!bundle && !!bundle.readme) {
    //     resolve(this.deviceHomepage.createEmbeddedView({ contentReference: { data: { readme: bundle.readme }, contentKey: contentKey } }));
    //   } else {
    //     //TODO reject ??
    //   }
    // })
    // this.view.readme = {
    //   readmeVersion: '',
    //   deviceReferenceId: '',
    //   deviceCategory: 'input',
    //   humanReadableDeviceName: 'TEST DEVICE',
    //   humanReadableDeviceDeveloperName: 'SomeDev',
    //   descriptionParagraphs: ['djfl sddmnsf djksfsdj fkasf'],
    //   sections: [],
    //   embeddedResources: []
    // }
  }

  private _bundleId = '';
  private _componentContentKey = '';

}
