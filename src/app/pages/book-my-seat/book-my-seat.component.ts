import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

// DTOs
interface FloorDTO { id: number; name: string; }
interface RoomDTO { id: number; name: string; }
interface SeatAvailabilityDTO { id: number; seatNumber: string; isAvailable: boolean; }

interface CreateReservationSeatRequest {
  userId: number;
  seatId: number[];
  reservationDate: string;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-book-my-seat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    HttpClientModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './book-my-seat.component.html',
  styleUrls: ['./book-my-seat.component.css']
})
export class BookMySeatComponent implements OnInit {
  floors: FloorDTO[] = [];
  rooms: RoomDTO[] = [];
  seats: SeatAvailabilityDTO[] = [];

  selectedFloorId: number | null = null;
  selectedRoomId: number | null = null;

  selectedSeats: SeatAvailabilityDTO[] = [];
  selectedDate: Date = new Date();
  selectedFrom = '09:00';
  selectedTo = '10:00';

  showConfirm = false;
  showBooked = false;
  currentUser: any;
  token: string | null = null;

  private buildingId = 1;
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      this.token = this.currentUser?.token;
    } else {
      alert('User not logged in!');
      return;
    }
    this.loadFloors();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  loadFloors() {
    this.http.get<FloorDTO[]>(`${this.apiUrl}/floors/building/${this.buildingId}`, { headers: this.getHeaders() })
      .subscribe(floors => {
        this.floors = floors;
        if (floors.length) {
          this.selectedFloorId = floors[0].id;
          this.loadRooms();
        }
      });
  }

  loadRooms() {
    if (!this.selectedFloorId) return;
    this.http.get<RoomDTO[]>(`${this.apiUrl}/rooms/floor/${this.selectedFloorId}`, { headers: this.getHeaders() })
      .subscribe(rooms => {
        this.rooms = rooms;
        if (rooms.length) {
          this.selectedRoomId = rooms[0].id;
          this.loadSeats();
        } else {
          this.rooms = [];
          this.seats = [];
        }
      });
  }

  loadSeats() {
    if (!this.selectedRoomId || !this.selectedFloorId) return;
    const params = new HttpParams()
      .set('buildingId', this.buildingId.toString())
      .set('floorId', this.selectedFloorId.toString())
      .set('roomId', this.selectedRoomId.toString())
      .set('date', this.formatDate(this.selectedDate))
      .set('startTime', `${this.selectedFrom}:00`)
      .set('endTime', `${this.selectedTo}:00`);

    this.http.get<SeatAvailabilityDTO[]>(`${this.apiUrl}/seats/available`, { headers: this.getHeaders(), params })
      .subscribe(seats => {
        this.seats = seats;
        this.selectedSeats = [];
      });
  }

  toggleSeat(seat: SeatAvailabilityDTO) {
    if (!seat.isAvailable) return;
    const index = this.selectedSeats.findIndex(s => s.id === seat.id);
    if (index >= 0) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }
  }

  confirmBooking() {
    if (!this.selectedSeats.length || !this.currentUser) return;

    const requestBody: CreateReservationSeatRequest = {
      userId: this.currentUser.id,
      seatId: this.selectedSeats.map(s => s.id),
      reservationDate: this.formatDate(this.selectedDate),
      startTime: `${this.selectedFrom}:00`,
      endTime: `${this.selectedTo}:00`
    };

    this.http.post(`${this.apiUrl}/reservations/seat`, requestBody, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.showConfirm = false;
          this.showBooked = true;
          this.loadSeats();
        },
        error: (err) => {
          console.error('Booking failed', err);
          alert('Error while booking the seats.');
          this.showConfirm = false;
        }
      });
  }

  closePopup() {
    this.showConfirm = false;
    this.showBooked = false;
  }

  onFloorChange() { this.loadRooms(); }
  onRoomChange() { this.loadSeats(); }
  onTimeOrDateChange() { this.loadSeats(); }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}