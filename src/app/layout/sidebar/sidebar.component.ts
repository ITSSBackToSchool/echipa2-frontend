import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,   // <== IMPORTANT
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private auth: AuthService) {}

  get user() {
    return this.auth.userSig();
  }

  get role() {
    return this.auth.role;
  }

  navEmployee = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Reservations', path: '/reservations' },
    { label: 'Book a Room', path: '/book-room' },
    { label: 'Book my seat', path: '/book-seat' },
    { label: 'Traffic', path: '/traffic' },
    { label: 'Weather', path: '/weather' },
  ];

  navAdmin = [
    ...this.navEmployee,
    { label: 'Analytics', path: '/analytics' }
  ];
}
