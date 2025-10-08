import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component'; // ✅

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, SidebarComponent], // ✅
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  current = dayjs();

  get monthLabel(): string {
    return this.current.format('MMMM YYYY');
  }

  daysInMonth() {
    const start = this.current.startOf('month').startOf('week');
    const end = this.current.endOf('month').endOf('week');
    const days = [];
    let day = start;
    while (day.isBefore(end, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }
    return days;
  }

  next() {
    this.current = this.current.add(1, 'month');
  }

  prev() {
    this.current = this.current.subtract(1, 'month');
  }
}
