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
  user = {
    name: 'Employee User',
    email: 'employee@example.com',
    role: 'Employee'
  };

  // ✅ Metodă pentru inițială
  get userInitial(): string {
    // Dacă user-ul are nume, ia prima literă mare; altfel afișează “?”
    return this.user?.name?.charAt(0)?.toUpperCase() || '?';
  }
}
