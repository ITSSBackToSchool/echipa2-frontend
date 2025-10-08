import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'demo_user';
  userSig = signal<User | null>(this.load());

  constructor(private router: Router) {}

  login(email: string, password: string) {
    const isAdmin = email.toLowerCase().includes('admin');
    const mock: User = {
      id: isAdmin ? 1 : 2,
      name: isAdmin ? 'Admin User' : 'Employee User',
      email,
      role: isAdmin ? 'ADMIN' : 'EMPLOYEE',
      token: 'mock-jwt-token'
    };

    this.userSig.set(mock);
    localStorage.setItem(this.storageKey, JSON.stringify(mock));
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.userSig.set(null);
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['/login']);
  }

  get token() {
    return this.userSig()?.token ?? '';
  }

  get role() {
    return this.userSig()?.role ?? 'EMPLOYEE';
  }

  get isLoggedIn() {
    return !!this.userSig();
  }

  private load(): User | null {
    const s = localStorage.getItem(this.storageKey);
    return s ? JSON.parse(s) : null;
  }
}
