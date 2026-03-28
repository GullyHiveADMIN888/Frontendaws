import { Component, OnInit,Output,  EventEmitter, } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SellerService, PublicProfile } from '../../business.service';
import { OTPVerificationWithoutIdComponent } from '../../../auth/otp-verification-without-id/otp-verification-without-id.component';
import { AuthService, SendOtpEmailWithoutUserIdRequest, VerifyOtpEmailWithoutUserIdRequest } from '../../../auth/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-edit-profile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.css'],
     standalone: true,
      imports: [CommonModule,
    ReactiveFormsModule,OTPVerificationWithoutIdComponent   
  ]
})

export class EditProfileComponent implements OnInit {
  editForm: FormGroup;
  sellerId!: number;
  profile!: PublicProfile;
  previewImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  states: any[] = [];
  cities: any[] = [];
  errors: any = {};
@Output() onVerified = new EventEmitter<string>();
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sellerService: SellerService
  ) {
    this.editForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      description: [''],
      line1: [''],
      line2: [''],
      locality: [''],
      landmark: [''],
      city: [''],
      state: [''],
      pincode: [''],
      website: [''],
      linkedin: [''],
        otp: ['']
    //  areaName: [''],
     // areaId: ['']
    });
  }

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
      this.editForm.get('phone')?.valueChanges.subscribe(value => {
    if (value !== this.originalPhone) {
      this.otpVerified = false;
    }
  });
  }

// loadProfile(sellerId: number) {
//   this.sellerService.getPublicProfile(sellerId).subscribe(data => {
//     this.profile = data;
//    console.log('sdsf', data)
//     const names = data.displayName?.split(' ') || [];

//     this.editForm.patchValue({
//       firstName: names[0] || '',
//       lastName: names.slice(1).join(' '),
//       email: data.email,
//       phone: data.phone,
//       description: data.description,
//       line1: data.addressLine1,
//       line2: data.addressLine2,
//       landmark: data.landmark,
//       pincode: data.pincode,
//       state: data.addressStateId
//     });

