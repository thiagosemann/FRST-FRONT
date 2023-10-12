import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.css']
})
export class MenuLateralComponent implements OnInit {
  @Output() componenteSelecionado = new EventEmitter<string>();
  componente: string = ''; // Inicialização com valor padrão

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.componente = params['componente'];
      this.selecionarComponente(this.componente)
      // Agora, você pode usar this.componente para determinar qual componente carregar
    });
  }
  
  selecionarComponente(componente: string) {
    this.componenteSelecionado.emit(componente);
  }
  selecionarRota(componente: string) {
    // Construa a rota desejada com base no componente
    const rota = 'admin/' + componente;
  
    // Navegue para a rota
    this.router.navigate([rota]);
  }
  
}
