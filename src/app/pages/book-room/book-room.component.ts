import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-book-room',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './book-room.component.html',
  styleUrls: ['./book-room.component.css']
})
export class BookRoomComponent {
  dates = ['26 Sep', '27 Sep', '28 Sep', '29 Sep', '30 Sep', '1 Oct', '2 Oct', '3 Oct'];
  selectedDate = '28 Sep';
  selectedFrom = '09:00';
  selectedTo = '17:00';
  selectedFloor = 'Etaj 1';
  selectedRoom = 'Meeting Room A';

  showConfirm = false;
  showBooked = false;

  search() {
    this.showConfirm = true;
  }

  confirmBooking() {
    this.showConfirm = false;
    this.showBooked = true;
  }

  closePopup() {
    this.showConfirm = false;
    this.showBooked = false;
  }
}
