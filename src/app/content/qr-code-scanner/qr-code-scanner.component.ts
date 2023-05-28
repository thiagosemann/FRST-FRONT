import { Component } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-qr-code-scanner',
  templateUrl: './qr-code-scanner.component.html',
  styleUrls: ['./qr-code-scanner.component.css']
})
export class QrCodeScannerComponent {

  BarcodeFormat = BarcodeFormat; // Make BarcodeFormat available in template

  handleQrCodeResult(resultString: string) {
    console.log('Result: ', resultString);
  }
}