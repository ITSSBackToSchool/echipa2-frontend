import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe for the template
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select'; // <-- Import MatSelectModule

interface CreateReservationRoomRequest {
  userId: number;
  roomIds: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
}

interface ReservationRoomDTO {
  id: number;
  reservationDate: string;
  status: string;
  roomName: string;
  floorName: string;
  buildingName: string;
  userId: number;
  userName: string;
  userEmail: string;
  startTime: string;
  endTime: string;
}

interface FloorDTO { id: number; name: string; }
interface RoomDTO { id: number; name: string; }

@Component({
  selector: 'app-book-room',
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
    MatSelectModule // <-- Add MatSelectModule to imports
  ],
  templateUrl: './book-room.component.html',
  styleUrls: ['./book-room.component.css']
})
export class BookRoomComponent implements OnInit {
  selectedDate: Date = new Date();
  selectedFrom = '09:00';
  selectedTo = '10:00';
  selectedFloorId: number | null = null;
  selectedRoomId: number | null = null;

  floors: FloorDTO[] = [];
  rooms: RoomDTO[] = [];

  showConfirm = false;
  showBooked = false;
  createdReservation?: ReservationRoomDTO;

  private buildingId = 1;
  private apiUrlReservations = 'http://localhost:8080/api/reservations/room';
  private apiUrlRooms = 'http://localhost:8080/api';
  private currentUser: any;
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
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
    this.http.get<FloorDTO[]>(`${this.apiUrlRooms}/floors/building/${this.buildingId}`, { headers: this.getHeaders() })
      .subscribe(floors => {
        this.floors = floors;
        if (floors.length) {
          this.selectedFloorId = floors[0].id;
          this.loadRooms();
        }
      });
  }

  loadRooms() {
    if (!this.selectedFloorId) {
        this.rooms = [];
        this.selectedRoomId = null;
        return;
    };
    // When date/time changes, we should find available rooms, not just all rooms.
    // Assuming your backend supports this. If not, the original logic is fine.
    // For now, sticking to the provided logic:
    this.http.get<RoomDTO[]>(`${this.apiUrlRooms}/rooms/floor/${this.selectedFloorId}`, { headers: this.getHeaders() })
      .subscribe(rooms => {
        this.rooms = rooms;
        this.selectedRoomId = rooms.length ? rooms[0].id : null;
      });
  }

  onFloorChange() { this.loadRooms(); }
  onRoomChange() { /* Future logic can go here if needed */ }

  search() {
    if (!this.selectedRoomId || !this.selectedDate) {
      alert('Please select a date and a room.');
      return;
    }
    this.showConfirm = true;
  }

  confirmBooking() {
    if (!this.currentUser || !this.token || !this.selectedRoomId) return;

    const requestBody: CreateReservationRoomRequest = {
      userId: this.currentUser.id,
      roomIds: this.selectedRoomId,
      reservationDate: this.formatDate(this.selectedDate),
      startTime: `${this.selectedFrom}:00`,
      endTime: `${this.selectedTo}:00`
    };

    this.http.post<ReservationRoomDTO>(this.apiUrlReservations, requestBody, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.createdReservation = response;
          this.showConfirm = false;
          this.showBooked = true;
        },
        error: (error) => {
          console.error('Booking failed:', error);
          alert('Error while booking the room. It might already be reserved for this time slot.');
          this.showConfirm = false;
        }
      });
  }

  closePopup() {
    this.showConfirm = false;
    this.showBooked = false;
  }

  get selectedRoomName(): string {
    const room = this.rooms.find(r => r.id === this.selectedRoomId);
    return room ? room.name : 'Unknown Room';
  }
  
  // This function should probably fetch available rooms based on the new time/date.
  onTimeOrDateChange() { 
      // Re-loading all rooms on this floor.
      // For a real-world app, you might want an API endpoint that returns *available* rooms
      // for the selected date and time.
      this.loadRooms(); 
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}