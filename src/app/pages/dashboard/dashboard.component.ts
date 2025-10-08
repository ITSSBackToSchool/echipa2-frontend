import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  reservations = [
    { date: '23 September', details: 'Meeting Room A' },
    { date: '25 September', details: 'Desk 14 – Open Space' }
  ];

  officePresence = {
    month: 12,
    total: 48,
    streak: 7
  };

  weather = {
    city: 'Bucharest',
    temp: 30,
    condition: 'Sunny'
  };
}
