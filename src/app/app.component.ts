import { Component } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(private storage: Storage) {
    this.initialiseStorage();
  }

  async initialiseStorage() {
    await this.storage.create();
  }
}
