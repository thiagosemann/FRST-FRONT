import { Component } from '@angular/core';
import { UserService } from '../shared/service/user_service';
import { User } from '../shared/utilitarios/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string;
  user: User|  undefined;
  constructor(private userService: UserService,  private toastr: ToastrService ){
    this.email = '';
  }


  forgotPassword() : void{
    console.log(this.email)
    this.userService.resetPasswordByEmail(this.email).subscribe(
      () => {
        console.log('Senha redefinida com sucesso');
        // Adicione aqui qualquer lógica adicional após a redefinição da senha
        this.toastr.success("Senha redefinida.")
      },
      error => {
        console.error('Erro ao redefinir senha:', error);
        // Adicione aqui qualquer tratamento de erro necessário
        this.toastr.error("E-mail não encontrado.")

      }
    );
  }
}
