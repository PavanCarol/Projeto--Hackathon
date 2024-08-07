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
    return this.http.post<any>(`${this.apiUrl}/chat`, { question });
  }
  configurarBot(config: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/configurarBot`, config);
  }
  getProfile(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    });
    return this.http.get(`${this.apiUrl}/getProfile/${id}`, { headers });
  }

  updateProfile(profile: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    });
    return this.http.put(`${this.apiUrl}/updateProfile`, profile, { headers });
  }

  getAgendamentos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getBanhoTosa`);
  }

  getAgendamentoById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getBanhoTosa/${id}`);
  }

  getClienteById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getCliente/${id}`);
  }

  getAgendamentosClinica(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAgendamentosClinica`); // Faz uma solicitação GET para a rota /getAgendamentosClinica
  }

  // Novo método para atualizar o status do agendamento
  updateStatusAgendamento(
    agendamentoId: string,
    status: number
  ): Observable<any> {
    const data = {
      cra6a_agendamentoclinicaid: agendamentoId,
      cra6a_status: status,
    };
    return this.http.put(`${this.apiUrl}/atualizarStatusAgendamento`, data);
  }
}
