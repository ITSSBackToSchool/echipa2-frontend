import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  emailModel: string = '';
  passwordModel: string = '';

  loading = false;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    if (!this.emailModel || !this.passwordModel) {
      this.errorMessage = 'Te rugăm să completezi toate câmpurile.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.emailModel, this.passwordModel).subscribe({
      next: (response) => {
        console.log('Login success:', response);
        this.loading = false;


        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.status === 401
            ? 'Email sau parolă incorectă.'
            : 'A apărut o eroare la autentificare.';
        console.error('Login error:', err);
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
