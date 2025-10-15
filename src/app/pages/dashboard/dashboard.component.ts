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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  reservations = [
    { reservationDate: new Date(2025, 8, 23), time: '09:00', details: 'Meeting Room A', status: 'CONFIRMED' },
    { reservationDate: new Date(2025, 8, 25), time: '13:30', details: 'Desk 14 – Open Space', status: 'PENDING' }
  ];

  officePresence = {
    month: 12,
    total: 48,
    streak: 7
  };

  weather: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadWeather();
  }

  loadWeather() {
  if (this.reservations.length === 0) return;

  const city = this.reservations[0].details;
  const apiKey = ''; 
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  this.http.get(url).subscribe({
    next: (data: any) => {
      this.weather = {
        city: data.name,
        currentTemp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon
      };
    },
    error: (err) => console.error('Eroare la preluarea vremii:', err)
  });
}
}
