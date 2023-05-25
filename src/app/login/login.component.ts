import { Component } from '@angular/core';
import { AuthenticationService } from '../shared/service/authentication';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Variáveis para armazenar os valores dos campos de entrada
  username: string;
  password: string;
  rememberMe:boolean;

  constructor(private authService: AuthenticationService, private router: Router, private toastr: ToastrService) {
    this.username = '';
    this.password = '';
    this.rememberMe = false;
  }

  login(): void {
    // Lógica de autenticação aqui
    this.authService.login(this.username,  this.password, this.rememberMe).then(result => {
      if (result.logado) {
        console.log('Logado com sucesso!');
        this.toastr.success("Logado com sucesso!")
        this.router.navigate(['/content']);
      } else {
        this.toastr.error(result.erro)
      }
    }).catch(error => {
      this.toastr.error(error.erro)
    });


  }
}