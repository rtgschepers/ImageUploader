import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { UrlService } from '../services/urlservice.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { File, FileEntry } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss']
})
export class CameraPage implements OnInit {
  url: string;
  images: Image[] = [];

  constructor(
    private camera: Camera,
    private webview: WebView,
    private urlService: UrlService,
    private alertController: AlertController,
    private router: Router,
    private file: File
  ) {}

  ngOnInit() {}

  async ionViewDidEnter() {
    this.url = this.urlService.getUrl();
    if (!this.url) {
      const alert = await this.alertController.create({
        header: 'Link lost',
        message:
          'Lost connection to the webapp.\nRedirecting back to scan page.',
        buttons: ['OK']
      });

      await alert.present().then(() => {
        this.router.navigateByUrl('scanner');
      });
    }
  }

  takePhoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then(
      imageData => {
        this.images.push({
          name: imageData.substr(imageData.lastIndexOf('/') + 1),
          urlPath: this.webview.convertFileSrc(imageData),
          filePath: imageData
        } as Image);
      },
      err => {
        // Handle error
      }
    );
  }

  async uploadImage(img: Image) {
    this.file.resolveLocalFilesystemUrl(img.filePath).then(entry => {
      ((entry as unknown) as FileEntry).file(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const formData = new FormData();
          const imgBlob = new Blob([reader.result], {
            type: file.type
          });
          formData.append('file', imgBlob, file.name);

          // Send blob to site
          fetch(this.url, {
            method: 'POST',
            body: formData
          })
            .then(response => {
              return response.json();
            })
            .then(data => {
              console.log(this.images);
              this.deleteImage(img);
              console.log(this.images);
            });
        };
        reader.readAsArrayBuffer(file);
      });
    });
  }

  deleteImage(img) {
    this.images = this.images.filter(i => {
      return i !== img;
    });
  }
}

class Image {
  name: string;
  urlPath: string;
  filePath: string;
}
