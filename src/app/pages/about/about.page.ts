import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { ComponentService, ConfigurationsService } from '../../services';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage {

  footerText = this.config.copyrightText;
  usefulLinks = [
    {
      title: 'FAQ',
      icon: 'help-circle-outline',
      url: 'https://apiit.atlassian.net/wiki/spaces/ITSM/pages/218792045/APSpace',
    },
    {
      title: 'Contact Us',
      icon: 'mail-outline',
      url: 'feedback',
    },
    {
      title: 'Project Repository',
      icon: 'logo-bitbucket',
      url: 'https://bitbucket.org/ctiteam/apspace',
    },
    {
      title: 'Terms of Use',
      icon: 'book-outline',
      url: 'http://www.apu.edu.my/terms-use',
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark-outline',
      url: 'http://www.apu.edu.my/privacy-policy-0',
    }
  ];
  appVersion = this.config.appVersion;

  constructor(
    private config: ConfigurationsService,
    private component: ComponentService,
    private navCtrl: NavController
  ) { }

  openUrl(url: string) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return this.component.openLink(url);
    }

    this.navCtrl.navigateForward([url]);
  }
}
