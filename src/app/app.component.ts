import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FRST';

  constructor(private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      // Se não existe um token, redirecione para a página de login
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/content']);
      // Se existe um token, deixe o usuário permanecer na página que está tentando acessar
      // ou redirecione para a página inicial ou dashboard, por exemplo
    }
  }
}