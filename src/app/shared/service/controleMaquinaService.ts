import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControleMaquinaService {
  private url = 'https://frst-back-02b607761078.herokuapp.com';
  // private url = 'http://localhost:80';

  constructor(private http: HttpClient) {}

  ligarMaquina(data: any): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post(`${this.url}/gerenciadorMaquina/ligar`, data, { headers });
  }

  ligarMaquinaIndustrial(data: any): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post(`${this.url}/gerenciadorMaquina/ligarIndustrial`, data, { headers });
  }

  desligarMaquina(data: any): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.post(`${this.url}/gerenciadorMaquina/desligar`, data, { headers });
  }
}
