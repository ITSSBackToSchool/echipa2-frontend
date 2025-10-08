import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ReservationsListComponent } from './pages/reservations/reservations-list.component';
import { ReservationFormComponent } from './pages/reservations/reservation-form.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { BookMySeatComponent } from './pages/book-my-seat/book-my-seat.component';
import { BookRoomComponent } from './pages/book-room/book-room.component';
import { TrafficComponent } from './pages/traffic/traffic.component';
import { WeatherComponent } from './pages/weather/weather.component';


export const routes: Routes = [
  // 🔹 Pagini publice
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 🔹 Layout-ul principal (pagini private)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reservations', component: ReservationsListComponent },
      { path: 'reservations/new', component: ReservationFormComponent },
      { path: 'calendar', component: CalendarComponent },
      {
        path: 'analytics',
        component: AnalyticsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      { path: 'profile', component: ProfileComponent },
      { path: 'reservations', component: ReservationsListComponent },
      { path: 'book-seat', component: BookMySeatComponent },
      { path: 'book-room', component: BookRoomComponent },
      { path: 'traffic', component: TrafficComponent },
{ path: 'weather', component: WeatherComponent },


    ]
  },

  // 🔹 fallback
  { path: '**', redirectTo: 'login' }
];
