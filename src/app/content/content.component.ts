import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GerenciadorMaquinasService } from '../shared/service/gerenciadorMaquinas';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent {

  constructor( private router: Router, private gerenciadorMaquinasService: GerenciadorMaquinasService, private route: ActivatedRoute ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      // Se não existe um token, redirecione para a página de login
      this.router.navigate(['/login']);
    } 
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if(id){
      this.gerenciadorMaquinasService.verificacaoMaquinas(id)
    }
  }

  goToQrCode(): void {
    this.router.navigate(['/qrCode']);

  }
}
