import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MachineService } from '../../shared/service/machines_service';
import { Machine } from '../../shared/utilitarios/machines';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../shared/utilitarios/user';
import { AuthenticationService } from '../../shared/service/authentication';
import { UsageHistoryService } from '../../shared/service/usageHistory_service';
import { UsageHistory } from '../../shared/utilitarios/usageHistory';
import { BuildingService } from 'src/app/shared/service/buildings_service';
import { TransactionsService } from '../../shared/service/transactionsService';
import { LogGastosComponent } from '../log-gastos/log-gastos.component';

@Component({
  selector: 'app-my-component',
  template: ''
})
export class LiberacaoMaquinasComponent implements OnInit {
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

  ) { 
    this.id = '';
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.verificacaoMaquinas(this.id);
  }

  verificacaoMaquinas(id: string): void {
    this.machineService.getMachineById(+id).subscribe(
      async (machine: Machine) => { 
        this.machine = machine;
        this.user = this.authService.getUser();
        if (this.machine?.is_in_use) {
          const status =  await this.manageMachineInUse(this.user); // Chamada da função await aqui
          this.toastr.info(status);

          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';

          this.router.navigate(['/content']);
          return;
        }
        this.user = this.authService.getUser();
        if (!this.user || this.user.credito < 10) {
          this.toastr.error("Crédito insuficiente!");
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';

          this.router.navigate(['/content']);

          return;
        }
        
        this.createUsageHistory();
        this.toastr.success("Máquina ligada com sucesso!");

      },
      (error: any) => {
        console.log('Error retrieving machine:', error);
      }
    );
  }

  async manageMachineInUse(user: User | null): Promise<string> {
    const lastUsage = await this.isUserUsingMachine(this.user);
    let resp = "";
  
    if (lastUsage) {
      this.updateMachineStatus(false);
      const endTime = new Date(); 
      const timezoneOffset = -3; // Brasília é GMT-3
      endTime.setHours(endTime.getHours() + timezoneOffset);
      const formattedEndTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
  
      let totalCost = 10; // valor default
      
      // Se existir um prédio associado à máquina, obtemos a taxa horária
      if (this.machine?.building_id) {
        const building = await this.buildingService.getBuildingById(this.machine.building_id).toPromise();
        
        // Verificamos se o building existe antes de tentar acessar a propriedade hourly_rate
        if(building && lastUsage.start_time){
           // Parse both dates to get the time difference in seconds
           const startTime = Date.parse(lastUsage.start_time);
           const endTime = Date.parse(formattedEndTime);
           const timeDifferenceInSeconds = (endTime - startTime) / 1000;
           
           // Calcular totalCost com base na diferença de tempo e na taxa horária
           totalCost = (building.hourly_rate / 3600) * timeDifferenceInSeconds;
        }
      }
  
      // Atualiza o objeto lastUsage com end_time e total_cost.
      lastUsage.end_time = formattedEndTime;
      lastUsage.total_cost = totalCost;
    
      // Chame o serviço para atualizar o usageHistory no backend.
      this.usageHistoryService.updateUsageHistory(lastUsage).subscribe({
        next: () => {
          if(lastUsage.end_time && lastUsage.start_time){
            // Após a atualização bem-sucedida do histórico de uso, crie a transação
            const transactionTime = (Date.parse(lastUsage.end_time) - Date.parse(lastUsage.start_time)) / 1000; // tempo em segundos
        
            const transaction = {
              user_id: lastUsage.user_id,
              usage_history_id:  lastUsage.id ?? 0,
              transaction_time: lastUsage.end_time,
              amount: lastUsage.total_cost ?? 0
            };
            if(transaction){
              this.transactionsService.createTransaction(transaction).subscribe({
                next: () => {
                  // código a ser executado quando a transação é criada com sucesso
                },
                error: (error: any) => console.log('Error creating transaction:', error)
              });
            }
          }
        },
        error: (error: any) => console.log('Error updating usage history:', error)
      });
  
      resp = "Máquina desligada";
    } else {
      resp = "Máquina em uso";
    }
  
    return resp;
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

  // ...

  updateMachineStatus(isInUse: boolean): void {
      if(this.machine){
        this.machineService.updateMachineStatus(this.machine.id, isInUse).subscribe(
          () => {
            this.router.navigate(['/content']);
          },
          (error: any) => console.log('Error updating machine status:', error)
        );
      }
    }


    createUsageHistory(): void {
      if(this.user && this.machine) {
        const startTime = new Date(); 
    
        // Para ajustar para o fuso horário de Brasília, adicione/subtraia a diferença em horas
        const timezoneOffset = -3; // Brasília é GMT-3
        startTime.setHours(startTime.getHours() + timezoneOffset);
    
        const formattedStartTime = startTime.toISOString().slice(0, 19).replace('T', ' ');
    
        const usageHistory: UsageHistory = {
          user_id: this.user.id,
          machine_id: this.machine.id,
          start_time: formattedStartTime
        };
    
        this.usageHistoryService.createUsageHistory(usageHistory).subscribe(
          () => this.updateMachineStatus(true),
          (error: any) => console.log('Error creating usage history:', error)
        );
      }  
    }
    
  


}