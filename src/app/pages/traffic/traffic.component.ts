import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../core/services/sidebar.service';
import { ProfileSectionComponent } from '../../shared/profile-section/profile-section.component';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-traffic',
  templateUrl: './traffic.component.html',
  styleUrls: ['./traffic.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    ProfileSectionComponent
  ]
})
export class TrafficComponent implements OnInit {
  origin = '';
  destination = '';
  departureDateTime: string = '';
  routeDistance = '';
  routeDuration = '';
  routeSteps: string[] = [];
  errorMessage = '';
  isLoading = false;
  routeDurationNormal = '';
  routeDurationTraffic = '';
  travelMode: 'DRIVING' | 'WALKING' | 'TRANSIT' = 'DRIVING';
  selectedTransitModes: Array<'BUS'|'SUBWAY'|'TRAIN'|'TRAM'|'RAIL'> = ['BUS','SUBWAY','TRAIN','TRAM','RAIL'];
  routeSummary = '';
  routeSummaryHtml = '';
  alternatives: { index: number; title: string; distance: string; duration: string }[] = [];
  selectedRouteIndex = 0;
  timeType: 'LEAVE_NOW' | 'DEPART_AT' | 'ARRIVE_BY' = 'LEAVE_NOW';
  routePreference: 'BEST' | 'FEWER_TRANSFERS' | 'LESS_WALKING' = 'BEST';
  optBus = false; optSubway = true; optTrain = false; optTram = false;
  showOptionsOverlay = false;

  map: any;
  directionsService: any;
  directionsRenderer: any;
  trafficLayer: any;
  mapLoaded = false;
  geocoder: any;
  markers: any[] = [];
  isSelectingOrigin = false;
  isSelectingDestination = false;
  originAutocomplete: any;
  destinationAutocomplete: any;

  constructor(private http: HttpClient, public sidebarService: SidebarService) {}

  ngOnInit() {
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 2);
    this.departureDateTime = defaultDate.toISOString().slice(0, 16);

