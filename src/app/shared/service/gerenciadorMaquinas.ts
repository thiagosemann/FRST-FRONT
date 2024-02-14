import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MachineService } from '../service/machines_service';
import { Machine } from '../utilitarios/machines';
import { ToastrService } from 'ngx-toastr';
import { User } from '../utilitarios/user';
import { AuthenticationService } from '../service/authentication';
import { UsageHistoryService } from '../service/usageHistory_service';
import { BuildingService } from 'src/app/shared/service/buildings_service';
import { NodemcuService } from 'src/app/shared/service/nodemcu_service';

import { ControleMaquinaService } from './controleMaquinaService';

@Injectable({
  providedIn: 'root'
})
export class GerenciadorMaquinasService {
  id: string;
  machine: Machine | undefined;
  user: User | null = null;
  tempoLigar:number =60;
  breaktempoLigar:boolean = false;
  tempoDesligar:number =60;
  breaktempoDesligar:boolean = false;
  
  constructor(
    private machineService: MachineService,
    private authService: AuthenticationService,
    private router: Router,
    private toastr: ToastrService,
    private controleMaquinaService: ControleMaquinaService
  ) {
    this.id = '';
  }

  verificacaoMaquinas(id: string): void {
    this.machineService.getMachineById(+id).subscribe(
      (machine: Machine) => {
        this.machine = machine;
        this.user = this.authService.getUser();
        let data = { id_maquina: this.machine.id, id_user: this.user?.id }

        if (this.machine?.is_in_use) {
          this.desligarMaquinaNovo(data);
        } else {
          this.ligarMaquinaNovo(data);
        }
      },
      (error: any) => {
        console.log('Error retrieving machine:', error);
        this.toastr.error('Erro ao ligar a máquina.');
      }
    );
  }

  desligarMaquinaNovo(data:any):void{
    this.controleMaquinaService.desligarMaquina(data).subscribe(
      (res) => {
        console.log(res)
        this.toastr.success(res.message);
        this.breaktempoDesligar = true;
        this.router.navigate(['/content']);
      },
      (err) => {
        console.log(err)
        this.toastr.error(err.error.error);
        this.breaktempoDesligar = true;

      }
    );
  }
  ligarMaquinaNovo(data:any):void{ 
    this.controleMaquinaService.ligarMaquina(data).subscribe(
      (res) => {
        console.log(res)
        this.toastr.success(res.message);
        this.breaktempoLigar = true;
        this.router.navigate(['/content']);
      },  
      (err) => {
        console.log(err)
        this.toastr.error(err.error.error);
        this.breaktempoLigar = true;
      }
    );
  }
}
