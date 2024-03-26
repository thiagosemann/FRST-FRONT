import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GerenciadorMaquinasService } from '../shared/service/gerenciadorMaquinas';
import { User } from '../shared/utilitarios/user';
import { UsageHistoryService } from '../shared/service/usageHistory_service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  mesAtual: string = "";
  valorTotal: number = 0;
  user! : User | null;
  constructor(
    private router: Router,
    private gerenciadorMaquinasService: GerenciadorMaquinasService,
    private route: ActivatedRoute,
    private usageHistoryService: UsageHistoryService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      // Se não existe um token, redirecione para a página de login
      this.router.navigate(['/login']);
    }


    this.mesAtual = this.obterMesAtual();

    this.user = this.getCurrentUser();

    if (this.user && this.user.id !== undefined) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // Adiciona 1 ao mês (pois os meses em JavaScript são baseados em zero)
      const monthConsulta = `${year}-${month.toString().padStart(2, '0')}`;
      this.obterHistoricoUsoUsuario(this.user.id, monthConsulta);
    }
  }



  obterMesAtual(): string {
    const currentDate = new Date();
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[currentDate.getMonth()];
  }

  getCurrentUser(): User | null {
    let user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }

    user = sessionStorage.getItem('user');

    if (user) {
      return JSON.parse(user);
    }

    return null;
  }

  obterHistoricoUsoUsuario(userId: number, month: string): void {
    this.usageHistoryService.getUserUsageHistory(userId, month)
      .subscribe({
        next: history => {
          this.calcularValorTotal(history);
        },
        error: error => {
          console.log('Error getting user usage history:', error);
        }
      });
  }

  calcularValorTotal(history: any[]): void {
    this.valorTotal = history.reduce((total, item) => total + Number(item.total_cost), 0);
  }
  

  goToQrCode(): void {
    this.router.navigate(['/qrCode']);
  }
}
