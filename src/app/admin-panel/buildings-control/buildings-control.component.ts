import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/service/authentication';
import { BuildingService } from 'src/app/shared/service/buildings_service';
import { UserService } from 'src/app/shared/service/user_service';
import { Building } from 'src/app/shared/utilitarios/buildings';
import { User } from 'src/app/shared/utilitarios/user';
import { FormGroup, FormControl } from '@angular/forms'; // Import form-related modules
import { Machine } from 'src/app/shared/utilitarios/machines';
import { MachineService } from 'src/app/shared/service/machines_service';
import { NodemcuService } from 'src/app/shared/service/nodemcu_service';
import { UsageHistory } from 'src/app/shared/utilitarios/usageHistory';
import { UsageHistoryService } from 'src/app/shared/service/usageHistory_service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-buildings-control',
  templateUrl: './buildings-control.component.html',
  styleUrls: ['./buildings-control.component.css']
})
export class BuildingsControlComponent implements OnInit {
  buildings: Building[] = [];
  users: User[] = [];
  myGroup: FormGroup; // Add a FormGroup property
  machines: Machine[] = [];
  mesAtual: string = "";
  valorTotal: number = 0;

  
  constructor(
    private buildingService: BuildingService,
    private authentication: AuthenticationService,
    private router: Router,
    private userService: UserService,
    private machineService: MachineService,
    private nodeMcuService: NodemcuService,
    private usageHistoryService: UsageHistoryService

  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl('') // Create a form control for 'building_id'
    });
  }

  ngOnInit(): void {
    const user = this.authentication.getUser();
    
    this.mesAtual = this.obterMesAtual();

    if (user && user.role.toLocaleUpperCase() != 'ADMIN') {
      this.router.navigate(['/content']);
      return;
    }

    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        this.buildings = buildings; // Set the value inside the subscription
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );



  
  }

  onBuildingSelect(event: any): void {
    const buildingId = event.target.value;
    if (buildingId) {
      this.userService.getUsersByBuilding(parseInt(buildingId, 10)).subscribe(
        (users: User[]) => {
          this.users = users;
  
          // Loop through each user and get the total usage history for each one
          for (const user of this.users) {
            this.obterHistoricoUsoUsuario(user.id, new Date().getMonth() + 1).subscribe(
              (valorTotal: number) => {
                user.valorTotal = valorTotal;
              },
              (error) => {
                console.error('Error getting total usage history for user:', error);
              }
            );
          }
        },
        (error) => {
          console.error('Error fetching users by building:', error);
        }
      );

      this.machineService.getMachinesByBuilding(buildingId).subscribe(
        async (machines) => {
          this.machines = machines;
          console.log(machines);

          for (const machine of this.machines) {
            const userId = await this.getUserUsingMachine(machine.id);
            const user = userId !== null ? await this.userService.getUser(userId).toPromise() : null;
            machine.apt_in_use = user ? user.apt_name : '';


            this.nodeMcuService.checkNodemcuStatus(machine.idNodemcu).subscribe(
              (resp: any) => {
                machine.isConnected = resp.success;
              },
              (error) => {
                console.error('Error fetching buildings:', error);
              }
            );
          }
        },
        (error) => {
          console.error('Error fetching machines:', error);
        }
      );
    } else {
      // Limpar a lista de usuários quando nenhum prédio for selecionado
      this.users = [];
    }
  }

  editUser(user: User): void {
    // Implement the logic to navigate to the edit user page
    // For example, you can use the Router to navigate:
    this.router.navigate(['/edit-user', user.id]);
  }

  deleteUser(user: User): void {
    // Implement the logic to delete the user
    // For example, you can use the UserService to call the API to delete the user:
    this.userService.deleteUser(user.id).subscribe(
      () => {
        // User deleted successfully, remove the user from the local array
        this.users = this.users.filter((u) => u.id !== user.id);
      },
      (error) => {
        console.error('Error deleting user:', error);
        // Handle the error if needed
      }
    );
  }

  mudarEstadoMaquina(machine:Machine):void{
    console.log(machine)
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

  obterMesAtual(): string {
    const currentDate = new Date();
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[currentDate.getMonth()];
  }

  // Atualize a assinatura da função para retornar um Observable<number>.
  obterHistoricoUsoUsuario(userId: number, month: number): Observable<number> {
    // Retorne o Observable que foi criado dentro do subscribe.
    return new Observable<number>(observer => {
      this.usageHistoryService.getUserUsageHistory(userId, month.toString())
        .subscribe({
          next: history => {
            const valorTotal = this.calcularValorTotal(history);
            this.valorTotal += valorTotal;
            // Emita o valor total para o observador.
            observer.next(valorTotal);
            // Complete o observable.
            observer.complete();
          },
          error: error => {
            console.log('Error getting user usage history:', error);
            // Se ocorrer um erro, notifique o observador com o erro.
            observer.error(error);
          }
        });
    });
  }
  calcularValorTotal(history: any[]): number {
    return history.reduce((total, item) => total + Number(item.total_cost), 0);
  }

}
