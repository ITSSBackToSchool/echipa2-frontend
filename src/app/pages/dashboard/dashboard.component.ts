import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { ReservationService, UserReservation } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { ProfileSectionComponent } from '../../shared/profile-section/profile-section.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule, FormsModule, MatSelectModule, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatNativeDateModule, ProfileSectionComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  reservations: UserReservation[] = [];
  displayedReservations: UserReservation[] = [];
  hasMoreReservations: boolean = false;
  weather: any = null;

  officePresence = {
    month: 12,
    total: 48,
    streak: 7
  };

  userId: number = 0;
  currentUser: any = null;


  showEditModal = false;
  editingReservation: UserReservation | null = null;
  editForm = {
    date: new Date(),
    startTime: '',
    endTime: ''
  };


  timeOptions = [
    { value: '08:00', label: '08:00' },
    { value: '08:15', label: '08:15' },
    { value: '08:30', label: '08:30' },
    { value: '08:45', label: '08:45' },
    { value: '09:00', label: '09:00' },
    { value: '09:15', label: '09:15' },
    { value: '09:30', label: '09:30' },
    { value: '09:45', label: '09:45' },
    { value: '10:00', label: '10:00' },
    { value: '10:15', label: '10:15' },
    { value: '10:30', label: '10:30' },
    { value: '10:45', label: '10:45' },
    { value: '11:00', label: '11:00' },
    { value: '11:15', label: '11:15' },
    { value: '11:30', label: '11:30' },
    { value: '11:45', label: '11:45' },
    { value: '12:00', label: '12:00' },
    { value: '12:15', label: '12:15' },
    { value: '12:30', label: '12:30' },
    { value: '12:45', label: '12:45' },
    { value: '13:00', label: '13:00' },
    { value: '13:15', label: '13:15' },
    { value: '13:30', label: '13:30' },
    { value: '13:45', label: '13:45' },
    { value: '14:00', label: '14:00' },
    { value: '14:15', label: '14:15' },
    { value: '14:30', label: '14:30' },
    { value: '14:45', label: '14:45' },
    { value: '15:00', label: '15:00' },
    { value: '15:15', label: '15:15' },
    { value: '15:30', label: '15:30' },
    { value: '15:45', label: '15:45' },
    { value: '16:00', label: '16:00' },
    { value: '16:15', label: '16:15' },
    { value: '16:30', label: '16:30' },
    { value: '16:45', label: '16:45' },
    { value: '17:00', label: '17:00' },
    { value: '17:15', label: '17:15' },
    { value: '17:30', label: '17:30' },
    { value: '17:45', label: '17:45' },
    { value: '18:00', label: '18:00' }
  ];

  constructor(
    private reservationService: ReservationService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {

    const userStr = localStorage.getItem('user');
    console.log('🔍 Raw user string from localStorage:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser = user;
        this.userId = user?.id || 0;
        console.log('✅ Parsed user object:', user);
        console.log('✅ Final userId:', this.userId);
      } catch (e) {
        console.error('❌ Error parsing user from localStorage:', e);
        this.userId = 0;
      }
    } else {
      console.warn('⚠️ No user found in localStorage');
      this.userId = 0;
    }

    if (this.userId) {
      console.log(`🚀 Loading reservations for userId: ${this.userId}`);
      this.loadUserReservations();
    } else {
      console.warn('⚠️ No userId found - user might not be logged in');
    }


    this.loadWeather('Bucharest');
    
  }

  /**
   * 🔹 Toggle sidebar collapse/expand
   */
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  /**
   * 🔹 Logout user
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * 🔹 Load user reservations from backend
   */
  private loadUserReservations(): void {
    console.log('🔍 Loading reservations for userId:', this.userId);
    
    this.reservationService.getUserReservations(this.userId).subscribe({
      next: (data) => {
        this.reservations = data;
        console.log('✅ Reservations loaded:', data);
        

        this.displayedReservations = data.slice(0, 3);
        this.hasMoreReservations = data.length >= 3;
        
        console.log(`📊 Showing ${this.displayedReservations.length} of ${data.length} reservations`);
        console.log(`🎭 Fade effect: ${this.hasMoreReservations ? 'YES' : 'NO'} (3+ reservations)`);
        console.log(`👁️ Third card will fade: ${data.length >= 3 ? 'YES' : 'NO'}`);
      },
      error: (err) => {
        console.error('❌ Error loading reservations:', err);
        console.error('Make sure backend is running on http://localhost:8080');

        this.reservations = [];
        this.displayedReservations = [];
        this.hasMoreReservations = false;
      }
    });
  }

  /**
   * 🔹 Navigate to My Reservations page
   */
  viewAllReservations(): void {
    this.router.navigate(['/reservations']);
  }

  /**
   * 🔹 Load weather data
   */
  private loadWeather(city: string): void {


    

    this.weather = {
      city: 'Bucharest',
      currentTemp: 30,
      condition: 'Sunny',
      icon: 'https://openweathermap.org/img/wn/01d@2x.png'
    };

    /* 

    const apiKey = 'YOUR_OPENWEATHER_API_KEY';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.weather = {
          city: data.name,
          currentTemp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        };
        console.log('✅ Weather loaded:', this.weather);
      },
      error: (err) => {
        console.error('❌ Error loading weather:', err);
      }
    });
    */
  }

  /**
   * 🔹 Get authentication headers
   */
  private getHeaders(): HttpHeaders {
    const token = this.currentUser?.token || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * 🔹 Open edit modal (same as reservations page)
   */
  openEditModal(reservation: UserReservation): void {
    this.editingReservation = reservation;
    this.editForm = {
      date: new Date(reservation.reservationDate),
      startTime: reservation.time.split(' - ')[0] || '09:00',
      endTime: reservation.time.split(' - ')[1] || '10:00'
    };
    this.showEditModal = true;
  }

  /**
   * 🔹 Format date for API (YYYY-MM-DD format)
   */
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 🔹 Close edit modal
   */
  closeEditModal(): void {
    this.showEditModal = false;
    this.editingReservation = null;
  }

  /**
   * 🔹 Save edited reservation (same as reservations page)
   */
  saveReservation(): void {
    if (!this.editingReservation) return;

    const updateRequest = {
      reservationDate: this.formatDateForAPI(this.editForm.date),
      startTime: this.editForm.startTime,
      endTime: this.editForm.endTime
    };

    this.http.put(`http://localhost:8080/api/reservations/${this.editingReservation.id}`, updateRequest, { headers: this.getHeaders() })
      .subscribe({
        next: (updated) => {
          console.log('✅ Reservation updated successfully');
          this.closeEditModal();
          this.loadUserReservations();
        },
        error: (err) => {
          console.error('Error updating reservation:', err);
          alert('Failed to update reservation. Please try again.');
        }
      });
  }

  /**
   * 🔹 Cancel reservation (same as reservations page)
   */
  cancelReservation(reservationId: number): void {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    this.http.delete(`http://localhost:8080/api/reservations/${reservationId}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          console.log('✅ Reservation cancelled successfully');
          this.loadUserReservations();
        },
        error: (err) => {
          console.error('Error cancelling reservation:', err);
          alert('Failed to cancel reservation.');
        }
      });
  }

}
