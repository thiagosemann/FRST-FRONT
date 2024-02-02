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
import { TransactionsService } from 'src/app/shared/service/transactionsService';
import { Transaction } from 'src/app/shared/utilitarios/transactions';
import { GerenciadorMaquinasService } from 'src/app/shared/service/gerenciadorMaquinas';
import { ExcelService } from 'src/app/shared/service/excelService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-buildings-control',
  templateUrl: './buildings-control.component.html',
  styleUrls: ['./buildings-control.component.css']
})

export class BuildingsControlComponent implements OnInit {
  buildings: Building[] = [];
  users: User[] = [];
  usersEdit: User[] = [];
  myGroup: FormGroup; // Add a FormGroup property
  machines: Machine[] = [];
  selectedMonth: string ="";
  selectedYear: string ="";
  buildingId: number =0;
  valorTotal: number = 0;
  userRole:string = "";
  editingHistory! : any;
  isEditingHistory!:boolean;
  selectedUser: User | null = null;
  showUserDetails = false;
  usageHistory: any[] = [];
  formattedUsageHistory: any[] = [];
  months:any[] =[ {name:"Janeiro",id:'01'},
                  {name:"Fevereiro",id:'02'},
                  {name:"Março",id:'03'},
                  {name:"Abril",id:'04'},
                  {name:"Maio",id:'05'},
                  {name:"Junho",id:'06'},
                  {name:"Julho",id:'07'},
                  {name:"Agosto",id:'08'},
                  {name:"Setembro",id:'09'},
                  {name:"Outubro",id:'10'},
                  {name:"Novembro",id:'11'},
                  {name:"Dezembro",id:'12'}
              ];
  years:any[] =["2023","2024","2025","2026","2027","2028",];    
  consultaBDMonth: string ="";        
  excelArray : UsageHistory[] = [];
  user: any = null; // Use o tipo de dado adequado para o usuário
  usageHistoryToUpdate!: UsageHistory;

