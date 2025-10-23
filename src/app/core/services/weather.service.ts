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

  constructor(private http: HttpClient) {}

  getWeather(city: string, date: string): Observable<string> {
    const url = `${this.backendApiUrl}?city=${city}&date=${date}`;
    return this.http.get(url, { responseType: 'text' });
  }


}
