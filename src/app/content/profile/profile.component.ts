import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/service/authentication';
import { User } from 'src/app/shared/utilitarios/user';
import { UserService } from 'src/app/shared/service/user_service';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user!: User;
  editMode: boolean = false;

  constructor(private authService: AuthenticationService, private userService: UserService, private toaster:ToastrService) { }

  ngOnInit(): void {
    this.user = this.authService.getUser()!;
    console.log(this.user);
  }

  enableEdit(): void {
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  saveProfile(): void {
    // Assuming the user object is updated in the template when editing
    this.userService.updateUser(this.user).subscribe(
      (response) => {
        // Update the user object with the response from the server, if needed
        // For example, you might receive an updated user object with additional properties
        // this.user = response;

        // Disable edit mode after successful update
        this.editMode = false;
        this.toaster.success("Cadastro atualizado com sucesso!")
      },
      (error) => {
        console.error('Error updating profile:', error);
        this.toaster.error("Erro ao atualizar cadastro, por favor entre com contato com a FRST!")

        // Handle error here, show error message to the user, etc.
      }
    );
  }
}