  constructor(
    private buildingService: BuildingService,
    private authentication: AuthenticationService,
    private router: Router,
    private userService: UserService,
    private machineService: MachineService,
    private nodeMcuService: NodemcuService,
    private usageHistoryService: UsageHistoryService,
    private transactionsService: TransactionsService,
    private gerenciadorMaquinasService: GerenciadorMaquinasService,
    private excelService: ExcelService,
    private authService: AuthenticationService,
    private toastr: ToastrService

  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl(''), // Create a form control for 'building_id'
      month_id: new FormControl(''), // Create a form control for 'building_id'
      year_id: new FormControl(''), // Create a form control for 'building_id'
      editHistoryUserId: new FormControl(''),
      editHistoryMachineId: new FormControl(''),
      editHistoryStart_time: new FormControl(''),
      editHistoryEnd_time: new FormControl(''),
      editHistoryTotal_cost: new FormControl('')
    });


  }

  ngOnInit(): void {
    const user = this.authentication.getUser();
    this.userRole = user!.role.toLocaleUpperCase();
    this.manageSindico();
    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        this.buildings = buildings; // Set the value inside the subscription

        this.selectedYear = new Date().getFullYear().toString(); // Current year
        this.selectedMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // Current month
        this.buildingId = user?.building_id!;
        this.consultaBDMonth = this.selectedYear + "-"+ this.selectedMonth
        this.updatePage();

        // Certifique-se de que this.myGroup não é nulo antes de acessar seus controles
        if (this.myGroup) {
          this.myGroup.get('building_id')?.setValue(this.buildingId);
          this.myGroup.get('month_id')?.setValue(this.selectedMonth);

          this.myGroup.get('year_id')?.setValue(this.selectedYear);
        }
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );

  }

  manageSindico():void{
    this.user = this.authService.getUser(); // use o método apropriado para obter as informações do usuário
    if(this.user && this.user.role && this.user.role == "sindico"){
      this.myGroup.get("building_id")?.disable();
      this.myGroup.patchValue({
        building_id:this.user.building_id
      });
      let event ={
        target:{
          value:this.user.building_id
        }
      }
      this.onBuildingSelect(event)
    }
  }
  

  formatUsageHistory() {
    this.usageHistory.map(history => {
      this.valorTotal += Number(history.total_cost);
      const formattedHistory = {
        id: history.id,
        start_timeEdit:history.start_time,
        end_timeEdit:history.end_time,
        start_time: history.start_time
          ? new Date(history.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "--",
        end_time: history.end_time
          ? new Date(history.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "--",
        userName: history.apt_name,
        machineName: history.machine_name,
        machine_id: history.machine_id,
        user_id:history.user_id,
        date: history.end_time
          ? new Date(history.end_time)
          : null,
        total_cost: history.total_cost
          ? parseFloat(history.total_cost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : "--"
      };
      this.formattedUsageHistory.push(formattedHistory);
    });
  
    this.formattedUsageHistory.sort((a, b) => {
      const dateA = a.date;
      const dateB = b.date;
      if (!dateA) return 1; // Lidar com valores nulos
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });
  
    // Formate as datas após a ordenação
    this.formattedUsageHistory.forEach(history => {
      if (history.date) {
        history.date = history.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    });
  }
  
  
  



  mudarEstadoMaquina(machine:Machine):void{
    this.gerenciadorMaquinasService.verificacaoMaquinasAdmin(machine.id.toString());
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

  changeUserUsageHistory(){
    this.editingHistory.user_id =  parseInt(this.myGroup.get('editHistoryUserId')?.value);
    this.myGroup.patchValue({
      editHistoryUserId: this.editingHistory.user_id
    });
  }
  changeMachineUsageHistory(){
    this.editingHistory.machine_id =  parseInt(this.myGroup.get('editHistoryMachineId')?.value);
    this.myGroup.patchValue({
      editHistoryMachineId: this.editingHistory.machine_id  
    });


    
  }

  deleteUsageHistory(id: number) {
    const isConfirmed = window.confirm('Você tem certeza de que deseja EXCLUIR este histórico de uso?');
    if (isConfirmed) {
      this.transactionsService.getTransactionByUsageHistoryId(id).subscribe(
        (transaction: Transaction) => {
          if (transaction && transaction.id) {
            // Excluir a transação
            this.transactionsService.deleteTransactionById(transaction.id).subscribe(
              () => {  
                // Excluir o histórico de uso
                this.usageHistoryService.deleteUsageHistoryById(id).subscribe(
                  () => {  
                    // Remova o item excluído do array formattedUsageHistory
                    this.formattedUsageHistory = this.formattedUsageHistory.filter(item => item.id !== id);
                    if (this.selectedUser && this.selectedUser.valorTotal) {
                      this.selectedUser.valorTotal = this.selectedUser.valorTotal - Number(transaction.amount);
                      this.valorTotal = this.valorTotal - Number(transaction.amount);
                    }
                  },
                  (deleteError: any) => {
                    console.log('Error deleting usage history:', deleteError);
                  }
                );
              },
              (deleteError: any) => {
                console.log('Error deleting transaction:', deleteError);
              }
            );
          }
        },
        (error: any) => {
          console.log('Error retrieving transaction by usage history:', error);
        }
      );
    }
  }
  
  editUsageHistory(history: any): void {
    this.editingHistory = { ...history };
    // Defina os valores do FormGroup com base no objeto editingHistory

    // Formata a data de volta para o formato desejado (ISO 8601)
    this.myGroup.patchValue({
      editHistoryUserId: this.editingHistory.user_id,
      editHistoryMachineId: this.editingHistory.machine_id,
      editHistoryStart_time: this.formatDate(this.editingHistory.start_timeEdit),
      editHistoryEnd_time: this.formatDate(this.editingHistory.end_timeEdit),
      editHistoryTotal_cost: this.editingHistory.total_cost
    });
    this.usersEdit = [];
    this.userService.getUsersByBuilding(this.buildingId).subscribe(
      (users: User[]) => {
        this.usersEdit = users;
        this.usersEdit.sort((a, b) => (a.apt_name > b.apt_name) ? 1 : -1);

      },
      (error) => {
        console.error('Error fetching users by building:', error);
      }
    );

    this.editingHistory.machine_id = history.machine_id;
    this.isEditingHistory = true;
  }
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
  
    // Subtrai 3 horas da data
    date.setHours(date.getHours() - 3);
  
    return date.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
  }
  

  
  private formatDate2(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  cancelEditHistory(){
    this.isEditingHistory =false;
    this.editingHistory = {};
  }

  saveEditHistory() {
    // Verifica se total_cost é uma string
    if (typeof this.editingHistory.total_cost === 'string') {
      // Extrai o valor numérico do total_cost removendo "R$"
      this.editingHistory.total_cost = this.editingHistory.total_cost.replace(/[^\d,.]/g, '').replace(',', '.');
    }
  
      // Obtém as datas atuais do histórico
      const startTime = new Date(this.editingHistory.start_timeEdit);
      const endTime = new Date(this.editingHistory.end_timeEdit);

      // Formata as datas para o formato aceito pelo MySQL (YYYY-MM-DD HH:MM:SS)
      const formattedStartTime = startTime.toISOString().slice(0, 19).replace('T', ' ');
      const formattedEndTime = endTime.toISOString().slice(0, 19).replace('T', ' ');

      // Cria o objeto a ser enviado para a atualização
      this.usageHistoryToUpdate = {
        id: this.editingHistory.id,
        user_id: this.editingHistory.user_id,
        machine_id: this.editingHistory.machine_id,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        total_cost: this.editingHistory.total_cost
      };
  
  
    if (!this.usageHistoryToUpdate || !this.usageHistoryToUpdate.id) {
      return;
    }
  
    // Atualiza o histórico de uso
    this.usageHistoryService.updateCompleteUsageHistory(this.usageHistoryToUpdate).subscribe(
      (updatedHistory: any) => {
        // Atualiza a transação associada
        console.log("Updated", updatedHistory);
      },
      (updateHistoryError: any) => {
        console.log('Error updating usage history:', updateHistoryError);
      }
    );
    this.cancelEditHistory();
    this.updateUsageHistory();
  }
  
  
  calculateTotalCost(): void {
      const startTime = this.myGroup.get('editHistoryStart_time')?.value;
      const endTime = this.myGroup.get('editHistoryEnd_time')?.value;
      this.editingHistory.start_timeEdit = startTime;
      this.editingHistory.end_timeEdit = endTime;

      if (startTime && endTime) {
        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);

        // Verifica se o start_time é depois do end_time
        if (startDateTime >= endDateTime) {
          // Se for, ajusta o start_time para ser anterior ao end_time
          this.toastr.error("Data de início maior que data final.");

          startDateTime.setTime(endDateTime.getTime() - 60000); // Subtrai 1 minuto

          // Atualiza o valor no FormGroup
          this.myGroup.patchValue({
            editHistoryStart_time: this.formatDate2(startDateTime) // Utiliza a função formatDate para formatar a data
          });
        }
        console.log(typeof this.buildings[0].id); // Verifica o tipo de id na primeira entrada do array
        console.log(typeof this.buildingId); // Verifica o tipo de this.buildingId
        
        const selectedBuilding = this.buildings.find(building => building.id.toString() == this.buildingId.toString());

        
        console.log(selectedBuilding)

        if(selectedBuilding && selectedBuilding.hourly_rate ){
          // Calcula a diferença em milissegundos
          const timeDifference = endDateTime.getTime() - startDateTime.getTime();

          // Calcula o total_cost com base na diferença de tempo
          const hours = timeDifference / (1000 * 60 * 60); // Convertendo milissegundos para horas
          const hourlyRate = selectedBuilding?.hourly_rate; // Valor por hora 
          const totalCost = hours * hourlyRate;

          // Define o valor calculado no FormGroup
          this.myGroup.patchValue({
            editHistoryTotal_cost:  Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost) // Ajuste para 2 casas decimais
          });

          this.editingHistory.total_cost = totalCost;
        }

      }
    }


  downloadTableData(){
    const formattedExcelArray = this.usageHistory.map(history => {
      const user = this.users.find(user => user.id === history.user_id);
      const userApt = user ? user.apt_name : "--";
      const userName = user ? user.first_name: "--";
      const userCPF = user ? user.cpf: "--";

      return {
        userApt: history.apt_name,
        userName: userName,
        userCPF: userCPF,
        machine:history.machine_name,
        machine_id:history.machine_id,
        
        start_time: history.start_time 
          ? new Date(history.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : "--",
        end_time: history.end_time 
          ? new Date(history.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : "--",
        date: history.end_time 
          ? new Date(history.end_time).toLocaleDateString() 
          : "--",
        total_cost: history.total_cost 
          ? history.total_cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
          : "--"
      };
    });
  
    formattedExcelArray.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  
    this.excelService.exportToExcel(formattedExcelArray, "Teste");
  }
  
  onBuildingSelect(event: any): void {
    this.buildingId = event.target.value;
    this.updatePage();
  }

  onMonthSelect(event: any) {
    this.selectedMonth = event.target.value;
    this.consultaBDMonth = this.selectedYear + "-"+ this.selectedMonth
    this.updatePage();

  }
  onYearSelect(event: any) {
    this.selectedYear = event.target.value;
    this.consultaBDMonth = this.selectedYear + "-"+ this.selectedMonth
    this.updatePage();
  }

  updateUsageHistory(){
    this.formattedUsageHistory = [];
    this.usageHistory = [];
    this.valorTotal=0;
    if(this.buildingId != 0){
      this.usageHistoryService.getAllUsageHistoryByBuildingAndMonth(this.buildingId,this.consultaBDMonth)
      .subscribe({
        next: history => {
          this.usageHistory = history;
          this.formatUsageHistory();
        },
        error: error => {
          console.log('Error getting user usage history:', error);
        }
      });
    }
  }

  updatePage(){
    this.usageHistory = [];
    this.formattedUsageHistory = [];
    this.valorTotal = 0;
    if(this.buildingId && this.consultaBDMonth.length == 7) {
      this.updateUsageHistory();

      this.machineService.getMachinesByBuilding(this.buildingId).subscribe(
        async (machines) => {
          this.machines = machines;

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

  getMonthName(selectedMonthId: string): string {
    const selectedMonthObject = this.months.find(month => month.id === selectedMonthId);
    return selectedMonthObject ? selectedMonthObject.name : 'Mês não encontrado';
  }
}
