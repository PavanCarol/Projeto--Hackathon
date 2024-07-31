// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;
  private apiUrl = 'http://localhost:3301/api/login'; // URL da sua API

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<any>(this.apiUrl, { email: username, senha: password }).pipe(
      tap(response => {
        if (response.sucesso) {
          localStorage.setItem('token', response.token);
          this.loggedIn = true;
          this.router.navigate(['/home']);
        }
      }),
      catchError(error => {
        console.error('Erro ao fazer login', error);
        return of(null);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.loggedIn = false;
    this.router.navigate(['/login']);
  }
}
