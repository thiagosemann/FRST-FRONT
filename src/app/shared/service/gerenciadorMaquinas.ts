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
import { throwError, Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GerenciadorMaquinasService {
  id: string;
  machine: Machine | undefined;
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService,
    private authService: AuthenticationService,
    private usageHistoryService: UsageHistoryService,
    private router: Router,
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private transactionsService: TransactionsService,
    private nodemcuService: NodemcuService
  ) {
    this.id = '';
  }

  verificacaoMaquinas(id: string): void {
    this.machineService.getMachineById(+id).subscribe(
      (machine: Machine) => {
        this.machine = machine;
        console.log(this.machine);
        this.user = this.authService.getUser();

        if (this.machine?.is_in_use) {
          this.handleMachineInUse(this.machine.id);
        } else {
          this.handleMachineNotInUse();
        }
      },
      (error: any) => {
        console.log('Error retrieving machine:', error);
        this.toastr.error('Erro ao ligar a máquina.');
      }
    );
  }

  async handleMachineInUse(machineId: number): Promise<void> {
    try {
      // Desliga a máquina
      const userId = await this.getUserUsingMachine(machineId);
      console.log("Teste", userId);
  
      if (this.user && this.user.id && userId === this.user.id) {
        this.turnOffMachine().subscribe({
          next: (data) => {
            console.log('Resposta do servidor: ', data);
            this.manageMachineInUse(this.user);
            this.toastr.info('Máquina desligada com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao desligar a máquina: ', error);
            this.toastr.error('Erro ao desligar a máquina.');
          },
        });
      } else if (this.user && this.user.role && this.user.role === 'admin') {
        this.turnOffMachine().subscribe({
          next: (data) => {
            console.log('Resposta do servidor: ', data);
            this.manageMachineInUse(this.user);
            this.toastr.info('Máquina desligada com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao desligar a máquina: ', error);
            this.toastr.error('Erro ao desligar a máquina.');
          },
        });
      } else {
        this.toastr.error("Essa máquina está ligada para outro usuário.");
      }
    } catch (error) {
      console.error('Erro ao obter informações da máquina: ', error);
      this.toastr.error('Erro ao obter informações da máquina.');
    }
  }
  

  handleMachineNotInUse(): void {
    //Liga a máquina


    this.turnOnMachine().subscribe({
      next: (data) => {
        console.log('Resposta do servidor: ', data);
        this.createUsageHistory(); // Criar o histórico de uso e liga a máquina
        this.toastr.success('Máquina ligada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao ligar a máquina: ', error);
        this.toastr.error('Máquina não conectada.');
      }
    });
    
  }

  getUserUsingMachine(machineId: number): Promise<number | null> {
    return new Promise((resolve, reject) => {
      this.usageHistoryService.getMachineUsageHistory(machineId).subscribe(
        (usageHistory: UsageHistory[]) => {
          const lastUsage = usageHistory[usageHistory.length - 1];
          if (lastUsage) {
            resolve(lastUsage.user_id);
          } else {
            resolve(null);
          }
        },
        (error: any) => {
          console.log('Error retrieving machine usage history:', error);
          reject(null);
        }
      );
    });
  }


  async manageMachineInUse(user: User | null): Promise<void> {
    const lastUsage = await this.isUserUsingMachine(this.user);

    if (!lastUsage) {
      console.log('Máquina em uso');
      return;
    }

    this.updateMachineStatus(false);
    const endTime = new Date();
    const formattedEndTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
    let totalCost = 0; // valor default

    // Se existir um prédio associado à máquina, obtemos a taxa horária
    if (this.machine?.building_id) {
      const building = await this.buildingService.getBuildingById(this.machine.building_id).toPromise();

      // Verificamos se o building existe antes de tentar acessar a propriedade hourly_rate
      if (building && lastUsage.start_time) {
        // Calcular totalCost com base na diferença de tempo e na taxa horária
        totalCost = this.calculateCost(building.hourly_rate, lastUsage.start_time, endTime);
        console.log(totalCost)
      }
    }

    // Atualiza o objeto lastUsage com end_time e total_cost.
    lastUsage.end_time = endTime.toISOString().slice(0, 19).replace('T', ' ');
    lastUsage.total_cost = totalCost;

    // Atualiza o histórico de uso no backend e cria transação
    this.updateUsageHistoryAndCreateTransaction(lastUsage);

    console.log('Máquina desligada');
  }

  calculateCost(hourlyRate: number, startTime: string, endTime: Date): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const timeDifferenceInSeconds = (end.getTime() - start.getTime()) / 1000;
    return (hourlyRate / 3600) * timeDifferenceInSeconds;
  }
  
  

  updateUsageHistoryAndCreateTransaction(lastUsage: any): void {
    this.usageHistoryService.updateUsageHistory(lastUsage).subscribe({
      next: () => {
        if (lastUsage.end_time && lastUsage.start_time) {
          const transaction = {
            user_id: lastUsage.user_id,
            usage_history_id: lastUsage.id ?? 0,
            transaction_time: lastUsage.end_time,
            amount: lastUsage.total_cost ?? 0
          };

          this.transactionsService.createTransaction(transaction).subscribe({
            error: (error: any) => console.log('Error creating transaction:', error)
          });
        }
      },
      error: (error: any) => console.log('Error updating usage history:', error)
    });
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
      const startTime = new Date();

      // Para ajustar para o fuso horário de Brasília, adicione/subtraia a diferença em horas
       const formattedStartTime = startTime.toISOString().slice(0, 19).replace('T', ' ');

      const usageHistory: UsageHistory = {
        user_id: this.user.id,
        machine_id: this.machine.id,
        start_time: formattedStartTime
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
