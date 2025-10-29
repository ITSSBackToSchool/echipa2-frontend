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
import { SidebarService } from '../../core/services/sidebar.service';
import { ProfileSectionComponent } from '../../shared/profile-section/profile-section.component';
import { AuthService } from '../../core/services/auth.service';


interface BuildingDTO { id: number; name: string; }
interface FloorDTO { id: number; name: string; }
interface RoomDTO { id: number; name: string; roomType: string; }
interface SeatAvailabilityDTO { id: number; seatNumber: string; isAvailable: boolean; reservedBy?: string; }

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
    MatSelectModule,
    ProfileSectionComponent
  ],
  templateUrl: './book-my-seat.component.html',
  styleUrls: ['./book-my-seat.component.css']
})
export class BookMySeatComponent implements OnInit {
  buildings: BuildingDTO[] = [];
  floors: FloorDTO[] = [];
  rooms: RoomDTO[] = [];
  seats: SeatAvailabilityDTO[] = [];

  selectedBuildingId: number | null = null;
  selectedFloorId: number | null = null;
  selectedRoomId: number | null = null;

  selectedSeats: SeatAvailabilityDTO[] = [];
  selectedDate: Date = new Date();
  selectedFrom = '09:00';
  selectedTo = '17:00';
  selectedTimeSlot: string = 'morning';
  minDate: Date = new Date();
  

  showConfirm = false;
  showBooked = false;
  createdReservation?: any;
  bookedSeatCount: number = 0;
  bookedSeatNumbers: string[] = [];
  

  timeSlots = [
    { value: 'morning', label: 'Morning (8:00-12:00)' },
    { value: 'afternoon', label: 'Afternoon (12:00-18:00)' },
    { value: 'full-day', label: 'Full Day (8:00-18:00)' }
  ];
  

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

  /**
   * Get filtered end time options based on selected start time
   */
  get endTimeOptions() {
    if (!this.selectedFrom) return this.timeOptions;
    
    return this.timeOptions.filter(option => option.value > this.selectedFrom);
  }

  /**
   * Get filtered start time options based on current time (for today)
   */
  get startTimeOptions() {
    if (!this.isToday(this.selectedDate)) return this.timeOptions;
    
    const currentTime = this.getCurrentTime();
    

    if (currentTime > '18:00') {
      this.selectedDate = new Date(this.selectedDate.getTime() + 24 * 60 * 60 * 1000);
      return this.timeOptions;
    }
    
    return this.timeOptions.filter(option => option.value >= currentTime);
  }

