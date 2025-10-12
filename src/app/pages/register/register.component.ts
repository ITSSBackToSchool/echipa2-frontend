import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userName = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    // 🔹 Check all fields are filled
    if (!this.userName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Te rugăm să completezi toate câmpurile.';
      return;
    }

    // 🔹 Check passwords match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Parolele nu coincid.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // 🔹 Call AuthService register
    this.authService.register(this.userName, this.email, this.password)
      .subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.loading = false;

          // 🔹 Redirect to dashboard after registration
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err.status === 400
              ? 'Email deja înregistrat.'
              : 'A apărut o eroare la înregistrare.';
          console.error('Registration error:', err);
        }
      });
  }
}
