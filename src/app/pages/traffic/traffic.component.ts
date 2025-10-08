import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-traffic',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './traffic.component.html',
  styleUrls: ['./traffic.component.css']
})
export class TrafficComponent {
  fromTime = '';
  toTime = '';
  homeAddress = '';
  officeAddress = '';
  distanceKm = '';
  result = '';

  showPopup = false;

  calculate() {
    if (!this.homeAddress || !this.officeAddress) {
      this.result = 'Please enter both addresses!';
      return;
    }
    this.result = 'Estimated traffic: Moderate (20 min delay).';
  }

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
}
