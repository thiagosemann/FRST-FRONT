import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MachineService } from '../service/machines_service';
import { Machine } from '../utilitarios/machines';
import { ToastrService } from 'ngx-toastr';
import { User } from '../utilitarios/user';
import { AuthenticationService } from '../service/authentication';
import { UsageHistoryService } from '../service/usageHistory_service';
import { UsageHistory } from '..//utilitarios/usageHistory';
import { BuildingService } from 'src/app/shared/service/buildings_service';
import { TransactionsService } from '..//service/transactionsService';
import { NodemcuService } from 'src/app/shared/service/nodemcu_service';
import { throwError, Observable, lastValueFrom, last, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
    private route: ActivatedRoute,
    private machineService: MachineService,
    private authService: AuthenticationService,
    private usageHistoryService: UsageHistoryService,
    private router: Router,
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private transactionsService: TransactionsService,
    private nodemcuService: NodemcuService,
    private controleMaquinaService: ControleMaquinaService
  ) {
    this.id = '';
  }
  verificacaoMaquinas(id: string): Observable<number> {
    return new Observable<number>((observer) => {
      const interval = 5000; // Intervalo de 5 segundos (em milissegundos)
      let counter = 0;
  
      const subscription: Subscription = timer(0, interval).pipe(
        switchMap(() => this.machineService.getMachineById(+id))
      ).subscribe(
        (machine: Machine) => {
          this.machine = machine;
          this.user = this.authService.getUser();
          let data = { id_maquina: this.machine.id, id_user: this.user?.id };
  
          if (this.machine?.is_in_use) {
            this.desligarMaquinaNovo(data);
          } else {
            this.ligarMaquinaNovo(data);
          }
          counter += interval;
          observer.next(counter);
        },
        (error: any) => {
          console.log('Error retrieving machine:', error);
          this.toastr.error('Erro ao ligar a máquina.');
          observer.error(error);
        }
      );
  
      // Retornar uma função para cancelar a assinatura quando o Observable for descartado
      return () => subscription.unsubscribe();
    });
  }

  verificacaoMaquinasAdmin(id: string): void {
    this.machineService.getMachineById(+id).subscribe(
      (machine: Machine) => {
        this.machine = machine;
        this.user = this.authService.getUser();
        let data = { id_maquina: this.machine.id, id_user: this.user?.id }
        if (this.machine && this.machine.is_in_use) {
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
    this.tempoDesligar =60;
    const timer = setInterval(() => {
      this.tempoDesligar--; // Reduz o tempo restante
      if(this.tempoDesligar<58){
        this.toastr.info(this.tempoDesligar.toString());
      }

      if (this.tempoDesligar <= 0 || this.breaktempoDesligar ) {
        this.breaktempoDesligar = false;
        clearInterval(timer); // Para o contador quando o tempo acabar
      }
    }, 1000); // 1000 milissegundos = 1 segundo
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
    this.tempoLigar =60;
    const timer = setInterval(() => {
      this.tempoLigar--; // Reduz o tempo restante
      if(this.tempoLigar<58){
        this.toastr.info(this.tempoLigar.toString());
      }

      if (this.tempoLigar <= 0 || this.breaktempoLigar ) {
        this.breaktempoLigar = false;
        clearInterval(timer); // Para o contador quando o tempo acabar
      }
    }, 1000); // 1000 milissegundos = 1 segundo
    
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
  
  
  async desligarMaquinaAdmin(): Promise<void> {
    // Desliga a máquina
    const lastUsage = await this.getLastUsageFromMachine();
    if (!lastUsage) {
      this.toastr.info('Máquina sendo utilizada por outro apartamento.');
      return;
    }
    const tempoDeUso = this.verificarTempoDeUso(lastUsage);
    console.log(tempoDeUso)
       this.turnOffMachine().subscribe({
        next: (data) => {
          this.endUsageHistory(lastUsage);
          this.toastr.info('Máquina desligada com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao desligar a máquina: ', error);
          this.toastr.error('Erro ao desligar a máquina.');
        },
      });   
  }

  async desligarMaquina(): Promise<void> {
    // Desliga a máquina
    const lastUsage = await this.isUserUsingMachine(this.user);
    if (!lastUsage) {
      this.toastr.info('Máquina sendo utilizada por outro apartamento.');
      return;
    }
    const tempoDeUso = this.verificarTempoDeUso(lastUsage);
    console.log(tempoDeUso)
    if(tempoDeUso>60){
      this.turnOffMachine().subscribe({
        next: (data) => {
          this.endUsageHistory(lastUsage);
          this.toastr.info('Máquina desligada com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao desligar a máquina: ', error);
          this.toastr.error('Tente novamente mais tarde.');
        },
      });   
    }else{
      this.toastr.error('Espere '+ (60-tempoDeUso) + 'para desligar a máquina.' );

    }


  }

  verificarTempoDeUso(lastUsage: UsageHistory): number {
    const endTime = new Date();
    if(lastUsage && lastUsage.start_time){
      const start = new Date(lastUsage.start_time);
      const end = new Date(endTime);
      return  (end.getTime() - start.getTime()) / 1000;
    }
    return 0
  }


 async ligarMaquina(): Promise<void> {
    //Liga a máquina
    this.turnOnMachine().subscribe({
      next: (data) => {
        this.createUsageHistory(); // Criar o histórico de uso e liga a máquina
        this.toastr.success('Máquina ligada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao ligar a máquina: ', error);
        this.toastr.error('Tente novamente mais tarde.');
        //enviar e-mail de erro.
      }
    });
  }

  async endUsageHistory(lastUsage: UsageHistory): Promise<void> {
    if (this.machine?.building_id) {
      const building = await this.buildingService.getBuildingById(this.machine.building_id).toPromise();
      if (building && lastUsage.start_time) {
        const obj = {
          id: lastUsage.id,
          hourly_rate: building.hourly_rate
        }
        this.updateMachineStatus(false); // Liberar a máquina
        this.usageHistoryService.updateUsageHistory(obj).subscribe({
          next: () => {},
          error: (error: any) => console.log('Error updating usage history:', error)
        });
      }
    }

  }

  isUserUsingMachine(user: User | null): Promise<UsageHistory | null> {
    return new Promise((resolve, reject) => {
      if (this.machine) {
        this.usageHistoryService.getMachineUsageHistory(this.machine.id).subscribe(
          (usageHistory: UsageHistory[]) => {
            const lastUsage = usageHistory[usageHistory.length - 1];
            if (lastUsage && this.user && lastUsage.user_id === this.user.id) {
              resolve(lastUsage);
            } else {
              resolve(null);
            }
          },
          (error: any) => {
            console.log('Error retrieving machine usage history:', error);
            reject(null);
          }
        );
      } else {
        reject(null);
      }
    });
  }


  getLastUsageFromMachine(): Promise<UsageHistory | null> {
    return new Promise((resolve, reject) => {
      if (this.machine) {
        this.usageHistoryService.getMachineUsageHistory(this.machine.id).subscribe(
          (usageHistory: UsageHistory[]) => {
            const lastUsage = usageHistory[usageHistory.length - 1];
            if (lastUsage) {
              resolve(lastUsage);
            } else {
              resolve(null);
            }
          },
          (error: any) => {
            console.log('Error retrieving machine usage history:', error);
            reject(null);
          }
        );
      } else {
        reject(null);
      }
    });
  }

  updateMachineStatus(isInUse: boolean): void {
    if (this.machine) {
      this.machineService.updateMachineStatus(this.machine.id, isInUse).subscribe({
        next: () => {
          this.router.navigate(['/content']);
        },
        error: (error: any) => console.log('Error updating machine status:', error)
      });
    }
  }

  createUsageHistory(): void {
    if (this.user && this.machine) {
      const usageHistory: UsageHistory = {
        user_id: this.user.id,
        machine_id: this.machine.id,
      };
      //Cria o historico se conseguir
      this.usageHistoryService.createUsageHistory(usageHistory).subscribe({
        next: () => this.updateMachineStatus(true),
        error: (error: any) => console.log('Error creating usage history:', error)
      });
    }
  }

  turnOnMachine(): Observable<any> {
    if (this.machine) {
      return this.nodemcuService.turnOnNodemcu(this.machine.idNodemcu);
    } else {
      return throwError(new Error('Máquina não definida.'));
    }
  }

  turnOffMachine(): Observable<any> {
    if (this.machine) {
      return this.nodemcuService.turnOffNodemcu(this.machine.idNodemcu);
    } else {
      return throwError(new Error('Máquina não definida.'));
    }
  }
}
