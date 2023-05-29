import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MachineService } from '../../shared/service/machines_service';
import { Machine } from '../../shared/utilitarios/machines';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../shared/utilitarios/user';
import { AuthenticationService } from '../../shared/service/authentication';
import { UsageHistoryService } from '../../shared/service/usageHistory_service';
import { UsageHistory } from '../../shared/utilitarios/usageHistory';



@Component({
  selector: 'app-liberacao-maquinas',
  templateUrl: './liberacao-maquinas.component.html',
  styleUrls: ['./liberacao-maquinas.component.css']
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
    private toastr: ToastrService
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
          this.router.navigate(['/content']);
          return;
        }
        this.user = this.authService.getUser();
        if (!this.user || this.user.credito < 10) {
          this.toastr.error("Crédito insuficiente!");
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
  
   
      // atualize o transaction history
      // TODO: você precisará implementar isso
  
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