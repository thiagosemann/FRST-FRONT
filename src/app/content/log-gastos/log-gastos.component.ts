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
  userUsageHistory: any[] = [];
  formattedUsageHistory: any[] = [];
  valorGasto: string = "R$ 25,00"; // Valor para exibição inicial

  constructor(private userService: UserService) {}

  ngOnInit() {
    const user: User | null = this.getCurrentUser();

    if (user && user.id !== undefined) {
      this.userService.getUserUsageHistory(user.id)
        .subscribe({
          next: history => {
            this.userUsageHistory = history;
            this.formatUsageHistory(user);
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

  formatUsageHistory(user: User) {
    this.formattedUsageHistory = this.userUsageHistory.map(history => ({
      start_time: history.start_time 
        ? new Date(history.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : "--",
      end_time: history.end_time 
        ? new Date(history.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : "--",
      building: user.building_name,
      date: history.end_time 
        ? new Date(history.end_time).toLocaleDateString() 
        : "--",
      total_cost: history.total_cost 
        ? parseFloat(history.total_cost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
        : "--"
    }));

    this.formattedUsageHistory.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }
}
