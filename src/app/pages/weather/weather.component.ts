import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // <-- import RouterModule
import { WeatherService } from '../../core/services/weather.service';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, // <-- add this so routerLink works
  ],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent {
  city = 'Bucharest';
  date = new Date().toISOString().split('T')[0];
  result = '';

  constructor(private weatherService: WeatherService) {}

  getWeather() {
    console.log('Fetching weather for:', this.city, this.date);

    this.weatherService.getWeather(this.city, this.date)
      .subscribe({
        next: (data) => {
          console.log('Weather data received:', data);
          this.result = data;
        },
        error: (err) => {
          console.error('Error fetching weather:', err);
          this.result = 'Error fetching weather';
        }
      });
  }
}
