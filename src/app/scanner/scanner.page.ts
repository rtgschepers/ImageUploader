import { Component, OnInit, NgZone } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { Router } from '@angular/router';
import { UrlService } from '../services/urlservice.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss']
})
export class ScannerPage implements OnInit {
  constructor(
    private qrScanner: QRScanner,
    private router: Router,
    private urlService: UrlService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.qrScanner
      .prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          // camera permission was granted

          // start scanning
          this.qrScanner.show();
          const scanSub = this.qrScanner.scan().subscribe((text: string) => {
            scanSub.unsubscribe(); // stop scanning

            this.ngZone.run(() => {
              this.qrScanner.hide(); // hide camera preview
              this.urlService.setUrl(text);
              this.router.navigateByUrl('camera');
            });
          });
        } else if (status.denied) {
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
        } else {
          // permission was denied, but not permanently. You can ask for permission again at a later time.
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }
}
