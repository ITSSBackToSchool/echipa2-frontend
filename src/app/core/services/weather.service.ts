import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  coord?: {
    lat: number;
    lon: number;
  };
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private backendApiUrl = 'http://localhost:8080/api/weather';
  private pollenApiUrl = 'http://localhost:8080/api/pollen';

  constructor(private http: HttpClient) {}

  getWeather(city: string, date: string): Observable<string> {
    const url = `${this.backendApiUrl}?city=${city}&date=${date}`;
    return this.http.get(url, { responseType: 'text' });
  }

  getForecast(lat = 44.4268, lon = 26.1025): Observable<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=7`;
    return this.http.get(url);
  }

  getPollen(lat = 44.4268, lon = 26.1025, days = 3): Observable<any> {
    const url = `${this.pollenApiUrl}?lat=${lat}&lon=${lon}&days=${days}`;
    return this.http.get(url);
  }
}
