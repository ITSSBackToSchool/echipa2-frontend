import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, SidebarComponent], // ✅ AICI adăugăm SidebarComponent
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent {
  selectedTime = '';
  selectedFloor = '';
  selectedWorkspace = '';

  times = ['Morning', 'Afternoon', 'Evening'];
  floors = ['Etaj 1', 'Etaj 2', 'Etaj 3'];
  workspaces = ['Sala A', 'Sala B', 'Open Space'];

  reservations = [
    { employee: 'Angajat 1', date: '2025-10-08', seat: 'Desk 5', room: 'Open Space' },
    { employee: 'Angajat 2', date: '2025-10-09', seat: 'Desk 7', room: 'Sala A' }
  ];

  chartData = {
    labels: ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'],
    datasets: [
      { data: [30, 50, 80, 60, 70], label: 'Ocupare locuri', fill: true, tension: 0.3 }
    ]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };
}
