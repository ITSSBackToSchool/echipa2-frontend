import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private apiUrl = 'http://localhost:8080/api/weather';

  constructor(private http: HttpClient) {}

  getWeather(city: string, date: string): Observable<string> {
    // Use **backticks ` ` for template literals**
    const url = `${this.apiUrl}?city=${city}&date=${date}`;
    return this.http.get(url, { responseType: 'text' });
  }

  
}
