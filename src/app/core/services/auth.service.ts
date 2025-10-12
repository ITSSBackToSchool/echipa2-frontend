import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // ✅ Backend-ul tău Spring
  private storageKey = 'user';
  userSig = signal<User | null>(this.load());

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  /** 🔹 Login real către backend */
  login(email: string, password: string): Observable<any> {
    const body = { email, password };

    return this.http.post<{ id: number;token: string; userName: string; role: string }>(
      `${this.apiUrl}/login`,
      body
    ).pipe(
      tap((response) => {
        // ✅ Creează obiectul User compatibil cu restul aplicației
        const user: User = {
          id: response.id, // poți schimba dacă backend-ul returnează id
          name: response.userName,
          email,
          role: response.role ?? "EMPLOYEE",
          token: response.token
        };

        // 🔹 Salvează userul în semnal + localStorage
        this.userSig.set(user);
        localStorage.setItem(this.storageKey, JSON.stringify(user));
      })
    );
  }
/** 🔹 Register real către backend */
register(userName: string, email: string, password: string): Observable<any> {
  const body = { userName, email, password };

  return this.http.post<{ id: number; token: string; userName: string; role: string }>(
    `${this.apiUrl}/register`,
    body
  ).pipe(
    tap((response) => {
      // ✅ Creează obiectul User compatibil cu restul aplicației
      const user: User = {
        id: response.id, // poți schimba dacă backend-ul returnează id
        name: response.userName,
        email,
        role: response.role ?? "EMPLOYEE",
        token: response.token
      };

      // 🔹 Salvează userul în semnal + localStorage
      this.userSig.set(user);
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    })
  );
}

  /** 🔹 Logout complet + redirect */
  logout() {
    this.userSig.set(null);
    localStorage.removeItem(this.storageKey);
    this.router.navigateByUrl('/login');
  }

  /** 🔹 Returnează token-ul curent */
  get token() {
    return this.userSig()?.token ?? '';
  }

  /** 🔹 Returnează rolul curent (ADMIN/EMPLOYEE) */
  get role() {
    return this.userSig()?.role ?? 'EMPLOYEE';
  }

  /** 🔹 Verifică dacă userul este autentificat */
  get isLoggedIn() {
    return !!this.userSig();
  }

  /** 🔹 Încarcă userul din localStorage la pornirea aplicației */
  private load(): User | null {
    const s = localStorage.getItem(this.storageKey);
    return s ? JSON.parse(s) : null;
  }
}
