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
  selector: 'app-user-control',
  templateUrl: './user-control.component.html',
  styleUrls: ['./user-control.component.css']
})
export class UserControlComponent implements OnInit {
  buildings: Building[] = [];
  users: User[] = [];
  myGroup: FormGroup; // Add a FormGroup property
  machines: Machine[] = [];
  isEditing: boolean = false;

  
  constructor(
    private buildingService: BuildingService,
    private router: Router,
    private userService: UserService,

  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl(''), // Create a form control for 'building_id'
      apt_name: new FormControl('') // Create a form control for 'building_id'
      
    });
  }

  ngOnInit(): void {

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
        },
        (error) => {
          console.error('Error fetching users by building:', error);
        }
      );
    } else {
      // Limpar a lista de usuários quando nenhum prédio for selecionado
      this.users = [];
    }
  }

  editUser(user: User): void {
    // Toggle the edit mode for the user
    const rota = 'edit/' + user.id;

    this.router.navigate([rota])
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







}