import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.css']
})
export class MenuLateralComponent {
  @Output() componenteSelecionado = new EventEmitter<string>();

  selecionarComponente(componente: string) {
    this.componenteSelecionado.emit(componente);
  }
}
