import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MachineService } from '../../shared/service/machines_service';  // Substitua pelo caminho real para o serviço
import { Machine } from '../../shared/utilitarios/machines';  // atualize o caminho se necessário
import { User } from '../../shared/utilitarios/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-status-maquinas',
  templateUrl: './status-maquinas.component.html',
  styleUrls: ['./status-maquinas.component.css']
})
export class StatusMaquinasComponent implements OnInit {
  @ViewChild('row', { static: false }) row!: ElementRef;

  machines: Machine[] = [];
  building_id : number;  // Substitua por sua lógica de obtenção de building_id

  constructor(private machineService: MachineService, private router: Router)  { 
    this.building_id = 0; // Inicialização no construtor
  }

  ngOnInit(): void {
    const user: User | null = this.getCurrentUser(); // Obter o usuário atualmente logado
    if (user !== null) {
      this.building_id = user?.building_id ? Number(user.building_id) : 0;
      
    } else {
      console.log('Usuário não está logado ou não possui um building_id');
      this.router.navigate(['/login']);
    }
    this.fetchMachines();
  }

  getCurrentUser(): User | null {
    let user = localStorage.getItem('user');

    if (user) {
      return JSON.parse(user);
    }

    user = sessionStorage.getItem('user');

    if (user) {
      return JSON.parse(user);
    }

    return null;
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