    this.loadGoogleMaps();
  }

  loadGoogleMaps() {
    if (!environment.googleMapsApiKey) {
      this.errorMessage = 'Google Maps API key is missing. Set environment.googleMapsApiKey at build time.';
      return;
    }
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      this.initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,directions&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    (window as any).initMap = () => this.initMap();
    
    document.head.appendChild(script);
  }

  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      setTimeout(() => this.initMap(), 100);
      return;
    }

    this.map = new google.maps.Map(mapElement, {
      zoom: 10,
      center: { lat: 44.4268, lng: 26.1025 }
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#0E7479',
        strokeOpacity: 0.9,
        strokeWeight: 6
      }
    });
    this.directionsRenderer.setMap(this.map);

    this.trafficLayer = new google.maps.TrafficLayer();
    this.trafficLayer.setMap(null);
    this.geocoder = new google.maps.Geocoder();
    setTimeout(() => {
      this.initAutocomplete();
    }, 500);
    this.map.addListener('click', (event: any) => {
      this.onMapClick(event.latLng);
    });

    this.mapLoaded = true;
  }

  private toGoogleTransitModes(modes: Array<'BUS'|'SUBWAY'|'TRAIN'|'TRAM'|'RAIL'>) {
    if (!modes || !Array.isArray(modes)) return undefined;
    const map: any = {
      BUS: (window as any).google?.maps?.TransitMode?.BUS,
      SUBWAY: (window as any).google?.maps?.TransitMode?.SUBWAY,
      TRAIN: (window as any).google?.maps?.TransitMode?.TRAIN,
      TRAM: (window as any).google?.maps?.TransitMode?.TRAM,
      RAIL: (window as any).google?.maps?.TransitMode?.RAIL
    };
    const converted = modes
      .map(m => map[m])
      .filter(Boolean);
    return converted.length ? converted : undefined;
  }

  initAutocomplete() {
    const originInput = document.getElementById('origin-input') as HTMLInputElement;
    const destinationInput = document.getElementById('destination-input') as HTMLInputElement;

    if (originInput && typeof google !== 'undefined' && google.maps) {
      this.originAutocomplete = new google.maps.places.Autocomplete(originInput);
      this.originAutocomplete.bindTo('bounds', this.map);
      this.originAutocomplete.addListener('place_changed', () => {
        const place = this.originAutocomplete.getPlace();
        if (place.geometry) {
          this.origin = place.formatted_address || place.name;
          this.map.panTo(place.geometry.location);
          this.map.setZoom(15);
        }
      });
    }

    if (destinationInput && typeof google !== 'undefined' && google.maps) {
      this.destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
      this.destinationAutocomplete.bindTo('bounds', this.map);
      this.destinationAutocomplete.addListener('place_changed', () => {
        const place = this.destinationAutocomplete.getPlace();
        if (place.geometry) {
          this.destination = place.formatted_address || place.name;
          this.map.panTo(place.geometry.location);
          this.map.setZoom(15);
        }
      });
    }
  }

  calculate() {
    this.errorMessage = '';
    this.routeDistance = '';
    this.routeDuration = '';
    this.routeSteps = [];
    this.routeDurationNormal = '';
    this.routeDurationTraffic = '';
    this.routeSummary = '';
    this.routeSummaryHtml = '';
    this.alternatives = [];
    this.selectedRouteIndex = 0;
    this.isLoading = true;

    if (!this.origin || !this.destination) {
      this.errorMessage = 'Please enter both origin and destination.';
      this.isLoading = false;
      return;
    }

    this.displayRoute();

    let url = `http://localhost:8080/api/traffic?origin=${encodeURIComponent(this.origin)}&destination=${encodeURIComponent(this.destination)}`;
    
    console.log('Calling backend:', url);
    
    if (this.departureDateTime) {
      const departureDateTime = new Date(this.departureDateTime);
      if (!isNaN(departureDateTime.getTime())) {
        url += `&departureTime=${departureDateTime.toISOString()}`;
      }
    }

    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data && data.distanceKm != null) {
          this.routeDistance = `${data.distanceKm} km`;
          this.routeDuration = `${data.trafficDurationMin} mins`;
          this.routeDurationTraffic = this.routeDuration;
          this.routeDurationNormal = `${data.normalDurationMin} mins`;
          this.routeSteps = [
            `From ${data.start} to ${data.end}`,
            `Normal time: ${data.normalDurationMin} mins`,
            `With traffic: ${data.trafficDurationMin} mins`,
            `Traffic level: ${data.trafficLevel}`,
            `Delay: ${data.trafficDelayMin} mins`
          ];
          
          // Route already drawn above; nothing else needed here
        } else {
          this.errorMessage = 'No routes found.';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Backend traffic endpoint failed (UI continues with JS SDK):', err);
      }
    });
  }

  displayRoute() {
    if (!this.map || !this.directionsService || !this.directionsRenderer) {
      return;
    }

    const departureDate = this.departureDateTime ? new Date(this.departureDateTime) : new Date();
    
    const request: any = {
      origin: this.origin,
      destination: this.destination,
      travelMode: this.travelMode,
      optimizeWaypoints: true,
      provideRouteAlternatives: true
    };
    if (this.travelMode === 'DRIVING') {
      const when = this.timeType === 'LEAVE_NOW' ? new Date() : (this.departureDateTime ? new Date(this.departureDateTime) : new Date());
      request.drivingOptions = {
        departureTime: when,
        trafficModel: 'bestguess'
      };
    }
    if (this.travelMode === 'TRANSIT') {
      const rawSelected = [
        this.optBus ? 'BUS' : null,
        this.optSubway ? 'SUBWAY' : null,
        this.optTrain ? 'TRAIN' : null,
        this.optTram ? 'TRAM' : null,
        this.optTram ? 'RAIL' : null
      ].filter(Boolean) as Array<'BUS'|'SUBWAY'|'TRAIN'|'TRAM'|'RAIL'>;
      const selected = Array.from(new Set(rawSelected)) as Array<'BUS'|'SUBWAY'|'TRAIN'|'TRAM'|'RAIL'>;
      if (selected.length) { this.selectedTransitModes = selected as any; }
      const onlySubway = selected.length === 1 && selected[0] === 'SUBWAY';
      const modes = this.toGoogleTransitModes(onlySubway ? ['SUBWAY'] : (selected as any));
      const rp = (window as any).google?.maps?.TransitRoutePreference;
      const pref = this.routePreference === 'FEWER_TRANSFERS' ? rp?.FEWER_TRANSFERS
                  : this.routePreference === 'LESS_WALKING' ? rp?.LESS_WALKING
                  : undefined;
      const tOpts: any = { modes };
      if (pref) tOpts.routingPreference = pref;
      if (this.timeType === 'DEPART_AT') {
        tOpts.departureTime = this.departureDateTime ? new Date(this.departureDateTime) : new Date();
      } else if (this.timeType === 'ARRIVE_BY') {
        tOpts.arrivalTime = this.departureDateTime ? new Date(this.departureDateTime) : new Date();
      }
      request.transitOptions = tOpts;
    }

    this.directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        if (this.trafficLayer) { this.trafficLayer.setMap(null); }
        this.directionsRenderer.setDirections(result);
        this.directionsRenderer.setRouteIndex(this.selectedRouteIndex);

        try {
          const routes = result?.routes || [];
          const active = routes[this.selectedRouteIndex] || routes[0];
          const leg = active?.legs?.[0];
          if (leg) {
            const durationInTraffic = leg.duration_in_traffic?.text || leg.duration?.text || '';
            const distanceText = leg.distance?.text || '';
            this.routeDistance = distanceText;
            this.routeDuration = durationInTraffic;
            this.routeDurationTraffic = durationInTraffic;
            this.routeDurationNormal = leg.duration?.text || '';
            const steps = Array.isArray(leg.steps) ? leg.steps : [];
            const segsSummary: { type: 'Metro'|'Tram'|'Light rail'; line: string; from: string; to: string }[] = [];
            steps.forEach((s: any) => {
              if (s.travel_mode === 'TRANSIT') {
                const td = s.transit || s.transit_details || s?.transitDetails || s?.transit_details;
                const vehicleType = td?.line?.vehicle?.type;
                const g = (window as any).google?.maps;
                const isSubway = vehicleType === 'SUBWAY' || vehicleType === g?.VehicleType?.SUBWAY;
                const isTram = vehicleType === 'TRAM' || vehicleType === g?.VehicleType?.TRAM;
                const isRail = vehicleType === 'RAIL' || vehicleType === g?.VehicleType?.RAIL;
                if (isSubway || isTram || isRail) {
                  const line = td?.line?.short_name || td?.line?.name || 'Metro';
                  const from = td?.departure_stop?.name || td?.departure_stop?.name || 'Start';
                  const to = td?.arrival_stop?.name || td?.arrival_stop?.name || 'Stop';
                  const type: 'Metro'|'Tram'|'Light rail' = isSubway ? 'Metro' : (isTram ? 'Tram' : 'Light rail');
                  segsSummary.push({ type, line, from, to });
                }
              }
            });
            if (segsSummary.length) {
              let parts: string[] = [];
              let partsHtml: string[] = [];
              const first = segsSummary[0];
              const cls0 = first.type === 'Metro' ? 'seg-metro' : (first.type === 'Tram' ? 'seg-tram' : 'seg-rail');
              parts.push(`${first.type} ${first.line} from ${first.from} to ${first.to}`);
              partsHtml.push(`<span class="seg ${cls0}">${first.type} ${first.line}</span> from ${first.from} to ${first.to}`);
              for (let i = 1; i < segsSummary.length; i++) {
                const seg = segsSummary[i];
                const cls = seg.type === 'Metro' ? 'seg-metro' : (seg.type === 'Tram' ? 'seg-tram' : 'seg-rail');
                parts.push(`change at ${seg.from} to ${seg.type} ${seg.line} to ${seg.to}`);
                partsHtml.push(`change at ${seg.from} to <span class="seg ${cls}">${seg.type} ${seg.line}</span> to ${seg.to}`);
              }
              parts.push('then walk to destination');
              partsHtml.push('then walk to destination');
              this.routeSummary = parts.join(', ');
              this.routeSummaryHtml = partsHtml.join(', ');
              this.routeSteps = [this.routeSummary];
            } else {
              this.routeSteps = steps.map((s: any) => s.instructions?.replace(/<[^>]*>/g, '')).filter(Boolean).slice(0, 6);
              this.routeSummaryHtml = '';
            }

            // Build alternatives list (up to 3)
            this.alternatives = routes.slice(0, 3).map((r: any, i: number) => {
              const l = r?.legs?.[0];
              const dist = l?.distance?.text || '';
              const dur = (l?.duration_in_traffic?.text || l?.duration?.text || '');
              const tsteps = Array.isArray(l?.steps) ? l.steps : [];
              const segs: string[] = [];
              tsteps.forEach((s: any) => {
                if (s.travel_mode === 'TRANSIT') {
                  const td = s.transit || s.transit_details || s?.transitDetails || s?.transit_details;
                  const vehicleType = td?.line?.vehicle?.type;
                  if (vehicleType === 'SUBWAY' || vehicleType === (window as any).google?.maps?.VehicleType?.SUBWAY) {
                    const line = td?.line?.short_name || td?.line?.name || 'Metro';
                    segs.push(`Metro ${line}`);
                  }
                }
              });
              const title = segs.length ? segs.join(' → ') : (this.travelMode === 'TRANSIT' ? 'Transit route' : 'Route');
              return { index: i, title, distance: dist, duration: dur };
            });
          }
        } catch {}
      } else {
        console.error('Directions request failed:', status);
      }
    });
  }

  selectAlternative(i: number) {
    this.selectedRouteIndex = i;
    try {
      this.directionsRenderer.setRouteIndex(i);
    } catch {}
    this.displayRoute();
  }

  onMapClick(location: any) {
    console.log('Map clicked at:', location.lat(), location.lng());
    
    // Determine which field to update based on current state
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ location: location }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        console.log('Geocoded address:', address);
        
        // If origin is empty, set it. Otherwise set destination
        if (!this.origin || this.origin.trim() === '') {
          this.origin = address;
          console.log('Set origin to:', address);
        } else if (!this.destination || this.destination.trim() === '') {
          this.destination = address;
          console.log('Set destination to:', address);
        } else {
          // Both filled, reset and set origin
          this.origin = address;
          this.destination = '';
          this.clearMarkers();
          console.log('Reset and set origin to:', address);
        }

        // Add marker
        const marker = new google.maps.Marker({
          position: location,
          map: this.map,
          title: address
        });
        this.markers.push(marker);
      } else {
        console.error('Geocoding failed:', status);
      }
    });
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  onOriginInput() {
    this.isSelectingOrigin = true;
  }

  onDestinationInput() {
    this.isSelectingDestination = true;
  }

  // When changing mode to TRANSIT, default to Metro-only for clarity
  onModeChange(mode: 'DRIVING'|'WALKING'|'BICYCLING'|'TRANSIT') {
    // cast due to removed bicycling in UI; still accept legacy type
    this.travelMode = (mode as any);
    if (mode === 'TRANSIT' && (!this.selectedTransitModes || this.selectedTransitModes.length === 0)) {
      this.selectedTransitModes = ['SUBWAY'];
    }
    // Keep overlay state user-controlled; hide when leaving Transit
    if (mode !== 'TRANSIT') {
      this.showOptionsOverlay = false;
    }
  }

  openOptions() { this.showOptionsOverlay = true; }
  closeOptions() { this.showOptionsOverlay = false; }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    this.sidebarService.toggle();
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
