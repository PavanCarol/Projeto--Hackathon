import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  getUserName(): string | null {
    const userName = localStorage.getItem('userName');
    console.log('Nome do usuário obtido:', userName); // Adicione um log para depuração
    return userName;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    console.log(token)
    return !!token;
  }
}
