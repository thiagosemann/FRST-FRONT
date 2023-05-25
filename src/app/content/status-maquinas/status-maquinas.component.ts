import { Component } from '@angular/core';

@Component({
  selector: 'app-status-maquinas',
  templateUrl: './status-maquinas.component.html',
  styleUrls: ['./status-maquinas.component.css']
})
export class StatusMaquinasComponent {
  machines = [
    { name: 'Máquina 1', status: 'Livre', imageUrl: 'path-to-image-1' },
    { name: 'Máquina 2', status: 'APT-45', imageUrl: 'path-to-image-2' },
    { name: 'Máquina 3', status: 'Livre', imageUrl: 'path-to-image-3' },
    { name: 'Máquina 4', status: 'APT-45', imageUrl: 'path-to-image-4' },
  ];
}
