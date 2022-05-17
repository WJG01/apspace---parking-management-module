import { Component } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

import { ConfigurationsService } from './services';
import { VersionService } from './services/version.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private storage: Storage,
    private config: ConfigurationsService,
    private versionService: VersionService
  ) {
    this.initialiseStorage();
  }

  async initialiseStorage() {
    await this.storage.create();
  }
}
