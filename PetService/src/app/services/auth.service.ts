import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router) {}

  getUserName(): string | null {
    const userName = localStorage.getItem('userName');
    console.log('Nome do usuário obtido:', userName); // Adicione um log para depuração
    return userName;
  }

  logout(): void {
    localStorage.removeItem('authToken'); // Ensure consistency with token key
    localStorage.removeItem('userName');
    localStorage.removeItem('accountId'); // Also remove accountId if stored
    console.log('Logged out'); // Log for debugging
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken'); // Ensure consistency with token key
    console.log('Token:', token); // Detailed log for debugging
    return !!token;
  }
}
