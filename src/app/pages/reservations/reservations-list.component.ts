import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router'; // ✅ Import esențial

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // ✅ Adăugate aici
  templateUrl: './reservations-list.component.html',
  styleUrls: ['./reservations-list.component.css']
})
export class ReservationsListComponent {
  reservations = [
    { employee: 'Andrei Popescu', date: '2025-10-08', seat: 'Desk 12', room: 'T1 - Etaj 1' },
    { employee: 'Maria Ionescu', date: '2025-10-09', seat: 'Desk 7', room: 'T2 - Etaj 2' },
    { employee: 'Admin User', date: '2025-10-10', seat: 'Desk 3', room: 'T1 - Parter' },
  ];
}
