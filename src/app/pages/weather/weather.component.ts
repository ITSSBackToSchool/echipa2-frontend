import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WeatherService } from '../../core/services/weather.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { ProfileSectionComponent } from '../../shared/profile-section/profile-section.component';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ProfileSectionComponent
  ],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  city = 'Bucharest';
  date = new Date().toISOString().split('T')[0];
  result = '';
  
  
  currentUser: any;

  constructor(private weatherService: WeatherService, public sidebarService: SidebarService) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

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


  toggleSidebar() {
    this.sidebarService.toggle();
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

}
