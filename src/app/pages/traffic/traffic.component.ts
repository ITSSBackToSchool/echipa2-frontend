import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-traffic',
  templateUrl: './traffic.component.html',
  styleUrls: ['./traffic.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule ]
})
export class TrafficComponent {
  origin = 'jilavei 34';
  destination = 'pipera';
  routeDistance = '';
  routeDuration = '';
  routeSteps: string[] = [];
  errorMessage = '';

  constructor(private http: HttpClient) {}

  calculate() {
    this.errorMessage = '';
    this.routeDistance = '';
    this.routeDuration = '';
    this.routeSteps = [];

    const url = `http://localhost:8080/api/traffic?origin=${this.origin}&destination=${this.destination}`;

    this.http.get<any>(url).subscribe({
      next: (data) => {
        if (data && data.distanceKm != null) {
          this.routeDistance = `${data.distanceKm} km`;
          this.routeDuration = `${data.trafficDurationMin} mins`;
          this.routeSteps = [
            `From ${data.start} to ${data.end}`,
            `Traffic level: ${data.trafficLevel}`,
            `Delay: ${data.trafficDelayMin} mins`
          ];
        } else {
          this.errorMessage = 'No routes found.';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = 'Error fetching traffic data.';
        console.error(err);
      }
    });
  }
}
