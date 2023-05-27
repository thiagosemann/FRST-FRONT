import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user_service';
import { User } from '../../shared/utilitarios/user';

@Component({
  selector: 'app-log-gastos',
  templateUrl: './log-gastos.component.html',
  styleUrls: ['./log-gastos.component.css']
})
export class LogGastosComponent implements OnInit {
  users: User[] = [];
  userUsageHistory: any[] = []; // Atribua um valor inicial vazio
  formattedUsageHistory: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    const user: User | null = this.getCurrentUser(); // Obter o usuário atualmente logado

    if (user && user.id !== undefined) {
      this.userService.getUserUsageHistory(user.id)
        .subscribe({
          next: history => {
            this.userUsageHistory = history;
            this.formatUsageHistory(user); // Formatar o histórico de uso, passando o usuário como argumento
          },
          error: error => {
            console.log('Error getting user usage history:', error);
          }
        });
    }
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

  formatUsageHistory(user: User) { // Receber o usuário como argumento
    this.formattedUsageHistory = this.userUsageHistory.map(history => ({
      start_time: new Date(history.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end_time: new Date(history.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      building: user.building_name, // Usar a propriedade correta do usuário
      date: new Date(history.end_time).toLocaleDateString(),
      total_cost: parseFloat(history.total_cost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) // Converte para número e formata o valor para reais
    }));
  }
}