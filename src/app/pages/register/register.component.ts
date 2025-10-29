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
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(`${this.firstName} ${this.lastName}`, this.email, this.password, this.firstName, this.lastName)
      .subscribe({
        next: (response) => {
          this.loading = false;

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);
        },
        error: (err) => {
          this.loading = false;
          console.error('Registration error:', err);
          

          if (err.status === 400) {

            if (err.error?.message === 'Email already registered' || err.error?.error === 'Email already registered') {
              this.errorMessage = 'Un cont cu acest email deja există.';
            } else {
              this.errorMessage = err.error?.message || err.error?.error || 'Email deja înregistrat.';
            }
          } else if (err.status === 0) {
            this.errorMessage = 'Nu se poate conecta la server. Verifică dacă backend-ul rulează.';
          } else {
            this.errorMessage = 'A apărut o eroare la înregistrare. Încearcă din nou.';
          }
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
