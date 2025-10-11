import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.auth.login(this.email, this.password);

    // ✅ redirecționează utilizatorul spre pagina Home după autentificare
    this.router.navigate(['/home']);
  }

  // 🔹 dacă utilizatorul apasă "Creează cont"
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
