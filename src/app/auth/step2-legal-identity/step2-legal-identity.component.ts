import { Component, Input, Output, EventEmitter, OnInit , Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { PLATFORM_ID } from '@angular/core';

// from data not reset when back 
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-step2-legal-identity',
  standalone: true,
  imports: [CommonModule],
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

  registrationTypes = ['GST Registration','Aadhar Card','E-Shram Card','PAN Card'];
  role = ['Admin','Seller','Buyer'];

  states: any[] = [];
  cities: any[] = [];

  // constructor(private http: HttpClient) {}
  constructor(private authService: AuthService,  @Inject(PLATFORM_ID) private platformId: Object) {}




  handleFileChange(field: 'registrationDocument' | 'addressProof', event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    this.onInput(field, file);

    if (!file) {
      field === 'registrationDocument'
        ? this.regDocPreview = ''
        : this.addressProofPreview = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      field === 'registrationDocument'
        ? this.regDocPreview = reader.result as string
        : this.addressProofPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

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

  // if state changed, reset city and load cities
  if (field === 'stateId') {
    this.onInput('cityId', null);
    const state = this.states.find(s => s.id === +value);
    if (state) this.loadCities(state.id);
  }
}


loadCities(stateId: number) {
  this.authService.getCities(stateId).subscribe(cities => {
    this.cities = cities;
  });
}

// from data not reset when back
ngOnChanges(changes: SimpleChanges) {
  if (changes['formData']) {
    // Reload cities if stateId exists
    if (this.formData.stateId) {
      this.loadCities(this.formData.stateId);
    }

    // Load file previews
    if (this.formData.registrationDocument) {
      const reader = new FileReader();
      reader.onload = () => this.regDocPreview = reader.result as string;
      reader.readAsDataURL(this.formData.registrationDocument);
    }

    if (this.formData.addressProof) {
      const reader = new FileReader();
      reader.onload = () => this.addressProofPreview = reader.result as string;
      reader.readAsDataURL(this.formData.addressProof);
    }
  }
}


}

