import { Component, OnInit } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GerenciadorMaquinasService } from 'src/app/shared/service/gerenciadorMaquinas';

@Component({
  selector: 'app-qr-code-scanner',
  templateUrl: './qr-code-scanner.component.html',
  styleUrls: ['./qr-code-scanner.component.css']
})
export class QrCodeScannerComponent implements OnInit {
  BarcodeFormat = BarcodeFormat; // Make BarcodeFormat available in template
  loadingCamera = false; // Variable to control camera loading
  tempo:number =60;
  breaktempo:boolean = false;
  leuQrCode:boolean = false;

  constructor(private router: Router,
       private toastr: ToastrService,
       private gerenciadorMaquinasService: GerenciadorMaquinasService

       ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      // Se não existe um token, redirecione para a página de login
      this.router.navigate(['/login']);
    }

    // Simulando o evento ou momento em que a câmera está pronta
    setTimeout(() => {
      this.loadingCamera = true; // Atualize a variável quando a câmera estiver pronta
    }, 1500); // Tempo de espera simulado de 2 segundos, substitua com o evento ou momento correto da biblioteca
  }

  handleQrCodeResult(resultString: string) {
    this.loadingCamera  = false;
    const id = resultString.replace('https://www.frst.com.br/content/', '');
    this.leuQrCode =true;

    this.tempo =60;
    const timer = setInterval(() => {
      this.tempo--; // Reduz o tempo restante
      if (this.tempo <= 0 || this.breaktempo ) {
        this.breaktempo = false;
        clearInterval(timer); // Para o contador quando o tempo acabar
      }
      if(this.tempo==0){
        this.tempo = 60;
      }
    }, 1000); // 1000 milissegundos = 1 segundo
    this.gerenciadorMaquinasService.verificacaoMaquinas(id);

  }

  goBack() {
    this.router.navigate(['/content']);
  }
}