//     if (data.addressStateId) {
//       this.loadCities(data.addressStateId, data.addressCityId, data.areaId);
//     }
//   });
// }
loadProfile(sellerId: number) {
  this.sellerService.getPublicProfile(sellerId).subscribe(data => {
    this.profile = data;

    this.originalPhone = data.phone; // ✅ IMPORTANT

    const names = data.displayName?.split(' ') || [];

    this.editForm.patchValue({
      firstName: names[0] || '',
      lastName: names.slice(1).join(' '),
      email: data.email,
      phone: data.phone,
      description: data.description,
      line1: data.addressLine1,
      line2: data.addressLine2,
      landmark: data.landmark,
      pincode: data.pincode,
      state: data.addressStateId
    });

    if (data.addressStateId) {
      this.loadCities(data.addressStateId, data.addressCityId, data.areaId);
    }
  });
}
  loadCities(stateId: number, cityId?: number, areaId?: number) {
  this.sellerService.getCitiess(stateId).subscribe(cities => {
    this.cities = cities;

    if (cityId) {
      this.editForm.patchValue({ city: cityId });

      // Load areas AFTER city is patched
      this.sellerService.getAreasByCity(cityId).subscribe(areas => {
        this.areas = areas;

        if (areaId) {
          this.editForm.patchValue({ locality: areaId });  // ✅ correct
        }
      });
    }
  });
}


  onStateChange(event: any) {
    const stateId = event.target.value;
    this.editForm.patchValue({ city: '', locality: '' });
 // Clear dropdown data
  this.cities = [];
  this.areas = [];


    if (stateId) this.loadCities(stateId);
  }

  onImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG or PNG images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Max file size is 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => (this.previewImage = reader.result);
    reader.readAsDataURL(file);
    this.selectedFile = file;
  }

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  }

  cancel() {
    this.router.navigate(['/provider_User_Admin/settings']);
  }

  validateForm(): boolean {
    this.errors = {};
    const form = this.editForm.value;

    // First Name
    if (!form.firstName?.trim()) this.errors.firstName = 'First name is required';
    else if (form.firstName.length < 3) this.errors.firstName = 'First name must be at least 3 characters';
    else if (!/^[A-Za-z\u0900-\u097F\s]+$/.test(form.firstName)) this.errors.firstName = 'Invalid characters in first name';

    // Last Name (optional)
    if (form.lastName && !/^[A-Za-z\u0900-\u097F\s]+$/.test(form.lastName)) this.errors.lastName = 'Invalid characters in last name';

    // Email
    if (!form.email?.trim()) this.errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) this.errors.email = 'Enter a valid email';

    // Phone
    if (!form.phone?.trim()) this.errors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) this.errors.phone = 'Enter a valid 10-digit phone number';

    // Line 1
    if (!form.line1?.trim()) this.errors.line1 = 'Address Line 1 is required';

    // State & City
    if (!form.state) this.errors.state = 'State is required';
    if (!form.city) this.errors.city = 'City is required';

    // PIN Code
    if (!form.pincode?.trim()) this.errors.pincode = 'PIN Code is required';
    else if (!/^\d{6}$/.test(form.pincode)) this.errors.pincode = 'PIN Code must be 6 digits';

    // Website (optional)
    if (form.website && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*\/?$/.test(form.website)) this.errors.website = 'Enter a valid website URL';

    // LinkedIn (optional)
    if (form.linkedin && !/^https:\/\/(www\.)?linkedin\.com\/.*$/.test(form.linkedin)) this.errors.linkedin = 'Enter a valid LinkedIn URL';

    // Description
    if (!form.description?.trim()) this.errors.description = 'Description is required';
    else if (form.description.length < 150) this.errors.description = 'Minimum 150 characters required';
    else if (form.description.length > 2000) this.errors.description = 'Maximum 2000 characters allowed';

    return Object.keys(this.errors).length === 0;
  }

  onSubmit() {

      const phoneChanged = this.editForm.get('phone')?.value !== this.originalPhone;

  if (phoneChanged) {
    alert('Please verify your mobile number first');
    return;
  }

     if (!this.validateForm()) {
    //   alert('Please correct the errors in the form');
       return;
     }

    const form = this.editForm.value;
    const formData = new FormData();

    formData.append('DisplayName', `${form.firstName} ${form.lastName}`.trim());
    formData.append('Email', form.email);
    formData.append('Phone', form.phone);
    formData.append('Description', form.description);
    formData.append('AddressLine1', form.line1);
    formData.append('AddressLine2', form.line2 || '');
    //formData.append('Locality', form.locality || '');
    if (form.locality) {
  formData.append('AreaId', form.locality.toString());
}

    formData.append('Landmark', form.landmark || '');
    formData.append('City', form.city.toString());
    formData.append('State', form.state.toString());
    formData.append('Pincode', form.pincode);
    if (this.selectedFile) formData.append('ProfilePicture', this.selectedFile);
    if (form.website) formData.append('Website', form.website);
    if (form.linkedin) formData.append('LinkedIn', form.linkedin);

    this.sellerService.updateProfile(this.sellerId, formData).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.router.navigate(['/provider_User_Admin/settings']);
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('Failed to update profile');
      }
    });
  }


areas: any[] = [];

onCityChange(event: any) {
  const cityId = event.target.value;
  this.editForm.patchValue({ locality: '' });
    // Clear areas dropdown
  this.areas = [];

  if (cityId) {
    this.sellerService.getAreasByCity(cityId).subscribe(areas => {
      this.areas = areas;
    });
  }
}
//otp verification

originalPhone: string = '';
otpSent: boolean = false;
otpVerified: boolean = false;
otp: string = '';
showOtpModal: boolean = false;
otpPhone: string = '';
// showOtpModal: boolean = false;
// otpPhone: string = '';
otpSending: boolean = false;
otpVerifying: boolean = false;
async sendOtp() {
  const phone = this.editForm.get('phone')?.value;

  if (!/^\d{10}$/.test(phone)) {
    alert('Enter valid phone number');
    return;
  }

  try {
    debugger;
        this.otpPhone = phone;      // ✅ SET FIRST
    this.showOtpModal = true;   // ✅ THEN OPEN MODAL
    await this.authService.sendOtp(phone);

    this.otpPhone = phone;      // ✅ SET FIRST
    this.showOtpModal = true;   // ✅ THEN OPEN MODAL

  } catch (err) {
    alert('Failed to send OTP');
  }
}

verifyOtp() {
  this.otpVerified = true;
  this.originalPhone = this.editForm.get('phone')?.value;

  this.showOtpModal = false;

  alert('Mobile number verified successfully');
}
onSubmits() {
  const phoneChanged = this.editForm.get('phone')?.value !== this.originalPhone;

  if (phoneChanged && !this.otpVerified) {
    alert('Please verify your mobile number first');
    return;
  }

  // proceed API call
}
closeOtpModal() {
  this.showOtpModal = false;
}

}

