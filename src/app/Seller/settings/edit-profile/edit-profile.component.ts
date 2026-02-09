

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SellerService, PublicProfile } from '../../seller.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  showUserMenu = false;
  profileImage: string | ArrayBuffer | null = null;
  editForm: FormGroup;
  sellerId!: number;
  loading = true;
  profile!: PublicProfile;
  previewImage: string | ArrayBuffer | null = null;
 states: any[] = []; // list of states
  cities: any[] = [];
  selectedStateId!: number;
selectedCityId!: number;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sellerService: SellerService
  ) {
    
this.editForm = this.fb.group({
  firstName: ['', Validators.required],
   lastName: [''],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', Validators.required],
  description: [''],
  address: [''],   // Street / Line 1
  line1: [''],     // optional Line 1
  line2: [''],     // optional Line 2
  landmark: [''],
  locality: [''],
  city: ['', Validators.required],
  state: ['', Validators.required],
  pincode: ['', Validators.required],
  website: [''],
  linkedin: ['']
});


  }


// ngOnInit(): void {
//   this.route.paramMap.subscribe(params => {
//     const id = params.get('id');
//     if (id) {
//       this.sellerId = +id;
//       this.loadProfile(this.sellerId);
//     } else {
//       this.loading = false;
//     }
//   });

//   // Load all states
//   this.sellerService.getStates().subscribe(states => {
//     this.states = states;
//   });
// }

// loadProfile(sellerId: number) {
//   this.loading = true;
//   this.sellerService.getPublicProfile(sellerId).subscribe({
//     next: (data) => {
//       this.profile = data;

//       // Patch form
//       const names = data.displayName?.split(' ') || [];
//       this.editForm.patchValue({
//         firstName: names[0] || '',
//         lastName: names.slice(1).join(' ') || '',
//         email: data.email || '',
//         phone: data.phone || '',
//         description: data.description || '',
//         line1: data.addressLine1 ?? '',
//         line2: data.addressLine2 ?? '',
//         landmark: data.landmark ?? '',
//         locality: data.locality ?? '',
//         pincode: data.pincode ?? '',
//       });

//       // Find state ID by name
//       const stateObj = this.states.find(s => s.name === data.state || s.name === data.state);
//       if (stateObj) {
//         this.selectedStateId = stateObj.id;
//         this.editForm.patchValue({ state: stateObj.id });

//         // Load cities for this state
//         this.loadCities(stateObj.id, data.addressCity ?? data.baseCity);
//       }

//       this.loading = false;
//     },
//     error: (err) => {
//       console.error('Failed to load profile', err);
//       this.loading = false;
//     }
//   });
// }

// loadCities(stateId: number, selectedCityName?: string) {
//   this.sellerService.getCitiess(stateId).subscribe(cities => {
//     this.cities = cities;

//     // Find city ID by name
//     if (selectedCityName) {
//       const cityObj = cities.find(c => c.name === selectedCityName);
//       if (cityObj) {
//         this.selectedCityId = cityObj.id;
//         this.editForm.patchValue({ city: cityObj.id });
//       }
//     }
//   });
// }

// ngOnInit(): void {
//   // 1️⃣ Load states first
//   this.sellerService.getStates().subscribe(states => {
//     this.states = states;

//     // 2️⃣ Load profile next
//     this.route.paramMap.subscribe(params => {
//       const id = params.get('id');
//       if (id) {
//         this.sellerId = +id;
//         this.loadProfile(this.sellerId);
//       } else {
//         this.loading = false;
//       }
//     });
//   });
// }

// loadProfile(sellerId: number) {
//   this.loading = true;

//   this.sellerService.getPublicProfile(sellerId).subscribe({
//     next: (data) => {
//       this.profile = data;

//       // Split names
//       const names = data.displayName?.split(' ') || [];
//       this.editForm.patchValue({
//         firstName: names[0] || '',
//         lastName: names.slice(1).join(' ') || '',
//         email: data.email || '',
//         phone: data.phone || '',
//         description: data.description || '',
//         line1: data.addressLine1 ?? '',
//         line2: data.addressLine2 ?? '',
//         landmark: data.landmark ?? '',
//         locality: data.locality ?? '',
//         pincode: data.pincode ?? '',
//         website: data.website ?? '',
//         linkedin: data.linkedin ?? ''
//       });

//       // 3️⃣ Find state by addressState OR baseState
//       const stateObj = this.states.find(s =>
//         s.name?.toLowerCase() === (data.addressState ?? data.state)?.toLowerCase()
//       );

//       if (stateObj) {
//         this.selectedStateId = stateObj.id;
//         this.editForm.patchValue({ state: stateObj.id });

//         // 4️⃣ Load cities for this state
//         this.loadCities(stateObj.id, data.addressCity ?? data.baseCity);
//       }

//       this.loading = false;
//     },
//     error: (err) => {
//       console.error('Failed to load profile', err);
//       this.loading = false;
//     }
//   });
// }

// loadCities(stateId: number, selectedCityName?: string) {
//   this.sellerService.getCitiess(stateId).subscribe(cities => {
//     this.cities = cities;

//     if (selectedCityName) {
//       const cityObj = cities.find(c => c.name?.toLowerCase() === selectedCityName?.toLowerCase());
//       if (cityObj) {
//         this.selectedCityId = cityObj.id;
//         // **Important:** set city AFTER cities array is loaded
//         this.editForm.patchValue({ city: cityObj.name });
//       }
//     }
//   });
// }

