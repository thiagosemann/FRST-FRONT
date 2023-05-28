import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MachineService } from '../../shared/service/machines_service';  // Substitua pelo caminho real para o serviço
import { Machine } from '../../shared/utilitarios/machines';  // atualize o caminho se necessário
import { ToastrService } from 'ngx-toastr';
import { User } from '../../shared/utilitarios/user';
import { AuthenticationService } from '../../shared/service/authentication';  // Importe o serviço do usuário
import { UsageHistoryService } from '../../shared/service/usageHistory_service';  // Importe o serviço de usageHistory
import { UsageHistory } from '../../shared/utilitarios/usageHistory';  // atualize o caminho se necessário

@Component({
  selector: 'app-liberacao-maquinas',
  templateUrl: './liberacao-maquinas.component.html',
  styleUrls: ['./liberacao-maquinas.component.css']
})
export class LiberacaoMaquinasComponent implements OnInit {
  id: string;
  machine: Machine | undefined;
  user: User | null = null;  // Ajuste o tipo da propriedade user para User | null

  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService,
    private authService: AuthenticationService,  // Injete o serviço do usuário
    private usageHistoryService: UsageHistoryService,  // Injete o serviço de usageHistory
    private router: Router,
    private toastr: ToastrService
  ) { 
    this.id = '';
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.getMachineById(this.id);
  }

  getMachineById(id: string): void {
    this.machineService.getMachineById(+id).subscribe(
      (machine: Machine) => {
        this.machine = machine;
        if (this.machine?.is_in_use) {  // Optional chaining
          this.toastr.error("Máquina em uso!");
          this.router.navigate(['/content']);
        } else {
          this.user = this.authService.getUser();
          if (this.user && this.user.credito >= 10) {
            // Null checks
            if(this.user && this.machine){
              const usageHistory: UsageHistory = {
                user_id: this.user.id,
                machine_id: this.machine.id,
                start_time: "2023-06-02 10:00:00", // Definir como null se new Date() for undefined
              };
              console.log(usageHistory)
              this.usageHistoryService.createUsageHistory(usageHistory).subscribe(
                () => {
                  // update machine status here
                  if(this.machine){
                    this.machineService.updateMachineStatus(this.machine.id, true).subscribe(
                      () => {
                        this.toastr.success("Máquina liberada e status atualizado!");
                        this.router.navigate(['/content']); // navigate to content after successful update
                      },
                      (error: any) => {
                        console.log('Error updating machine status:', error);
                      }
                    );
                  }
                },
                (error: any) => {
                  console.log('Error creating usage history:', error);
                }
              );
            }  
          } else {
            this.toastr.error("Crédito insuficiente!");
            this.router.navigate(['/content']);
          }
          console.log(this.user)
        }
        console.log(this.machine);
      },
      (error: any) => {
        console.log('Error retrieving machine:', error);
      }
    );
  }
}