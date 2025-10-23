import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SidebarService } from '../../core/services/sidebar.service';
import { ProfileSectionComponent } from '../../shared/profile-section/profile-section.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    ProfileSectionComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  isEditing = false;
  showSuccessNotification = false;
  showErrorNotification = false;
  notificationMessage = '';
  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    homeAddress: ''
  };

  constructor(
    private http: HttpClient,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {

    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      
      

      this.editForm = {
        firstName: this.currentUser?.firstName || '',
        lastName: this.currentUser?.lastName || '',
        email: this.currentUser?.email || '',
        phone: this.currentUser?.phone || '',
        homeAddress: this.currentUser?.homeAddress || ''
      };
    }
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  /**
   * Start editing profile
   */
  startEditing(): void {
    this.isEditing = true;
  }

  /**
   * Cancel editing
   */
  cancelEditing(): void {
    this.isEditing = false;

    this.editForm = {
      firstName: this.currentUser?.firstName || '',
      lastName: this.currentUser?.lastName || '',
      email: this.currentUser?.email || '',
      phone: this.currentUser?.phone || '',
      homeAddress: this.currentUser?.homeAddress || ''
    };
  }

  /**
   * Save profile changes
   */
  saveProfile(): void {
    if (!this.currentUser) return;

    const headers = this.getHeaders();
    const updateData = {
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      email: this.editForm.email,
      phone: this.editForm.phone,
      homeAddress: this.editForm.homeAddress
    };

    this.http.put(`http://localhost:8080/api/users/${this.currentUser.id}`, updateData, { headers })
      .subscribe({
        next: (response) => {
          console.log('Profile updated:', response);

          this.currentUser = { ...this.currentUser, ...updateData };
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          this.isEditing = false;
          this.showSuccessNotification = true;
          this.notificationMessage = 'Profile updated successfully!';

          setTimeout(() => {
            this.showSuccessNotification = false;
          }, 3000);
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.showErrorNotification = true;
          this.notificationMessage = 'Failed to update profile. Please try again.';

          setTimeout(() => {
            this.showErrorNotification = false;
          }, 5000);
        }
      });
  }


  /**
   * Get headers for API requests
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Get display name
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
   * Close success notification
   */
  closeSuccessNotification(): void {
    this.showSuccessNotification = false;
  }

  /**
   * Close error notification
   */
  closeErrorNotification(): void {
    this.showErrorNotification = false;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
