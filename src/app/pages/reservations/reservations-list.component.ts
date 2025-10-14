import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

interface UserReservationDTO {
  id: number;
  seatNumber: string;
  roomName: string;
  floorName: string;
  buildingName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
}

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HttpClientModule],
  templateUrl: './reservations-list.component.html',
  styleUrls: ['./reservations-list.component.css']
})
export class ReservationsListComponent implements OnInit {
  reservations: UserReservationDTO[] = [];
  private apiUrl = 'http://localhost:8080/api/reservations/user';
  private currentUser: any;
  private token: string | null = null;
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.token = this.currentUser?.token;
      this.loadUserReservations();
    } else {
      this.error = 'User not logged in!';
      this.loading = false;
    }
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  loadUserReservations() {
    if (!this.currentUser?.id) return;

    this.http.get<UserReservationDTO[]>(`${this.apiUrl}/${this.currentUser.id}`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.reservations = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading reservations:', err);
          this.error = 'Failed to load reservations.';
          this.loading = false;
        }
      });
  }

  cancelReservation(reservationId: number) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    this.http.delete(`${this.apiUrl.replace('/user', '')}/${reservationId}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.reservations = this.reservations.filter(r => r.id !== reservationId);
        },
        error: (err) => {
          console.error('Error cancelling reservation:', err);
          alert('Failed to cancel reservation.');
        }
      });
  }
}
