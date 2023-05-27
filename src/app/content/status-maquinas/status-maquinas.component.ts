import { Component, OnInit } from '@angular/core';
import { MachineService } from '../../shared/service/machines_service';  // Substitua pelo caminho real para o serviço
import { Machine } from '../../shared/utilitarios/machines';  // atualize o caminho se necessário

@Component({
  selector: 'app-status-maquinas',
  templateUrl: './status-maquinas.component.html',
  styleUrls: ['./status-maquinas.component.css']
})
export class StatusMaquinasComponent implements OnInit {
  machines: Machine[] = [];
  building_id = 1;  // Substitua por sua lógica de obtenção de building_id

  constructor(private machineService: MachineService) { }

  ngOnInit(): void {
    this.fetchMachines();
  }

  fetchMachines(): void {
    this.machineService.getMachinesByBuilding(this.building_id).subscribe(
      (machines) => {
        this.machines = machines;
      },
      (error) => {
        console.error('Error fetching machines:', error);
      }
    );
  }
}