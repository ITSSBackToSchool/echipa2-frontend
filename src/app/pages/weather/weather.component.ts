import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface WeatherHour {
  hour: string;
  temp: number;
}

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent {
  currentDate = new Date();
  selectedDay: Date | null = null;
  weatherData: { location: string; temperature: number; condition: string; hours: WeatherHour[] } | null = null;

  readonly daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  get monthLabel(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  get calendarDays(): (Date | null)[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
  }

  selectDay(day: Date | null) {
    if (!day) return;
    this.selectedDay = day;
    this.loadWeather();
  }

  isToday(day: Date | null): boolean {
    if (!day) return false;
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  }

  isSelected(day: Date | null): boolean {
    return (
      !!this.selectedDay &&
      !!day &&
      day.getDate() === this.selectedDay.getDate() &&
      day.getMonth() === this.selectedDay.getMonth() &&
      day.getFullYear() === this.selectedDay.getFullYear()
    );
  }

  loadWeather() {
    const random = Math.floor(Math.random() * 3);
    const condition = ['Sunny', 'Cloudy', 'Rainy'][random];
    this.weatherData = {
      location: 'Bucharest',
      temperature: 26 + Math.floor(Math.random() * 6),
      condition,
      hours: [
        { hour: '08:00', temp: 24 },
        { hour: '11:00', temp: 27 },
        { hour: '14:00', temp: 30 },
        { hour: '17:00', temp: 28 }
      ]
    };
  }
}