  currentUser: any;
  token: string | null = null;
  
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, public sidebarService: SidebarService, private authService: AuthService) {}

  ngOnInit() {
    console.log('BookMySeatComponent ngOnInit started');
    

    if (!this.authService.isLoggedIn) {
      console.log('User not logged in!');
      alert('User not logged in!');
      return;
    }
    

    this.currentUser = this.authService.userSig();
    this.token = this.authService.token;
    
    console.log('Current user:', this.currentUser);
    console.log('Token:', this.token);
    console.log('Is logged in:', this.authService.isLoggedIn);
    

    this.checkAndAdjustDate();
    
    this.loadBuildings();
    

    this.selectTimeSlot('morning');
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  loadFloors() {
    if (!this.selectedBuildingId) {
      this.floors = [];
      this.rooms = [];
      this.seats = [];
      this.selectedFloorId = null;
      this.selectedRoomId = null;
      return;
    }
    this.http.get<FloorDTO[]>(`${this.apiUrl}/floors/building/${this.selectedBuildingId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (floors) => {
          this.floors = floors;
          if (floors.length) {
            this.selectedFloorId = floors[0].id;
            this.loadRooms();
          } else {
            this.rooms = [];
            this.seats = [];
            this.selectedRoomId = null;
          }
        },
        error: (err) => {
          console.error('Error loading floors:', err);
        }
      });
  }

  loadRooms() {
    if (!this.selectedFloorId) {
      this.rooms = [];
      this.seats = [];
      this.selectedRoomId = null;
      return;
    }
    this.http.get<RoomDTO[]>(`${this.apiUrl}/rooms/floor/${this.selectedFloorId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (rooms) => {

          this.rooms = rooms.filter(room => room.roomType === 'DESK_ROOM');
          if (this.rooms.length) {
            this.selectedRoomId = this.rooms[0].id;
          } else {
            this.selectedRoomId = null;
          }

          this.loadSeats();
        },
        error: (err) => {
          console.error('Error loading rooms:', err);
        }
      });
  }

  loadSeats() {
    if (!this.selectedFloorId || !this.selectedBuildingId) return;
    
    let params = new HttpParams()
      .set('buildingId', this.selectedBuildingId.toString())
      .set('floorId', this.selectedFloorId.toString())
      .set('date', this.formatDate(this.selectedDate))
      .set('startTime', `${this.selectedFrom}:00`)
      .set('endTime', `${this.selectedTo}:00`);
    

    if (this.selectedRoomId) {
      params = params.set('roomId', this.selectedRoomId.toString());
    }

    console.log('Loading seats with params:', params.toString());
    console.log('API URL:', `${this.apiUrl}/seats/available`);
    
    this.http.get<SeatAvailabilityDTO[]>(`${this.apiUrl}/seats/available`, { headers: this.getHeaders(), params })
      .subscribe({
        next: (seats) => {
          console.log('Seats loaded successfully:', seats);
          console.log('Number of seats:', seats.length);
          this.seats = seats;
          this.selectedSeats = [];
        },
        error: (err) => {
          console.error('Error loading seats:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
        }
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

  onBuildingChange() { 
    this.selectedFloorId = null;
    this.selectedRoomId = null;
    this.seats = [];
    this.loadFloors(); 
  }
  
  onFloorChange() { 
    this.selectedRoomId = null;
    this.seats = [];
    this.loadRooms(); 
  }
  
  onRoomChange() { 
    this.seats = [];
    this.loadSeats(); 
  }
  
  onTimeOrDateChange() { 
    this.seats = [];
    this.loadSeats(); 
  }



  /**
   * Select time slot and update time values
   */
  selectTimeSlot(slot: string) {
    this.selectedTimeSlot = slot;
    
    switch (slot) {
      case 'morning':
        this.selectedFrom = '08:00';
        this.selectedTo = '12:00';
        break;
      case 'afternoon':
        this.selectedFrom = '12:00';
        this.selectedTo = '18:00';
        break;
      case 'full-day':
        this.selectedFrom = '08:00';
        this.selectedTo = '18:00';
        break;
    }
    
    this.onTimeOrDateChange();
  }




  /**
   * Load buildings from API
   */
  loadBuildings() {
    console.log('Loading buildings...');
    console.log('Token:', this.token);
    console.log('Headers:', this.getHeaders());
    
    this.http.get<BuildingDTO[]>(`${this.apiUrl}/buildings`, { headers: this.getHeaders() })
      .subscribe({
        next: (buildings) => {
          console.log('Buildings loaded successfully:', buildings);
          this.buildings = buildings;
          if (buildings.length > 0) {
            this.selectedBuildingId = buildings[0].id;
            this.loadFloors();
          }
        },
        error: (err) => {
          console.error('Error loading buildings:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          alert('Failed to load buildings. Please check your connection and try logging in again.');
        }
      });
  }


  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Check if selected date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Get current time in HH:MM format
   */
  private getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Get next hour from given time
   */
  private getNextHour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const nextHour = (hours + 1) % 24;
    return `${String(nextHour).padStart(2, '0')}:00`;
  }

  /**
   * Check if current time is after 18:00 and adjust date accordingly
   */
  private checkAndAdjustDate() {
    const currentTime = this.getCurrentTime();
    if (currentTime > '18:00') {
      this.selectedDate = new Date(this.selectedDate.getTime() + 24 * 60 * 60 * 1000);
      this.minDate = new Date(this.minDate.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    this.sidebarService.toggle();
  }

  /**
   * Book selected seats - show confirmation dialog
   */
  bookSeats() {
    if (this.selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }


    if (this.selectedFrom && this.selectedTo) {
      if (this.selectedFrom >= this.selectedTo) {
        alert('Start time must be earlier than end time.');
        return;
      }
    }


    if (this.isToday(this.selectedDate)) {
      const currentTime = this.getCurrentTime();
      if (this.selectedFrom < currentTime) {
        alert('Cannot book in the past. Please select a future time.');
        return;
      }
    }

    this.showConfirm = true;
  }

  /**
   * Confirm booking and send to backend
   */
  confirmBooking() {
    if (this.selectedSeats.length === 0) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.error('User not found');
      alert('Please log in to make a reservation.');
      return;
    }

    const user = JSON.parse(userStr);
    const request: CreateReservationSeatRequest = {
      userId: user.id,
      seatId: this.selectedSeats.map(seat => seat.id),
      reservationDate: this.formatDate(this.selectedDate),
      startTime: this.selectedFrom,
      endTime: this.selectedTo
    };

    this.http.post(`${this.apiUrl}/reservations/seat`, request, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          console.log('Booking successful:', response);
          this.createdReservation = response;

          this.bookedSeatCount = this.selectedSeats.length;
          this.bookedSeatNumbers = this.selectedSeats.map(s => s.seatNumber);
          this.showConfirm = false;
          this.showBooked = true;
          this.selectedSeats = [];
          this.loadSeats();
        },
        error: (err) => {
          console.error('Error booking seats:', err);
          alert('Failed to book seats. Please try again.');
          this.showConfirm = false;
        }
      });
  }

  /**
   * Generate reservation number (1-1000 cycle)
   */
  getReservationNumber(reservation: any): number {
    if (!reservation?.id) return 1;

    return ((reservation.id - 1) % 1000) + 1;
  }

  /**
   * Close popup dialogs
   */
  closePopup() {
    this.showConfirm = false;
    this.showBooked = false;
  }

  /**
   * Get selected building name
   */
  get selectedBuildingName(): string {
    const building = this.buildings.find(b => b.id === this.selectedBuildingId);
    return building?.name || '';
  }

  /**
   * Get selected floor name
   */
  get selectedFloorName(): string {
    const floor = this.floors.find(f => f.id === this.selectedFloorId);
    return floor?.name || '';
  }

  /**
   * Get selected room name
   */
  get selectedRoomName(): string {
    const room = this.rooms.find(r => r.id === this.selectedRoomId);
    return room?.name || '';
  }

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
