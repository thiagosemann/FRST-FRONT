import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsageHistory } from '../utilitarios/usageHistory';  // atualize o caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class UsageHistoryService {
  private apiUrl = 'http://localhost:3333/usageHistory';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getUserUsageHistory(userId: number): Observable<UsageHistory[]> {
    const url = `${this.apiUrl}/user/${userId}`;
    return this.http.get<UsageHistory[]>(url, { headers: this.getHeaders() });
  }

  getAllUsageHistory(): Observable<UsageHistory[]> {
    return this.http.get<UsageHistory[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createUsageHistory(usageHistory: UsageHistory): Observable<UsageHistory> {
    return this.http.post<UsageHistory>(this.apiUrl, usageHistory, { headers: this.getHeaders() });
  }
}