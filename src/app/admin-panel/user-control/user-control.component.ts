import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/service/authentication';
import { BuildingService } from 'src/app/shared/service/buildings_service';
import { UserService } from 'src/app/shared/service/user_service';
import { Building } from 'src/app/shared/utilitarios/buildings';
import { User } from 'src/app/shared/utilitarios/user';
import { FormGroup, FormControl } from '@angular/forms'; // Import form-related modules
import { Machine } from 'src/app/shared/utilitarios/machines';


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
  user: any = null; // Use o tipo de dado adequado para o usuário

  
  constructor(
    private buildingService: BuildingService,
    private router: Router,
    private userService: UserService,
    private authService: AuthenticationService,
    private ngZone: NgZone // Adicione o NgZone

  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl(''), // Create a form control for 'building_id'
    });
  }

  ngOnInit(): void {
    this.manageSindico();
    this.getAllBuildings();

  }

  getAllBuildings():void{
    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        this.buildings = buildings; // Set the value inside the subscription
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
      this.users = [];
    }
  }
  editUser(user: User): void {
    const rota = 'edit/' + user.id;
    this.router.navigate([rota])
  }
  deleteUser(user: User): void {
    const isConfirmed = window.confirm(`Você tem certeza de que deseja EXCLUIR o usuário ${user.first_name} ${user.last_name}?`);
    if (isConfirmed) {
      this.ngZone.run(() => {
        this.userService.deleteUser(user.id).subscribe(
         () => {
            this.users = this.users.filter((u) => u.id !== user.id);
          },
          (error) => {
            console.error('Error deleting user:', error);
          }
        );  
      });
    }
  }
  
    resetPassword(user: User): void {
      const isConfirmed = window.confirm(`Você tem certeza de que deseja redefinir a senha do usuário ${user.first_name} ${user.last_name}?`);
      if (isConfirmed) {
        // Chame a função para redefinir a senha aqui
      }
    }
  
}