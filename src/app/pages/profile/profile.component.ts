import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user: { name: string; email: string; role: string } | null = null;

  constructor() {
    // load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
  }

  // ✅ Metodă pentru inițială
  get userInitial(): string {
    return this.user?.name?.charAt(0)?.toUpperCase() || '?';
  }
}
