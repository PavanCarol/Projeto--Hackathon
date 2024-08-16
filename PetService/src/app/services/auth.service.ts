import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3301/api'; // URL base do backend

  constructor(private router: Router, private http: HttpClient) {}

  getUserName(): string | null {
    const userName = localStorage.getItem('userName');
    console.log('Nome do usuário obtido:', userName); // Adicione um log para depuração
    return userName;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken'); // Limpa o refreshToken também
    localStorage.removeItem('userName');
    localStorage.removeItem('accountId');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    console.log('Token:', token); // Detailed log for debugging
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }
  
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setTokens(tokens: { authToken: string, refreshToken: string }): void {
    localStorage.setItem('authToken', tokens.authToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http.post(`${this.apiUrl}/refresh-token`, { refreshToken });
  }
}
