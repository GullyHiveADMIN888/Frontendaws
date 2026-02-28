import { Component, Input, Output, EventEmitter, OnInit , Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
// from data not reset when back 
import { SimpleChanges } from '@angular/core';
import {  HostListener } from '@angular/core';


@Component({
  selector: 'app-step2-legal-identity',
  standalone: true,
  imports: [CommonModule,  FormsModule ],
  templateUrl: './step2-legal-identity.component.html'
})
export class Step2LegalIdentityComponent implements OnInit {
  @Input() errors: any;
  @Input() formData: any;

  @Output() inputChange = new EventEmitter<{ field: string; value: string | File | null }>();
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  regDocPreview = '';
  addressProofPreview = '';

  registrationTypes = ['GST Registration','Aadhar Card','E-Shram Card','PAN Card','Udyam Registration'];
 // role = ['Admin','Seller','Buyer'];

  states: any[] = [];
  cities: any[] = [];

  // constructor(private http: HttpClient) {}
  constructor(private authService: AuthService,  @Inject(PLATFORM_ID) private platformId: Object) {}


 ngOnInit() {
  this.authService.getStates().subscribe(states => {
    this.states = states;
    if (this.formData.stateId) {
      this.loadCities(this.formData.stateId);
    }
  });
}


onInput(field: string, value: any) {
  if (field === 'stateId' || field === 'cityId') {
    this.formData[field] = value ? Number(value) : null; // always save as number
  } else {
    this.formData[field] = value;
  }
  this.inputChange.emit({ field, value });
  // Validate registration number if changed
  if (field === 'registrationNumber' || field === 'registrationType') {
    this.validateIdentityNumber();
  }

  // if state changed, reset city and load cities
  if (field === 'stateId') {
    this.onInput('cityId', null);
    const state = this.states.find(s => s.id === +value);
    if (state) this.loadCities(state.id);
  }
}
onStateChange(stateId: any) {

  this.formData.stateId = +stateId;   // ensure number

  this.onInput('stateId', +stateId);  // if you need parent emit
  // Reset dependent fields
    this.formData.cityId = null;
    this.formData.areaId = null;
    this.areas = [];
    this.dropdownOpen = false;
 this.formData.selectedAreaIds = [];
  this.loadCities(+stateId);          // 🔥 THIS loads cities
}

loadCities(stateId: number) {
  this.authService.getCities(stateId).subscribe(cities => {

    this.cities = cities;

    // 🔥 Ensure cityId matches type of city.id
    if (this.formData.cityId) {
      this.formData.cityId = Number(this.formData.cityId);
    }

  });
}


// from data not reset when back

ngOnChanges(changes: SimpleChanges) {
  if (changes['formData']) {

    // 🔹 Reload cities if stateId exists
    if (this.formData.stateId) {
      this.formData.stateId = Number(this.formData.stateId);
      this.formData.cityId = this.formData.cityId ? Number(this.formData.cityId) : null;
      this.loadCities(this.formData.stateId);
    }
     // 🔹 Reload areas if cityId exists
    if (this.formData.cityId) {
      this.formData.cityId = Number(this.formData.cityId);
      this.loadAreas(this.formData.cityId); // new method
    }

    // 🔹 Initialize registration document preview
    this.regDocPreview = '';
    if (this.formData.registrationDocument) {
      const file = this.formData.registrationDocument;

      if (file instanceof File && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => this.regDocPreview = reader.result as string;
        reader.readAsDataURL(file);
      } else if (file instanceof File) {
        // PDF/DOC → show file name
        this.regDocPreview = file.name;
      } else if (typeof file === 'string') {
        // Already saved as filename string
        this.regDocPreview = file;
      }
    }

    // 🔹 Initialize address proof preview
    this.addressProofPreview = '';
    if (this.formData.addressProof) {
      const file = this.formData.addressProof;

      if (file instanceof File && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => this.addressProofPreview = reader.result as string;
        reader.readAsDataURL(file);
      } else if (file instanceof File) {
        // PDF/DOC → show file name
        this.addressProofPreview = file.name;
      } else if (typeof file === 'string') {
        this.addressProofPreview = file;
      }
    }
  }
}

loadAreas(cityId: number) {
  this.authService.getAreasByCity(cityId).subscribe((res: { id: number; area_name: string }[]) => {
    this.areas = res;

    // Ensure selected areaId exists in areas
    if (this.formData.areaId) {
      const exists = this.areas.find(a => a.id === this.formData.areaId);
      if (!exists) {
        this.formData.areaId = null;
      }
    }

    // Ensure selected service areas exist
    if (this.formData.selectedAreaIds && this.formData.selectedAreaIds.length) {
      this.formData.selectedAreaIds = this.formData.selectedAreaIds.filter((id: number) =>
        this.areas.some(a => a.id === id)
      );
    }
  });
}



handleFileChange(field: 'registrationDocument' | 'addressProof', event: Event) {

  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] || null;

  if (!file) {
    this.onInput(field, null);
    if (field === 'registrationDocument') this.regDocPreview = '';
    else this.addressProofPreview = '';
    return;
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  const maxSize = 5 * 1024 * 1024; // 5MB

  // ❌ File type validation
  if (!allowedTypes.includes(file.type)) {
    this.errors[field] = 'Only PDF, DOC/DOCX, JPG, and PNG files are allowed.';
    input.value = '';
    this.onInput(field, null);
    if (field === 'registrationDocument') this.regDocPreview = '';
    else this.addressProofPreview = '';
    return;
  }

  // ❌ File size validation
  if (file.size > maxSize) {
    this.errors[field] = 'File size must be less than 5MB.';
    input.value = '';
    this.onInput(field, null);
    if (field === 'registrationDocument') this.regDocPreview = '';
    else this.addressProofPreview = '';
    return;
  }

  // ✅ Clear previous error
  if (this.errors[field]) delete this.errors[field];

  // ✅ Save file
  this.onInput(field, file);

  // ✅ Preview logic
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = () => {
      if (field === 'registrationDocument') this.regDocPreview = reader.result as string;
      else this.addressProofPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    // For PDF/DOC → show file name
    if (field === 'registrationDocument') this.regDocPreview = file.name;
    else this.addressProofPreview = file.name;
  }
}

onPinCodeInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const numericValue = input.value.replace(/\D/g, '');
  this.onInput('pinCode', numericValue);
  input.value = numericValue; // optional: updates the input in real-time
}


areas: any[] = []; // areas for selected city (locality dropdown)

onCityChange(cityId: number) {
  this.formData.cityId = +cityId;
  this.onInput('cityId', +cityId); // emit to parent if needed

  // Reset selected area
  this.formData.localityId = null;
     this.areas = [];
     this.formData.areaId = null;
      this.formData.selectedAreaIds = [];
    this.dropdownOpen = false;

  if (cityId) {
    this.authService.getAreasByCity(cityId).subscribe((res: any) => {
      this.areas = res; // bind to dropdown
    });
  }

  // Optional: clear service areas if city changed
  this.formData.serviceAreas = [];
}


dropdownOpen = false;

isSelected(id: number): boolean {
  return this.formData.selectedAreaIds?.includes(id);
}

onAreaChange(event: any, id: number) {
  if (!this.formData.selectedAreaIds) {
    this.formData.selectedAreaIds = [];
  }

  if (event.target.checked) {
    this.formData.selectedAreaIds.push(id);
  } else {
    this.formData.selectedAreaIds =
      this.formData.selectedAreaIds.filter((x: number) => x !== id);
  }
}

getSelectedAreaNames(): string {
  if (!this.formData.selectedAreaIds || this.formData.selectedAreaIds.length === 0) {
    return '';
  }

  return this.areas
    .filter(a => this.formData.selectedAreaIds.includes(a.id))
    .map(a => a.area_name)
    .join(', ');
}
searchText: string = '';

filteredAreas() {
  if (!this.searchText) {
    return this.areas;
  }

  return this.areas.filter(area =>
    area.area_name.toLowerCase().includes(this.searchText.toLowerCase())
  );
}
toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;

  if (this.dropdownOpen) {
    this.searchText = '';
  }
}
@HostListener('document:click', ['$event'])
clickOutside(event: Event) {
  const clickedInside = (event.target as HTMLElement)
    .closest('.relative');

  if (!clickedInside) {
    this.dropdownOpen = false;
  }
}


