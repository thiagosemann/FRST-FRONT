import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent {

  constructor( private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      // Se não existe um token, redirecione para a página de login
      this.router.navigate(['/login']);
    } 
  }

  goToQrCode(): void {
    this.router.navigate(['/qrCode']);

  }
}
