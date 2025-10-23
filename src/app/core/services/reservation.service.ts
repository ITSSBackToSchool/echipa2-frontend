import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface UserReservationDTO {
  id: number;
  seatNumber: string | null;
  roomName: string | null;
  floorName: string | null;
  buildingName: string | null;
  reservationDate: string; // LocalDate from backend
  startTime: string; // LocalTime from backend
  endTime: string; // LocalTime from backend
  status: string;
}


export interface UserReservation {
  id: number;
  reservationDate: Date;
  time: string;
  details: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  getUserReservations(userId: number): Observable<UserReservation[]> {
    return this.http.get<UserReservationDTO[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map(dtos => dtos.map(dto => this.transformToUserReservation(dto)))
    );
  }

  private transformToUserReservation(dto: UserReservationDTO): UserReservation {

    let details = '';
    if (dto.seatNumber) {

      if (dto.buildingName && dto.floorName) {
        details = `${dto.buildingName}, ${dto.floorName} - Seat ${dto.seatNumber}`;
      } else {
        details = `Seat ${dto.seatNumber}`;
      }
    } else if (dto.roomName) {

      details = dto.roomName;
    }


    const time = dto.startTime && dto.endTime 
      ? `${dto.startTime.substring(0, 5)} - ${dto.endTime.substring(0, 5)}`
      : dto.startTime?.substring(0, 5) || '';

    return {
      id: dto.id,
      reservationDate: new Date(dto.reservationDate),
      time: time,
      details: details,
      status: dto.status
    };
  }
}
