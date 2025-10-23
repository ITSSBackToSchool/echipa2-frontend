import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; 
  private storageKey = 'user';
  userSig = signal<User | null>(this.load());

  constructor(
    private router: Router,
    private http: HttpClient
  ) {

    this.initializeAuth();
  }

  private initializeAuth() {
    const user = this.load();
    if (user) {
      this.userSig.set(user);
    }
  }

  
  login(email: string, password: string): Observable<any> {
    const body = { email, password };

    return this.http.post<{ id: number;token: string; userName: string; firstName?: string; lastName?: string; role: string }>(
      `${this.apiUrl}/login`,
      body
    ).pipe(
      tap((response) => {

        const user: User = {
          id: response.id, 
          name: response.userName,
          firstName: response.firstName,
          lastName: response.lastName,
          email,
          role: response.role ?? "EMPLOYEE",
          token: response.token
        };

        this.userSig.set(user);
        localStorage.setItem(this.storageKey, JSON.stringify(user));
      })
    );
  }

register(userName: string, email: string, password: string, firstName?: string, lastName?: string): Observable<any> {
  const body = { 
    userName, 
    email, 
    password,
    firstName,
    lastName
  };

  return this.http.post<{ id: number; token: string; userName: string; firstName?: string; lastName?: string; role: string }>(
    `${this.apiUrl}/register`,
    body
  ).pipe(
      tap((response) => {

        const user: User = {
          id: response.id,
          name: response.userName,
          firstName: response.firstName || firstName,
          lastName: response.lastName || lastName,
          email,
          role: response.role ?? "EMPLOYEE",
          token: response.token
        };

        this.userSig.set(user);
        localStorage.setItem(this.storageKey, JSON.stringify(user));
      })
  );
}

  
  logout() {
    this.userSig.set(null);
    localStorage.removeItem(this.storageKey);
    this.router.navigateByUrl('/login');
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
    try {
      const s = localStorage.getItem(this.storageKey);
      if (s) {
        const user = JSON.parse(s);
        if (user.token) {
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error('AuthService - Error loading user from localStorage:', error);
      return null;
    }
  }
}
