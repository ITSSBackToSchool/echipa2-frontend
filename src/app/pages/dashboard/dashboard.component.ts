// // // import { Component } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { RouterLink } from '@angular/router';

// // // @Component({
// // //   selector: 'app-dashboard',
// // //   standalone: true,
// // //   imports: [CommonModule, RouterLink],
// // //   templateUrl: './dashboard.component.html',
// // //   styleUrls: ['./dashboard.component.css']
// // // })
// // // export class DashboardComponent {
// // //   reservations = [
// // //     { date: '23 September', details: 'Meeting Room A' },
// // //     { date: '25 September', details: 'Desk 14 – Open Space' }
// // //   ];

// // //   officePresence = {
// // //     month: 12,
// // //     total: 48,
// // //     streak: 7
// // //   };

// // //   weather = {
// // //     city: 'Bucharest',
// // //     temp: 30,
// // //     condition: 'Sunny'
// // //   };
// // // }
// // import { Component } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { RouterLink } from '@angular/router';

// // @Component({
// //   selector: 'app-dashboard',
// //   standalone: true,
// //   imports: [CommonModule, RouterLink],
// //   templateUrl: './dashboard.component.html',
// //   styleUrls: ['./dashboard.component.css']
// // })
// // export class DashboardComponent {
// //   // 🔹 Rezervări simple (fără status/vreme)
// //   reservations = [
// //     { date: '23 September', details: 'Meeting Room A' },
// //     { date: '25 September', details: 'Desk 14 – Open Space' }
// //   ];

// //   // 🔹 Prezență la birou
// //   officePresence = {
// //     month: 12,
// //     total: 48,
// //     streak: 7
// //   };
// // }

// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, RouterLink],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css']
// })
// export class DashboardComponent {
//   reservations = [
//     { reservationDate: new Date(2025, 8, 23), time: '09:00', details: 'Meeting Room A', status: 'CONFIRMED' },
//     { reservationDate: new Date(2025, 8, 25), time: '13:30', details: 'Desk 14 – Open Space', status: 'PENDING' }
//   ];

//   officePresence = {
//     month: 12,
//     total: 48,
//     streak: 7
//   };
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReservationService, UserReservation } from '../../core/services/reservation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  reservations: UserReservation[] = [];
  weather: any = null;

  officePresence = {
    month: 12,
    total: 48,
    streak: 7
  };

  userId: number = 0;

  constructor(
    private reservationService: ReservationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // 🔹 Ia userId-ul salvat după login
    const storedId = localStorage.getItem('userId');
    this.userId = storedId ? Number(storedId) : 0;

    if (this.userId) {
      this.loadUserReservations();
    }
  }

  /**
   * 🔹 Încarcă rezervările utilizatorului curent
   */
  private loadUserReservations(): void {
    this.reservationService.getUserReservations(this.userId).subscribe({
      next: (data) => {
        this.reservations = data;
        console.log('Rezervări încărcate:', data);

        // După ce avem rezervările, încarcă vremea
        if (this.reservations.length > 0) {
          this.loadWeatherForReservation(this.reservations[0]);
        }
      },
      error: (err) => {
        console.error('Eroare la obținerea rezervărilor:', err);
      }
    });
  }

  /**
   * 🔹 Încarcă vremea pentru orașul rezervării (sau un fallback default)
   */
  private loadWeatherForReservation(reservation: UserReservation): void {
    // 🔹 presupunem că ai un câmp 'city' sau 'location' în rezervare
    const city = (reservation as any).city || 'Bucharest';

    const apiKey = '👉 AICI_PUI_API_KEY_DE_LA_OpenWeather 👈';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.weather = {
          city: data.name,
          currentTemp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        };
        console.log('Vreme încărcată:', this.weather);
      },
      error: (err) => {
        console.error('Eroare la preluarea vremii:', err);
      }
    });
  }
}
