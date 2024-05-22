import { Component, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { AlertController, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { LensFacing, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Clipboard } from '@capacitor/clipboard';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
}) 
export class HomePage implements OnInit {
  segment = 'Scan';
  qrText = '';

  scanResult = '';

  constructor(
    private loadingController: LoadingController,
    private platform: Platform,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    if (this.platform.is('capacitor')) {
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }
  }



  //----------------scan qr y guardar el resultado
  async startScan() {
    const modal = await this.modalController.create({
      component: BarcodeScanningModalComponent,
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: [],
        LensFacing: LensFacing.Back
      }
    });



    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.scanResult = data?.barcode?.displayValue;
    }
  }





  //-------------leer qr desde imagen y guardar el resultado 
  async readBarcodeFromImage() {
    const { files } = await FilePicker.pickImages({});

    const path = files [0]?.path;
    if(!path) return;

    const {barcodes} = await  BarcodeScanner.readBarcodesFromImage({
      path,
      formats: []
    })

    this.scanResult = barcodes[0].displayValue;

  }




  //--------------------capturar el html
  captureScreen() {
    const element = document.getElementById('qrImage') as HTMLElement;
    html2canvas(element).then((canvas: HTMLCanvasElement) => {
      if (this.platform.is('capacitor')) this.ShareImage(canvas);
      else this.downloadImage(canvas);
    });
  }

  //---------------Downloaad image (web)
  downloadImage(canvas: HTMLCanvasElement) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'qr.png';
    link.click();
  }

  //---------------share image (mobile)
  async ShareImage(canvas: HTMLCanvasElement) {
    let base64 = canvas.toDataURL();
    let path = 'qr.png';

    const loading = await this.loadingController.create({
      spinner: 'crescent',
    });

    await Filesystem.writeFile({
      path,
      data: base64,
      directory: Directory.Cache,
    })
      .then(async (res) => {
        let uri = res.uri;

        await Share.share({ url: uri });

        await Filesystem.deleteFile({
          path,
          directory: Directory.Cache,
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }



  //------------copiar el resultado del scan

   writeToClipboard = async () => {
    await Clipboard.write({
      string: this.scanResult
    });
  
  
  
    const toast = await this.toastController.create({
      message: 'Copiado a porta papeles',
      duration: 1000,
      color:'tertiary',
      icon: 'clipboard-outline',
      position:'middle'
    });
    toast.present();
  
  };


  

  openCapacitorSite = async () => {


  const alert = await this.alertController.create({
    header: '',
    message: 'Deceas abrir el enlace en el navegador?',
    mode: 'ios',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        
        
      }, {
        text: 'Confirmar',
        handler: async () => {
          let url = this.scanResult;
    if(!['https://'].includes(this.scanResult)) url = 'https://'+ this.scanResult
    await Browser.open({ url });


        }
      }
    ]
  });

  await alert.present();


   
  };


//-------------chequea si el resultado es una url 
isUrl(){
 let regex = /\.(com|net|io|me|crypto|ai)\b/i;
 return regex.test(this.scanResult);
}

}
