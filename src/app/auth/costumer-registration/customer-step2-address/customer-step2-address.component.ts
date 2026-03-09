import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerAuthService } from '../services/customer-auth.service';

@Component({
    selector: 'app-customer-step2-address',
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-step2-address.component.html'
})
export class CustomerStep2AddressComponent implements OnInit, OnChanges {
  @Input() formData: any;
  @Input() errors: any;
  @Output() inputChange = new EventEmitter<{ field: string; value: any }>();
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  states: any[] = [];
  cities: any[] = [];
  areas: any[] = [];

  // Field touched state
  touchedFields: Set<string> = new Set();

  // Validation state
  addressValidationErrors: any = {};

  // Computed properties
  get hasAddressErrors(): boolean {
    return Object.keys(this.addressValidationErrors).length > 0;
  }

  get errorList(): string[] {
    return Object.values(this.addressValidationErrors);
  }

  constructor(private customerAuthService: CustomerAuthService) { }

  ngOnInit() {
    this.loadStates();

    if (!this.formData) {
      this.formData = {};
    }

    // Ensure stateId is null by default
    if (this.formData.stateId === undefined) {
      this.formData.stateId = null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData']) {
      // Reload cities if state exists
      if (this.formData?.stateId) {
        this.formData.stateId = Number(this.formData.stateId);
        this.loadCities(this.formData.stateId);
      }

      // Reload areas if city exists
      if (this.formData?.cityId) {
        this.formData.cityId = Number(this.formData.cityId);
        this.loadAreas(this.formData.cityId);
      }
    }
  }

  loadStates() {
    this.customerAuthService.getStates().subscribe({
      next: (states) => this.states = states,
      error: (err) => console.error('Failed to load states:', err)
    });
  }

  onStateChange(stateId: number) {
    this.formData.stateId = stateId;
    this.touchedFields.add('stateId');
    this.onInput('stateId', stateId);
    this.validateField('stateId', stateId);

    // Reset dependent fields
    this.formData.cityId = null;
    this.formData.areaId = null;
    this.cities = [];
    this.areas = [];

    if (stateId) {
      this.loadCities(stateId);
    }
  }

  loadCities(stateId: number) {
    this.customerAuthService.getCities(stateId).subscribe({
      next: (cities) => this.cities = cities,
      error: (err) => console.error('Failed to load cities:', err)
    });
  }

  onCityChange(cityId: number) {
    this.formData.cityId = cityId;
    this.touchedFields.add('cityId');
    this.onInput('cityId', cityId);
    this.validateField('cityId', cityId);

    // Reset area
    this.formData.areaId = null;
    this.areas = [];

    if (cityId) {
      this.loadAreas(cityId);
    }
  }

  loadAreas(cityId: number) {
    this.customerAuthService.getAreasByCity(cityId).subscribe({
      next: (areas) => this.areas = areas,
      error: (err) => console.error('Failed to load areas:', err)
    });
  }

  onInput(field: string, value: any) {
    this.formData[field] = value;
    this.inputChange.emit({ field, value });
  }

  onBlur(field: string) {
    this.touchedFields.add(field);
    this.validateField(field, this.formData[field]);
  }

  validateField(field: string, value: any): boolean {
    switch (field) {
      case 'stateId':
        if (value && !this.isValidState(value)) {
          this.addressValidationErrors[field] = 'Please select a valid state';
          return false;
        }
        delete this.addressValidationErrors[field];
        return true;

      case 'cityId':
        if (value && !this.isValidCity(value)) {
          this.addressValidationErrors[field] = 'Please select a valid city';
          return false;
        }
        delete this.addressValidationErrors[field];
        return true;

      case 'areaId':
        if (value && !this.isValidArea(value)) {
          this.addressValidationErrors[field] = 'Please select a valid locality';
          return false;
        }
        delete this.addressValidationErrors[field];
        return true;

      case 'addressLine1':
        if (value && value.length > 100) {
          this.addressValidationErrors[field] = 'Address line 1 cannot exceed 100 characters';
          return false;
        }
        if (value && !/^[a-zA-Z0-9\s\/\-,.#]+$/.test(value)) {
          this.addressValidationErrors[field] = 'Address contains invalid characters';
          return false;
        }
        delete this.addressValidationErrors[field];
        return true;

      case 'addressLine2':
        if (value && value.length > 100) {
          this.addressValidationErrors[field] = 'Address line 2 cannot exceed 100 characters';
          return false;
        }
        if (value && !/^[a-zA-Z0-9\s\/\-,.#]*$/.test(value)) {
          this.addressValidationErrors[field] = 'Address contains invalid characters';
          return false;
        }
        delete this.addressValidationErrors[field];
        return true;

      case 'landmark':
        if (value && value.length > 50) {
          this.addressValidationErrors[field] = 'Landmark cannot exceed 50 characters';
          return false;
        }
        if (value && !/^[a-zA-Z0-9\s\/\-,.#]*$/.test(value)) {
          this.addressValidationErrors[field] = 'Landmark contains invalid characters';
          return false;
        }
        delete this.addressValidationErrors[field];
        return true;

      case 'pinCode':
        if (value && !this.isValidPinCode(value)) {
          this.addressValidationErrors[field] = 'PIN code must be exactly 6 digits';
          return false;
        }
        if (value && value.length !== 6) {
          this.addressValidationErrors[field] = 'PIN code must be 6 digits';
          return false;
        }
        delete this.addressValidationErrors[field];
        return true;

      default:
        return true;
    }
  }

  isValidState(stateId: number): boolean {
    return this.states.some(s => s.id === stateId);
  }

  isValidCity(cityId: number): boolean {
    return this.cities.some(c => c.id === cityId);
  }

  isValidArea(areaId: number): boolean {
    return this.areas.some(a => a.id === areaId);
  }

  isValidPinCode(pinCode: string): boolean {
    return /^\d{6}$/.test(pinCode);
  }

  onPinCodeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = value;
    this.onInput('pinCode', value);
    this.validateField('pinCode', value);
  }

  getFieldClass(field: string): string {
    if (!this.touchedFields.has(field)) return 'border-gray-300';
    return this.addressValidationErrors[field] ? 'border-red-500' : 'border-green-500';
  }

  validateAllFields(): boolean {
    // Validate all address fields that have values
    const fields = ['stateId', 'cityId', 'areaId', 'addressLine1', 'addressLine2', 'landmark', 'pinCode'];
    let isValid = true;

    fields.forEach(field => {
      if (this.formData[field]) {
        this.touchedFields.add(field);
        if (!this.validateField(field, this.formData[field])) {
          isValid = false;
        }
      }
    });

    // Cross-field validations
    if (this.formData.addressLine1 && !this.formData.areaId) {
      this.addressValidationErrors['areaId'] = 'Please select locality if you provide address';
      isValid = false;
    }

    if (this.formData.cityId && !this.formData.stateId) {
      this.addressValidationErrors['stateId'] = 'Please select state first';
      isValid = false;
    }

    return isValid;
  }

  onNext() {
    if (this.validateAllFields()) {
      this.next.emit();
    } else {
      // Scroll to first error
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
}