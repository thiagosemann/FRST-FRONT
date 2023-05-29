import { Component } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qr-code-scanner',
  templateUrl: './qr-code-scanner.component.html',
  styleUrls: ['./qr-code-scanner.component.css']
})
export class QrCodeScannerComponent {

  BarcodeFormat = BarcodeFormat; // Make BarcodeFormat available in template
  constructor(private router: Router) {}

  handleQrCodeResult(resultString: string) {
    console.log('Result: ', resultString);
  
    // Construa a rota com base na URL fornecida
    const route = resultString.replace('http://192.168.1.7:4200', '');
  
    // Realize o redirecionamento
    this.router.navigateByUrl(route);
  }
}