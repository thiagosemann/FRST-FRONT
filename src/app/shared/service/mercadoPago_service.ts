import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  //private url = 'https://frst-back-02b607761078.herokuapp.com';
  private url = 'http://localhost:80';

  constructor(private http: HttpClient) {}

  // Seus métodos existentes ...

  // Adicione o método para chamar a rota do MercadoPago
  criarPreferencia(body: any): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post(`${this.url}/mercadoPago/criar-preferencia`, body, { headers });
  }
}
