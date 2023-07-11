import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsageHistory } from '../utilitarios/usageHistory';  // atualize o caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class UsageHistoryService {
  private apiUrl = 'https://frst-back-l7c333yy9-thiagosemann.vercel.app/usageHistory';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getUserUsageHistory(userId: number): Observable<UsageHistory[]> {
    const url = `${this.apiUrl}/user/${userId}`;
    return this.http.get<UsageHistory[]>(url, { headers: this.getHeaders() });
  }

  getMachineUsageHistory(machineId: number): Observable<UsageHistory[]> {
    const url = `${this.apiUrl}/machine/${machineId}`;
    return this.http.get<UsageHistory[]>(url, { headers: this.getHeaders() });
  }

  getAllUsageHistory(): Observable<UsageHistory[]> {
    return this.http.get<UsageHistory[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createUsageHistory(usageHistory: UsageHistory): Observable<UsageHistory> {
    return this.http.post<UsageHistory>(this.apiUrl, usageHistory, { headers: this.getHeaders() });
  }
  updateUsageHistory(usageHistory: UsageHistory): Observable<UsageHistory> {
    const url = `${this.apiUrl}/${usageHistory.id}`;
    return this.http.put<UsageHistory>(url, usageHistory, { headers: this.getHeaders() });
  }
}
