import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserReservation {
  id: number;
  reservationDate: string;
  seat: string;
  room: string;
  time:string;
  details:string;
  status:string;


}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations/user/{userId}';


  constructor(private http: HttpClient) {}

  getUserReservations(userId: number): Observable<UserReservation[]> {
    return this.http.get<UserReservation[]>(`${this.apiUrl}/user/${userId}`);
  }
}
