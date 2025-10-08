import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // 🔹 Obținem utilizatorul logat din AuthService
    this.user = this.auth.userSig();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    if (!this.user) return;
    localStorage.setItem('demo_user', JSON.stringify(this.user));
    this.auth.userSig.set(this.user);
    this.isEditing = false;
    alert('Profil actualizat cu succes!');
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
