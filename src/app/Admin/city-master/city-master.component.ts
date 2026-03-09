import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CityService } from './services/city.service';
import { environment } from '../../../environments/environment.prod';
import { City, CreateCity, UpdateCity, State } from './models/city.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
    selector: 'app-city-master',
    templateUrl: './city-master.component.html',
    styleUrls: ['./city-master.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,          
        ReactiveFormsModule,   
        RouterModule,           
        HeaderComponent,
        FooterComponent
    ]
})
export class CityMasterComponent implements OnInit {
  // Data properties
  cities: City[] = [];
  filteredCities: City[] = [];
  states: State[] = [];

  // UI state properties
  loading: boolean = true;
  initialLoading = true;
  statesLoading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';

  // Modal properties
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentCity: City = this.getEmptyCity();
  modalLoading: boolean = false;

  // Stats properties
  totalCities: number = 0;
  activeCities: number = 0;
  tierXCount: number = 0;  // For Tier X count (tier = 0)
  tierYCount: number = 0;  // For Tier Y count (tier = 1)
  tierZCount: number = 0; // For Tier Z count (tier = 2)

  // Backend expects 0 for X, 1 for Y, 2 for Z
  tierOptions = [
    { value: 0, label: 'Tier X' },  // 0 = X
    { value: 1, label: 'Tier Y' },  // 1 = Y
    { value: 2, label: 'Tier Z' }   // 2 = Z
  ];

  // Country options
  countryOptions = [
    'India',
    'USA',
    'UK'
  ];

  // API endpoints
  private apiUrl = `${environment.apiBaseUrl}/admin`;

  constructor(
    private http: HttpClient,
    private cityService: CityService
  ) { }

  ngOnInit(): void {
    this.fetchStatesAndCities();
  }

  fetchStatesAndCities(): void {
    this.loading = true;
    this.statesLoading = true;
    this.error = null;

    this.cityService.getStates().subscribe({
      next: (states) => {
        this.states = states.filter(state => state.isActive);
        this.statesLoading = false;
        this.fetchCities();
      },
      error: (err) => {
        console.error('Error fetching states:', err);
        this.states = [];
        this.statesLoading = false;
        this.fetchCities();
      }
    });
  }

  // Get empty city template - FIXED: tier should be 0 for X
  getEmptyCity(): City {
    return {
      id: 0,
      name: '',
      state: 0,
      country: 'India',
      tier: 0, // FIXED: Changed from 1 to 0 (Tier X)
      centerLat: 0,
      centerLong: 0,
      isActive: true,
      updating: false,
      deleting: false
    };
  }

  // Modal Methods
  openAddModal(): void {
    this.isEditMode = false;
    this.currentCity = this.getEmptyCity();
    
    if (this.states.length > 0) {
      this.currentCity.state = this.states[0].id;
    }
    
    this.showModal = true;
  }

