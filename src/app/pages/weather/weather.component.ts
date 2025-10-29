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
  hourly: any[] = [];
  daily: any[] = [];
  pollen: any = null;
  treePollenCategory: string | null = null;
  treePollenValue: number | null = null;

  selectedDayIndex = 0;
  currentHourIndex = 0;
  selectedHourIndex = 0;
  dayHours: any[] = [];

  pollenSelectedDayIndex = 0;

  currentUser: any;

  constructor(private weatherService: WeatherService, public sidebarService: SidebarService) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
    this.loadForecast();
    this.loadPollen();
  }

  getWeather() {
    this.weatherService.getWeather(this.city, this.date)
      .subscribe({
        next: (data) => {
          this.result = data;
        },
        error: () => {
          this.result = 'Error fetching weather';
        }
      });
  }

  private computeCurrentHourIndex(times: string[]): number {
    if (!times?.length) return 0;
    const now = new Date();
    let idx = 0;
    let minDiff = Number.MAX_SAFE_INTEGER;
    times.forEach((iso, i) => {
      const d = new Date(iso);
      const diff = Math.abs(d.getTime() - now.getTime());
      if (diff < minDiff) { minDiff = diff; idx = i; }
    });
    return idx;
  }

  private hoursForDay(dayIndex: number): any[] {
    if (!this.hourly?.length || !this.daily?.[dayIndex]) return [];
    const dayStr = this.daily[dayIndex].date;
    return this.hourly.filter((h) => (new Date(h.time)).toISOString().startsWith(dayStr));
  }

  selectDay(i: number) {
    this.selectedDayIndex = i;
    this.dayHours = this.hoursForDay(i);
    if (this.dayHours.length) {
      const idx = this.computeCurrentHourIndex(this.dayHours.map(h => h.time));
      this.selectedHourIndex = idx;
    } else {
      this.selectedHourIndex = 0;
    }
  }

  selectHour(i: number) {
    this.selectedHourIndex = i;
  }

  private tempStats(hours: any[]): {min: number, max: number} {
    const temps = (hours || []).map(h => Number(h?.temp ?? 0));
    if (!temps.length) return { min: 0, max: 1 };
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    return { min, max: max === min ? min + 1 : max };
  }

  private buildPath(hours: any[], closeToBottom: boolean): string {
    if (!hours?.length) return '';
    const { min, max } = this.tempStats(hours);
    const n = hours.length;
    const toX = (i: number) => (i / (n - 1)) * 100;
    const toY = (t: number) => 60 - ((t - min) / (max - min)) * 50;

    let d = '';
    hours.forEach((h, i) => {
      const x = toX(i);
      const y = toY(Number(h.temp));
      d += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
    });
    if (closeToBottom) {
      d += ` L 100,60 L 0,60 Z`;
    }
    return d;
  }

  getTempLinePath(): string {
    return this.buildPath(this.threeHourPoints(this.dayHours), false);
  }

  getTempAreaPath(): string {
    return this.buildPath(this.threeHourPoints(this.dayHours), true);
  }

  private threeHourPoints(hours: any[]): any[] {
    if (!Array.isArray(hours)) return [];
    return hours.filter((h) => {
      const hr = new Date(h.time).getHours();
      return hr % 3 === 0;
    });
  }

  threeHourSamples(): { time: string; temp: number; index: number }[] {
    if (!Array.isArray(this.dayHours)) return [];
    return this.dayHours
      .map((h, i) => ({ time: h.time, temp: h.temp, index: i }))
      .filter((s) => new Date(s.time).getHours() % 3 === 0);
  }

  positionForIndex(i: number): number {
    const n = this.threeHourSamples().length;
    if (n <= 1) return 50;
    return 2 + (i * 96) / (n - 1);
  }

  private fixedHours(): number[] { return [3, 6, 9, 12, 15]; }

  private findHourEntry(hours: any[], hour: number): any | null {
    if (!Array.isArray(hours)) return null;
    let exact = hours.find(h => new Date(h.time).getHours() === hour) || null;
    if (exact) return exact;
    let candidate: any = null;
    let bestDiff = 99;
    hours.forEach(h => {
      const hr = new Date(h.time).getHours();
      const diff = Math.abs(hr - hour);
      if (diff < bestDiff) { bestDiff = diff; candidate = h; }
    });
    return candidate;
  }

  private codeToText(code: number | null | undefined): string {
    const c = typeof code === 'number' ? code : NaN;
    if (isNaN(c)) return 'Clear';
    if (c === 0) return 'Clear';
    if (c === 1) return 'Mostly clear';
    if (c === 2) return 'Partly cloudy';
    if (c === 3) return 'Overcast';
    if ([45, 48].includes(c)) return 'Fog';
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'Rain';
    if (c >= 71 && c <= 77) return 'Snow';
    if (c >= 95 && c <= 99) return 'Thunderstorm';
    return 'Clear';
  }

  getHourIcon(code: number | null | undefined, precip?: number | null | undefined): string {
    const c = typeof code === 'number' ? code : NaN;
    const p = typeof precip === 'number' ? precip : 0;
    if (isNaN(c)) return p > 0.1 ? '🌧️' : '☀️';
    if (c === 0) return '☀️';
    if (c === 1) return p > 0.1 ? '🌧️' : '☀️';
    if (c === 2) return p > 0.1 ? '🌧️' : '⛅';
    if (c === 3) return p > 0.1 ? '🌧️' : '☁️';
    if ([45, 48].includes(c)) return '🌫️';
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return '🌧️';
    if (c >= 71 && c <= 77) return '❄️';
    if (c >= 95 && c <= 99) return '⛈️';
    return p > 0.1 ? '🌧️' : '☀️';
  }

  getFixedHourEntries(): { hour: number; time: string; temp: number; text: string; icon: string }[] {
    const hours = this.dayHours;
    return this.fixedHours().map((hr) => {
      const entry = this.findHourEntry(hours, hr);
      const time = entry?.time ?? (this.daily?.[this.selectedDayIndex]?.date + `T${String(hr).padStart(2, '0')}:00:00Z`);
      const temp = typeof entry?.temp === 'number' ? entry.temp : 0;
      const text = this.codeToText(entry?.code);
      const icon = this.getHourIcon(entry?.code, entry?.precip);
      return { hour: hr, time, temp, text, icon };
    });
  }

  getDayIcon(i: number): string {
    const d = this.daily?.[i];
    if (!d) return '☀️';
    const code = Number(d.code ?? NaN);
    const precip = Number(d.precip ?? 0);
    
    if (isNaN(code)) {
      return precip > 0.1 ? '🌧️' : '☀️';
    }

    if (code === 0) return '☀️';
    if (code === 1) return precip > 0.1 ? '🌧️' : '☀️';
    if (code === 2) return precip > 0.1 ? '🌧️' : '☀️';
    if (code === 3) return precip > 0.1 ? '🌧️' : '☁️';
    if ([45, 48].includes(code)) return '☁️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 95 && code <= 99) return '⛈️';

    return precip > 0.1 ? '🌧️' : '☀️';
  }

  private mapPollenCategoryFromValue(value: number | null): string | null {
    if (value == null || isNaN(value)) return null;
    const v = Math.max(0, Math.min(4, Math.round(value)));
    return ['Low','Moderate','High','Very High','Extreme'][v] || 'Low';
  }

  getPollenPercent(): number {
    const value = typeof this.treePollenValue === 'number' ? this.treePollenValue : 0;
    const v = Math.max(0, Math.min(4, Number(value)));
    return 100 - (v * 25);
  }

  loadForecast() {
    this.weatherService.getForecast().subscribe({
      next: (data) => {
        this.hourly = data?.hourly?.time?.map((t: string, i: number) => ({
          time: t,
          temp: data.hourly.temperature_2m[i],
          humidity: data.hourly.relative_humidity_2m[i],
          precip: data.hourly.precipitation[i],
          wind: data.hourly.wind_speed_10m[i],
          code: data.hourly.weathercode?.[i]
        })) ?? [];

        this.daily = data?.daily?.time?.map((d: string, i: number) => ({
          date: d,
          tmax: data.daily.temperature_2m_max[i],
          tmin: data.daily.temperature_2m_min[i],
          precip: data.daily.precipitation_sum[i],
          code: data.daily.weathercode?.[i]
        })) ?? [];

        this.currentHourIndex = this.computeCurrentHourIndex(data?.hourly?.time ?? []);
        this.selectDay(0);
      }
    });
  }

  loadPollen() {
    this.weatherService.getPollen(undefined, undefined, 7).subscribe({
      next: (data) => {
        this.pollen = data;
        this.applyPollenDay(this.pollenSelectedDayIndex);
      }
    });
  }

  selectPollenDay(i: number) {
    this.pollenSelectedDayIndex = i;
    this.applyPollenDay(i);
  }

  private applyPollenDay(dayIndex: number) {
    try {
      const dailyArray = this.pollen?.dailyInfo ?? this.pollen?.daily_info ?? [];
      const entry = dailyArray?.[dayIndex];
      const types = entry?.pollenTypeInfo ?? entry?.pollen_type_info ?? [];
      const tree = Array.isArray(types)
        ? types.find((t: any) => (t?.pollenType ?? t?.pollen_type) === 'TREE')
        : null;
      const idx = tree?.indexInfo ?? tree?.index_info ?? null;
      const rawVal = typeof idx?.value === 'number' ? idx.value : null;
      const rawCat = idx?.category ?? null;
      this.treePollenValue = rawVal;
      this.treePollenCategory = rawCat || this.mapPollenCategoryFromValue(rawVal) || 'Low';
    } catch {
      this.treePollenCategory = null;
      this.treePollenValue = null;
    }
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
