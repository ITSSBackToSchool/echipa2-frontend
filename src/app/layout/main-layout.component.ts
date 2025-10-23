import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  sidebarOpen = true;
  dropdownOpen = false;
  isMobile = false;

  constructor(private auth: AuthService) {
    this.checkViewport();
    this.restoreSidebarState();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkViewport();
  }

  private checkViewport() {
    this.isMobile = window.innerWidth < 900;
    if (this.isMobile) this.sidebarOpen = false;
  }

  private restoreSidebarState() {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.sidebarOpen = savedState !== 'true';
    }
  }

  get user() {
    return this.auth.userSig?.();
  }

  get role() {
    return this.user?.role || 'EMPLOYEE';
  }

  navEmployee = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Reservations', path: '/reservations' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'Profile', path: '/profile' },
  ];

  navAdmin = [
    ...this.navEmployee,
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    localStorage.setItem('sidebarCollapsed', String(!this.sidebarOpen));
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.auth.logout();
  }
}
