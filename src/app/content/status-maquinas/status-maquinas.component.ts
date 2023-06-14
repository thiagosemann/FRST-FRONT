import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MachineService } from '../../shared/service/machines_service';
import { Machine } from '../../shared/utilitarios/machines';
import { UserService } from '../../shared/service/user_service';
import { User } from '../../shared/utilitarios/user';
import { Router } from '@angular/router';
import { UsageHistoryService } from '../../shared/service/usageHistory_service';
import { UsageHistory } from '../../shared/utilitarios/usageHistory';

interface MachineVisualization extends Machine {
  apt_in_use: string;
}

@Component({
  selector: 'app-status-maquinas',
  templateUrl: './status-maquinas.component.html',
  styleUrls: ['./status-maquinas.component.css']
})
export class StatusMaquinasComponent implements OnInit {
  @ViewChild('row', { static: false }) row!: ElementRef;

  machines: MachineVisualization[] = [];
  building_id: number;

  constructor(
    private machineService: MachineService,
    private router: Router,
    private usageHistoryService: UsageHistoryService,
    private userService: UserService
  ) {
    this.building_id = 0;
  }

  ngOnInit(): void {
    const user: User | null = this.getCurrentUser();
    if (user !== null) {
      this.building_id = user?.building_id ? Number(user.building_id) : 0;
    } else {
      console.log('Usuário não está logado ou não possui um building_id');
      this.router.navigate(['/login']);
    }
    this.fetchMachines();
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

  fetchMachines(): void {
    this.machineService.getMachinesByBuilding(this.building_id).subscribe(
      async (machines) => {
        console.log(machines)
        this.machines = [];
  
        for (const machine of machines) {
          const userId = await this.getUserUsingMachine(machine.id);
          const user = userId !== null ? await this.userService.getUser(userId).toPromise() : null;
          const aptName = user ? user.apt_name : '';
  
          const machineVisualization: MachineVisualization = {
            ...machine,
            apt_in_use: aptName
          };
  
          this.machines.push(machineVisualization);
  
          console.log(`Machine with id: ${machine.id} is being used by user with id: ${userId}`);
          console.log(`User's apartment name: ${aptName}`);
        }
      },
      (error) => {
        console.error('Error fetching machines:', error);
      }
    );
  }
  

  getUserUsingMachine(machineId: number): Promise<number | null> {
    return new Promise((resolve, reject) => {
      this.usageHistoryService.getMachineUsageHistory(machineId).subscribe(
        (usageHistory: UsageHistory[]) => {
          const lastUsage = usageHistory[usageHistory.length - 1];
          console.log(lastUsage)

          if (lastUsage) {
            console.log(lastUsage)
            resolve(lastUsage.user_id);
          } else {
            resolve(null);
          }
        },
        (error: any) => {
          console.log('Error retrieving machine usage history:', error);
          reject(null);
        }
      );
    });
  }
}
