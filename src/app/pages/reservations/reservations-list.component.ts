import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { SidebarService } from '../../core/services/sidebar.service';
import { ProfileSectionComponent } from '../../shared/profile-section/profile-section.component';

interface UserReservationDTO {
  id: number;
  seatNumber: string | null;
  roomName: string;
  floorName: string;
  buildingName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface UpdateReservationRequest {
  reservationDate: string;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HttpClientModule, FormsModule, MatSelectModule, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatNativeDateModule, ProfileSectionComponent],
  templateUrl: './reservations-list.component.html',
  styleUrls: ['./reservations-list.component.css']
})
export class ReservationsListComponent implements OnInit {
  reservations: UserReservationDTO[] = [];
  private apiUrl = 'http://localhost:8080/api/reservations';
  currentUser: any;
  private token: string | null = null;
  loading = true;
  error: string | null = null;


  showEditModal = false;
  editingReservation: UserReservationDTO | null = null;
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
    private http: HttpClient,
    private router: Router,
    public sidebarService: SidebarService
  ) {}

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
    if (!this.currentUser?.id) {
      this.loading = false;
      this.error = 'No user ID found';
      return;
    }

    this.http.get<UserReservationDTO[]>(`${this.apiUrl}/user/${this.currentUser.id}`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.reservations = this.sortReservations(data);
          this.loading = false;
          this.error = null;
        },
        error: (err) => {
          console.error('Error loading reservations:', err);
          this.error = 'Failed to load reservations.';
          this.loading = false;
        }
      });
  }

  /**
   * Sort reservations: Active/Upcoming first, then Cancelled last
   */
  private sortReservations(reservations: UserReservationDTO[]): UserReservationDTO[] {
    return reservations.sort((a, b) => {

      if (a.status === 'CANCELLED' && b.status === 'CANCELLED') {
        return 0;
      }
      

      if (a.status === 'CANCELLED') {
        return 1;
      }
      

      if (b.status === 'CANCELLED') {
        return -1;
      }
      

      const dateA = new Date(a.reservationDate);
      const dateB = new Date(b.reservationDate);
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Open edit modal
   */
  openEditModal(reservation: UserReservationDTO) {
    this.editingReservation = reservation;
    this.editForm = {
      date: new Date(reservation.reservationDate),
      startTime: reservation.startTime.substring(0, 5),
      endTime: reservation.endTime.substring(0, 5)
    };
    this.showEditModal = true;
  }

  /**
   * Format date for API (YYYY-MM-DD format)
   */
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Close edit modal
   */
  closeEditModal() {
    this.showEditModal = false;
    this.editingReservation = null;
  }

  /**
   * Save edited reservation (PUT request)
   */
  saveReservation() {
    if (!this.editingReservation) return;

    const updateRequest: UpdateReservationRequest = {
      reservationDate: this.formatDateForAPI(this.editForm.date),
      startTime: this.editForm.startTime,
      endTime: this.editForm.endTime
    };

    this.http.put<UserReservationDTO>(
      `${this.apiUrl}/${this.editingReservation.id}`, 
      updateRequest,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (updated) => {

        const index = this.reservations.findIndex(r => r.id === updated.id);
        if (index !== -1) {
          this.reservations[index] = updated;
        }
        this.closeEditModal();
        console.log('✅ Reservation updated successfully');
      },
      error: (err) => {
        console.error('Error updating reservation:', err);
        alert('Failed to update reservation. Please try again.');
      }
    });
  }

  /**
   * Cancel reservation (DELETE request)
   */
  cancelReservation(reservationId: number) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    this.http.delete(`${this.apiUrl}/${reservationId}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {

          this.loadUserReservations();
          console.log('✅ Reservation cancelled successfully');
        },
        error: (err) => {
          console.error('Error cancelling reservation:', err);
          alert('Failed to cancel reservation.');
        }
      });
  }

  /**
   * Generate reservation number (1-1000 cycle)
   */
  getReservationNumber(reservation: UserReservationDTO): number {

    return ((reservation.id - 1) % 1000) + 1;
  }

  /**
   * Get reservation display name
   */
  getReservationDisplayName(reservation: UserReservationDTO): string {
    const number = this.getReservationNumber(reservation);
    return reservation.seatNumber ? `Seat Reservation #${number}` : `Room Reservation #${number}`;
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    this.sidebarService.toggle();
  }

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
