import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reservation } from '../models/reservation';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:3000';

  constructor(private http: HttpClient) {}


  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.base}/reservations?_sort=date,startTime`);
  }
  createReservation(payload: Omit<Reservation,'id'|'status'>): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.base}/reservations`, { ...payload, status: 'PENDING' });
  }
  cancelReservation(id: number) {
    return this.http.patch<Reservation>(`${this.base}/reservations/${id}`, { status: 'CANCELLED' });
  }
}