  editCity(city: City): void {
    this.isEditMode = true;
    this.currentCity = { 
      ...city,
      updating: false,
      deleting: false 
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCity = this.getEmptyCity();
    this.modalLoading = false;
  }

  saveCity(): void {
    if (this.isEditMode) {
      this.updateCity();
    } else {
      this.createCity();
    }
  }

  createCity(): void {
    if (!this.currentCity.name.trim()) {
      alert('City name is required!');
      return;
    }

    if (!this.currentCity.state) {
      alert('Please select a state!');
      return;
    }

    if (!this.currentCity.country.trim()) {
      alert('Country is required!');
      return;
    }

    // currentCity.tier should already be 0, 1, or 2
    const createData: CreateCity = {
      name: this.currentCity.name,
      state: Number(this.currentCity.state),
      country: this.currentCity.country,
      tier: Number(this.currentCity.tier), // This is number 0, 1, or 2
      centerLat: this.currentCity.centerLat,
      centerLong: this.currentCity.centerLong
    };

    console.log('DEBUG createCity: Sending tier as', createData.tier, 'type:', typeof createData.tier);

    this.modalLoading = true;

    this.cityService.createCity(createData).subscribe({
      next: () => {
        this.fetchCities();
        this.closeModal();
        alert('City created successfully!');
      },
      error: (err) => {
        this.modalLoading = false;
        console.error('Error creating city:', err);
        alert('Failed to create city. Please try again.');
      }
    });
  }

  updateCity(): void {
    if (!this.currentCity.name.trim()) {
      alert('City name is required!');
      return;
    }

    if (!this.currentCity.state) {
      alert('Please select a state!');
      return;
    }

    if (!this.currentCity.country.trim()) {
      alert('Country is required!');
      return;
    }

    // currentCity.tier should already be 0, 1, or 2
    const updateData: UpdateCity = {
      name: this.currentCity.name,
      state: Number(this.currentCity.state),
      country: this.currentCity.country,
      tier: Number(this.currentCity.tier), // This is number 0, 1, or 2
      centerLat: this.currentCity.centerLat,
      centerLong: this.currentCity.centerLong,
      isActive: this.currentCity.isActive
    };

    console.log('DEBUG updateCity: Sending tier as', updateData.tier, 'type:', typeof updateData.tier);

    this.modalLoading = true;

    this.cityService.updateCity(this.currentCity.id, updateData).subscribe({
      next: () => {
        this.fetchCities();
        this.closeModal();
        alert('City updated successfully!');
      },
      error: (err) => {
        this.modalLoading = false;
        console.error('Error updating city:', err);
        alert('Failed to update city. Please try again.');
      }
    });
  }

  // Fetch cities from server
  fetchCities(): void {
    this.loading = true;
    this.error = null;

    this.cityService.getCities().subscribe({
      next: (data) => {
        console.log('DEBUG: Raw data from API:', data);
        
        this.cities = data.map(city => {
          console.log(`DEBUG: City ${city.name} - raw tier: ${city.tier} (type: ${typeof city.tier})`);
          
          // Make sure tier is a number
          let tierNum = city.tier;
          if (typeof tierNum === 'string') {
            // Convert string to number if needed
            switch (tierNum) {
              case 'X': tierNum = 0; break;
              case 'Y': tierNum = 1; break;
              case 'Z': tierNum = 2; break;
              default: tierNum = parseInt(tierNum, 10) || 0;
            }
          }
          
          return {
            ...city,
            tier: tierNum,
            updating: false,
            deleting: false
          };
        });
        
        this.filteredCities = [...this.cities];
        this.calculateStats();
        this.loading = false;
        this.initialLoading = false;

      },
      error: (err) => {
        this.error = 'Failed to load cities. Please try again.';
        this.loading = false;
        this.initialLoading = false;
        console.error('Error fetching cities:', err);
      }
    });
  }

  calculateStats(): void {
    this.totalCities = this.cities.length;
    this.activeCities = this.cities.filter(c => c.isActive).length;
    this.tierXCount = this.cities.filter(c => c.tier === 0).length; // Tier X
    this.tierYCount = this.cities.filter(c => c.tier === 1).length; // Tier Y
    this.tierZCount = this.cities.filter(c => c.tier === 2).length; // Tier Z
  }

  filterCities(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCities = [...this.cities];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCities = this.cities.filter(city =>
      city.name.toLowerCase().includes(term) ||
      this.getStateName(city.state).toLowerCase().includes(term) ||
      city.country.toLowerCase().includes(term)
    );
  }

  refreshData(): void {
    this.fetchStatesAndCities();
    this.searchTerm = '';
  }

  toggleActive(city: City): void {
    const newStatus = !city.isActive;
    city.updating = true;

    const updateData: UpdateCity = {
      name: city.name,
      state: Number(city.state),
      country: city.country,
      tier: Number(city.tier), // This should be number 0, 1, or 2
      centerLat: city.centerLat,
      centerLong: city.centerLong,
      isActive: newStatus
    };

    console.log('DEBUG toggleActive: Sending tier as', updateData.tier, 'type:', typeof updateData.tier);

    this.cityService.updateCity(city.id, updateData).subscribe({
      next: () => {
        city.isActive = newStatus;
        city.updating = false;
        this.calculateStats();
      },
      error: (err) => {
        city.updating = false;
        console.error('Error updating city status:', err);
        alert('Failed to update city status');
      }
    });
  }

  confirmDelete(city: City): void {
    if (confirm(`Are you sure you want to delete "${city.name}"? This action cannot be undone.`)) {
      this.deleteCity(city);
    }
  }

  deleteCity(city: City): void {
    city.deleting = true;

    this.cityService.deleteCity(city.id).subscribe({
      next: () => {
        this.cities = this.cities.filter(c => c.id !== city.id);
        this.filteredCities = this.filteredCities.filter(c => c.id !== city.id);
        this.calculateStats();
      },
      error: (err) => {
        city.deleting = false;
        console.error('Error deleting city:', err);
        alert('Failed to delete city');
      }
    });
  }

  getStateName(stateId: number): string {
    if (!stateId) return 'No State';
    
    const state = this.states.find(s => s.id === stateId);
    return state ? state.name : `State ${stateId}`;
  }

  // Get tier label for display (e.g., "Tier X")
  getTierLabel(tier: number): string {
    const tierOption = this.tierOptions.find(t => t.value === tier);
    return tierOption ? tierOption.label : `Tier ${tier}`;
  }

  // Get tier character for display (e.g., "X", "Y", "Z")
  getTierCharacter(tier: number): string {
    switch (tier) {
      case 0: return 'X';
      case 1: return 'Y';
      case 2: return 'Z';
      default: return 'X';
    }
  }

  // Get tier color
  getTierColor(tier: number): string {
    switch (tier) {
      case 0: return 'bg-gray-100 text-gray-800'; // Tier X
      case 1: return 'bg-blue-100 text-blue-800'; // Tier Y
      case 2: return 'bg-green-100 text-green-800'; // Tier Z
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getCoordinatesText(city: City): string {
    if (city.centerLat === 0 && city.centerLong === 0) {
      return 'Not Set';
    }
    return `${city.centerLat.toFixed(4)}, ${city.centerLong.toFixed(4)}`;
  }
}