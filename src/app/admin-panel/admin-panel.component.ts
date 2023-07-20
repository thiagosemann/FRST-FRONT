import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  componenteAtual: string = 'buildings'; // Define o componente inicial a ser carregado (por exemplo, "home")

  onComponenteSelecionado(componente: string) {
    this.componenteAtual = componente;
  }
}
