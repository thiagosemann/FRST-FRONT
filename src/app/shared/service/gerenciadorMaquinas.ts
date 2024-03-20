import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MachineService } from '../service/machines_service';
import { Machine } from '../utilitarios/machines';
import { ToastrService } from 'ngx-toastr';
import { User } from '../utilitarios/user';
import { AuthenticationService } from '../service/authentication';
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
  
        if (!this.machine || !this.user) {
          return;
        }
  
        const data = { id_maquina: this.machine.id, id_user: this.user.id };
        this.processMachine(data, this.machine.type, this.machine.is_in_use);
      },
      (error: any) => {
        console.log('Error retrieving machine:', error);
        this.toastr.error('Erro ao ligar a máquina.');
      }
    );
  }

  
  
  processMachine(data: any, type: string, is_in_use: boolean): void {
    const isIndustrial = type === "Industrial-Lava" || type === "Industrial-Seca";
    if(is_in_use){
      // Desligar máquina em uso
      if(isIndustrial){
        this.toastr.info("Espere o ciclo da máquina acabar!");
      }else{
        this.desligarMaquina(data);
      }
    }else{
      // Ligar máquina
      if(isIndustrial){
        this.ligarMaquinaIndustrial(data);
      }else{
       this.ligarMaquina(data);
      }
    }
  }
  



  desligarMaquina(data:any):void{
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
  ligarMaquina(data:any):void{ 
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
  ligarMaquinaIndustrial(data:any):void{ 
    this.controleMaquinaService.ligarMaquinaIndustrial(data).subscribe(
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

  desligarMaquinaPrePago(data:any):void{
  }

  ligarMaquinaPrePago(data:any):void{
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

  ligarMaquinaIndustrialPrePago(data:any):void{
  }
}
