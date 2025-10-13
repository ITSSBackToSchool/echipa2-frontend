import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../core/services/weather.service';

interface UserReservationDTO {
  id: number;
  reservationDate: string;
  details: string;
  roomName: string;
  buildingName: string;
  floorName: string;
  startTime: string;
  endTime: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  reservations: UserReservationDTO[] = [];
  officePresence = { month: 0, total: 0, streak: 0 };
  weather = { city: 'Bucharest', temp: 0, condition: 'Loading...' };

  private apiUrl = 'http://localhost:8080/api/reservations/user';
  private currentUser: any;
  private token: string | null = null;
  loadingReservations = true;
  reservationsError: string | null = null;

  constructor(private http: HttpClient, private weatherService: WeatherService) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.token = this.currentUser?.token;
      this.loadUserReservations();
      this.loadWeather();
    } else {
      this.reservationsError = 'User not logged in!';
      this.loadingReservations = false;
    }
  }

  /** Helper to get headers with auth token */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  /** Load reservations for the current user */
  loadUserReservations() {
    if (!this.currentUser?.id) return;

    this.http.get<UserReservationDTO[]>(`${this.apiUrl}/${this.currentUser.id}`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          console.log('Reservations:', res);
          this.reservations = res.map(r => ({
            id: r.id,
            roomName: r.roomName,
            buildingName: r.buildingName,
            floorName: r.floorName,
            startTime: r.startTime,
            endTime: r.endTime,
            reservationDate: r.reservationDate,
            details: `${r.roomName} – ${r.buildingName} (${r.floorName})`,
            time: `${r.startTime} - ${r.endTime}`,
            status: r.status
          }));

          // Compute office presence dynamically
          const count = res.length;
          this.officePresence = {
            month: count,
            total: count,
            streak: Math.min(10, count)
          };
        },
        error: (err) => {
          console.error('Error loading reservations:', err);
          this.reservationsError = 'Failed to load reservations.';
          this.loadingReservations = false;
        }
      });
  }

  /** Cancel a reservation */
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

  /** Load weather info for Bucharest */
  loadWeather() {
    const city = 'Bucharest';
    const date = new Date().toISOString().split('T')[0];
    console.log('Fetching weather for:', city, date);

    this.weatherService.getWeather(city, date).subscribe({
      next: (data: any) => {
        console.log('Weather data received:', data);
        this.weather.temp = data.temp ?? data.temperature ?? 25;
        this.weather.condition = data.condition ?? data.status ?? 'Sunny';
      },
      error: (err) => {
        console.error('Error fetching weather:', err);
        this.weather.condition = 'Error fetching weather';
      }
    });
  }

  /** Optional: compute current week range */
  get currentWeekRange(): string {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return `${monday.getDate()}–${friday.getDate()} ${monday.toLocaleString('default', { month: 'short' })}`;
  }
}
