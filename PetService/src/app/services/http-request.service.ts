import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpRequestService {
  private apiUrl = 'http://localhost:3301/api'; // URL base do backend
  constructor(private http: HttpClient) {}


  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cadastro`, data); // Envia os dados para a rota /cadastro
  }
  clinica(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clinica`, data); // Envia os dados para a rota /cadastro
  }
  getClinicas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getClinica`); // Faz uma solicitação GET para a rota /getClinica
  }
  getClinicaById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getClinica/${id}`);
  }
  Pergunta(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/perguntas`, data);
  }
  login(loginData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData);
  }
  bot(question: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat`, {question});
  }
  configurarBot(config: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/configurarBot`, config);
  }
  updateProfile(profile: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/updateProfile`, profile, { headers });
  }
}
