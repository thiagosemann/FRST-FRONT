import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../shared/service/authentication';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  user: any = null; // Use o tipo de dado adequado para o usuário

  constructor(private authService: AuthenticationService, private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser(); // use o método apropriado para obter as informações do usuário
  }

  logout(): void {
    this.authService.logout();
    this.toastr.error("Deslogado.")
    this.router.navigate(['/login']);
  }
  
}