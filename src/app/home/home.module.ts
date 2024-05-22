import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page'; 

import { HomePageRoutingModule } from './home-routing.module';
import { QrCodeModule } from 'ng-qrcode';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,  
    HomePageRoutingModule,
    QrCodeModule
  ],
  declarations: [HomePage, BarcodeScanningModalComponent ]
})
export class HomePageModule {}
