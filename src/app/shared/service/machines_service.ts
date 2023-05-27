import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Machine } from '../utilitarios/machines';  // atualize o caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private apiUrl = 'http://localhost:3333/machines';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getMachinesByBuilding(building_id: number): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.apiUrl}/${building_id}`, { headers: this.getHeaders() });
  }

  createMachine(machine: Machine): Observable<Machine> {
    return this.http.post<Machine>(this.apiUrl, machine, { headers: this.getHeaders() });
  }

}
