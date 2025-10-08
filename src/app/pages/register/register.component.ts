import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // 🔹 Proprietăți legate de formular
  fullName: string = '';         // ✅ adăugată
  email: string = '';
  password: string = '';
  confirmPassword: string = '';  // ✅ deja adăugată mai sus

  // 🔹 Funcție apelată la submit
  register(): void {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      alert('Te rugăm să completezi toate câmpurile!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Parolele nu coincid!');
      return;
    }

    console.log('Cont creat pentru:', this.fullName, this.email);
    alert(`Cont creat cu succes pentru ${this.fullName}!`);
  }
}
