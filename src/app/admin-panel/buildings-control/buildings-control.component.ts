import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/service/authentication';
import { BuildingService } from 'src/app/shared/service/buildings_service';
import { UserService } from 'src/app/shared/service/user_service';
import { Building } from 'src/app/shared/utilitarios/buildings';
import { User } from 'src/app/shared/utilitarios/user';
import { FormGroup, FormControl } from '@angular/forms'; // Import form-related modules

@Component({
  selector: 'app-buildings-control',
  templateUrl: './buildings-control.component.html',
  styleUrls: ['./buildings-control.component.css']
})
export class BuildingsControlComponent implements OnInit {
  buildings: Building[] = [];
  users: User[] = [];
  myGroup: FormGroup; // Add a FormGroup property

  constructor(
    private buildingService: BuildingService,
    private authentication: AuthenticationService,
    private router: Router,
    private userService: UserService
  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl('') // Create a form control for 'building_id'
    });
  }

  ngOnInit(): void {
    const user = this.authentication.getUser();
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
}