validateIdentityNumber() {
  const type = this.formData.registrationType;
  const value = this.formData.registrationNumber?.trim() || '';
  
  // Clear previous error
  if (this.errors.registrationNumber) delete this.errors.registrationNumber;

  if (!type) {
    this.errors.registrationNumber = 'Please select Identity Type first.';
    return false;
  }

  switch(type) {
    case 'Aadhar Card':
      if (!/^\d{12}$/.test(value)) {
        this.errors.registrationNumber = 'Aadhaar number must be 12 digits.';
        return false;
      }
      break;

    case 'PAN Card':
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value)) {
        this.errors.registrationNumber = 'PAN must be 10 characters (e.g., ABCDE1234F).';
        return false;
      }
      break;

    case 'E-Shram Card':
      if (!/^\d{15}$/.test(value)) {
        this.errors.registrationNumber = 'E-Shram number must be 15 digits.';
        return false;
      }
      break;

    case 'GST Registration':
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(value)) {
        this.errors.registrationNumber = 'Invalid GST number format.';
        return false;
      }
      break;

    case 'Udyam Registration':
      if (!/^\d{12}$/.test(value)) {
        this.errors.registrationNumber = 'Udyam number must be 12 digits.';
        return false;
      }
      break;

    default:
      break;
  }

  return true;
}


validateStep3(): boolean {

  this.errors = {};

  if (!this.formData.businessName?.length) {
    this.errors.businessName = 'Business name required';
  }

  if (!this.formData.registrationType?.length) {
    this.errors.registrationType = 'Select registration type';
  }

  if (!this.formData.registrationNumber?.length) {
    this.errors.registrationNumber = 'Registration number required';
  } else if (!this.validateIdentityNumber()) {
    // validateIdentityNumber will set error itself
  }

  if (!this.formData.registrationDocument) {
    this.errors.registrationDocument = 'Upload registration document';
  }

  if (!this.formData.addressProof) {
    this.errors.addressProof = 'Upload address proof';
  }

  if (!this.formData.line1?.trim()) {
    this.errors.line1 = 'Line 1 is required';
  }

  if (!this.formData.stateId) {
    this.errors.stateId = 'Select state';
  }

  if (!this.formData.cityId) {
    this.errors.city = 'Select city';
  }

  if (!this.formData.pinCode?.trim()) {
    this.errors.pinCode = 'PIN Code is required';
  } 
  else if (!/^\d{6}$/.test(this.formData.pinCode)) {
    this.errors.pinCode = 'PIN Code must be exactly 6 digits';
  }

  if (!this.formData.selectedAreaIds || this.formData.selectedAreaIds.length === 0) {
    this.errors.selectedAreaIds = 'Select at least one service area';
  }

  return Object.keys(this.errors).length === 0;
}

onNextClick() {

  if (!this.validateStep3()) {
    this.scrollToFirstError();
    return;
  }

  this.next.emit();
}
scrollToFirstError() {
  setTimeout(() => {
    const firstError = document.querySelector('.text-red-500');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

}

