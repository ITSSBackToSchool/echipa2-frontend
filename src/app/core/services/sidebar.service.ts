import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarCollapsed = signal(false);
  private initialized = false;

  constructor() {
    this.initializeState();
  }

  private initializeState() {
    if (!this.initialized) {

      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        this.sidebarCollapsed.set(savedState === 'true');
      }
      this.initialized = true;
    }
  }

  get collapsed() {
    return this.sidebarCollapsed.asReadonly();
  }

  toggle() {
    const newState = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  }
}
