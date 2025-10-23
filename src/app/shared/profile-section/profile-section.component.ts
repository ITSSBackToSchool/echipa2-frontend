import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-profile">
      <div class="user-info">
        <span class="user-name">{{ getDisplayName() }}</span>
        <span class="user-role">{{ currentUser?.role || 'EMPLOYEE' }}</span>
      </div>
      <div class="user-avatar-dropdown" (click)="toggleUserDropdown()">
        <svg class="profile-icon" 
             viewBox="0 0 24 24" 
             fill="none" 
             stroke="currentColor" 
             stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <!-- Dropdown Menu -->
      <div class="user-dropdown" *ngIf="showUserDropdown">
        <button class="dropdown-item" (click)="goToProfile()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Profile
        </button>
        <button class="dropdown-item" (click)="logout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </div>
  `,
  styles: [`
    
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #1f2937;
    }

    .user-role {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
    }

    .user-avatar-dropdown {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #14a8ae;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid #14a8ae;
      overflow: hidden;
    }

    .user-avatar-dropdown:hover {
      background: #0E7479;
      border-color: #0E7479;
      transform: scale(1.05);
    }

    .profile-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .profile-icon {
      width: 20px;
      height: 20px;
      color: white;
      stroke-width: 2;
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 1px solid #e5e7eb;
      min-width: 160px;
      z-index: 1000;
      overflow: hidden;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      color: #374151;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
      text-align: left;
    }

    .dropdown-item:hover {
      background: #f3f4f6;
    }

    .dropdown-item svg {
      width: 16px;
      height: 16px;
      stroke-width: 2;
    }
  `]
})
export class ProfileSectionComponent implements OnInit {
  currentUser: any = null;
  showUserDropdown = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
    

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-profile')) {
        this.showUserDropdown = false;
      }
    });
  }

  /**
   * Toggle user dropdown menu
   */
  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  /**
   * Navigate to profile page
   */
  goToProfile(): void {
    this.showUserDropdown = false;
    this.router.navigate(['/profile']);
  }

  /**
   * Get display name (firstName if available, otherwise first part of name)
   */
  getDisplayName(): string {
    if (!this.currentUser) return 'User';
    

    if (this.currentUser.firstName) {
      return this.currentUser.firstName;
    }
    

    const name = this.currentUser.userName || this.currentUser.name || 'User';
    return name.split(' ')[0];
  }


  /**
   * Logout user
   */
  logout(): void {
    this.showUserDropdown = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