ngOnInit(): void {
  this.sellerService.getStates().subscribe(states => {
    this.states = states;

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.sellerId = +id;
        this.loadProfile(this.sellerId);
      }
    });
  });
}
loadProfile(sellerId: number) {
  this.sellerService.getPublicProfile(sellerId).subscribe(data => {
    this.profile = data;

    const names = data.displayName?.split(' ') || [];

    this.editForm.patchValue({
      firstName: names[0] || '',
      lastName: names.slice(1).join(' '),
      email: data.email,
      phone: data.phone,
      description: data.description,
      line1: data.addressLine1,
      line2: data.addressLine2,
      locality: data.locality,
      landmark: data.landmark,
      pincode: data.pincode,
      state: data.addressStateId   // ✅ ID
    });

    if (data.addressStateId) {
      this.loadCities(data.addressStateId, data.addressCityId);
    }
  });
}
loadCities(stateId: number, cityId?: number) {
  this.sellerService.getCitiess(stateId).subscribe(cities => {
    this.cities = cities;

    if (cityId) {
      this.editForm.patchValue({ city: cityId }); // ✅ ID
    }
  });
}


onStateChange(event: any) {
  const stateId = event.target.value;
  this.editForm.patchValue({ city: '' }); // reset city
  if (stateId) this.loadCities(stateId);
}





  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }


  onImageSelected(event: any) {
  const file = event.target.files?.[0];
  if (file) {
    // Show preview
    const reader = new FileReader();
    reader.onload = () => (this.previewImage = reader.result);
    reader.readAsDataURL(file);

    // Save file to send to backend
    this.selectedFile = file;
  }
}
selectedFile: File | null = null;



// onSubmit() {
//   if (this.editForm.invalid) return;

//   const form = this.editForm.value;

//   // Create FormData instead of payload object
//   const formData = new FormData();

//   formData.append('DisplayName', `${form.firstName} ${form.lastName}`.trim());
//   formData.append('Email', form.email);
//   formData.append('Phone', form.phone);
//   formData.append('Description', form.description);
//   formData.append('AddressLine1', form.address);
//   formData.append('City', form.city);
//   formData.append('State', form.state);
//   formData.append('Pincode', form.pincode);

//   // Add profile image if selected
//   if (this.selectedFile) {
//     formData.append('ProfilePicture', this.selectedFile);
//   }

//   // Send FormData to backend
//   this.sellerService.updateProfile(this.sellerId, formData).subscribe({
//     next: () => {
//       alert('Profile updated successfully!');
//       this.router.navigate(['/seller/settings']);
//     },
//     error: (err) => {
//       console.error('Update failed', err);
//       alert('Failed to update profile');
//     }
//   });
// }

// onSubmit() {
//   if (this.editForm.invalid) return;

//   const form = this.editForm.value;
//   const formData = new FormData();

//   formData.append('DisplayName', `${form.firstName} ${form.lastName}`.trim());
//   formData.append('Email', form.email);
//   formData.append('Phone', form.phone);
//   formData.append('Description', form.description);
//   formData.append('AddressLine1', form.line1);
//   formData.append('AddressLine2', form.line2);
//   formData.append('Locality', form.locality);
//   formData.append('Landmark', form.landmark);
//   //formData.append('Locality', form.locality);
//   formData.append('City', form.city);
//   formData.append('State', form.state);
//   formData.append('Pincode', form.pincode);
//   formData.append('Website', form.website);
//   formData.append('LinkedIn', form.linkedin);

//   if (this.selectedFile) formData.append('ProfilePicture', this.selectedFile);

//   this.sellerService.updateProfile(this.sellerId, formData).subscribe({
//     next: () => {
//       alert('Profile updated successfully!');
//       this.router.navigate(['/seller/settings']);
//     },
//     error: (err) => {
//       console.error('Update failed', err);
//       alert('Failed to update profile');
//     }
//   });
// }

onSubmit() {
  if (this.editForm.invalid) return;

  const form = this.editForm.value;
  const formData = new FormData();

  formData.append('DisplayName', `${form.firstName} ${form.lastName}`.trim());
  formData.append('Email', form.email);
  formData.append('Phone', form.phone);
  formData.append('Description', form.description || '');
  formData.append('AddressLine1', form.line1 || '');
  formData.append('AddressLine2', form.line2 || '');
  formData.append('Locality', form.locality || '');
  formData.append('Landmark', form.landmark || '');
  
  // send city/state as string, not ID
 // formData.append('City', this.cities.find(c => c.id == form.city)?.name || '');
 // formData.append('State', this.states.find(s => s.id == form.state)?.name || '');
  formData.append('City', form.city.toString());   // bigint
formData.append('State', form.state.toString()); // bigint

  formData.append('Pincode', form.pincode || '');
  if (this.selectedFile) formData.append('ProfilePicture', this.selectedFile);

  this.sellerService.updateProfile(this.sellerId, formData).subscribe({
    next: () => {
      alert('Profile updated successfully!');
      this.router.navigate(['/seller/settings']);
    },
    error: (err) => {
      console.error('Update failed', err);
      alert('Failed to update profile');
    }
  });
}


 getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  }
  cancel() {
    this.router.navigate(['/seller/settings']);
  }
}

