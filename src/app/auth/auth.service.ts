import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
 // import { environment } from '../../environments/environment';
import { environment } from '../../environments/environment.prod';
@Injectable({ providedIn: 'root' })



export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      username,
      password
    });
  }

  // Register
  //   register(data: any) {
  //   return this.http.post(`${this.apiUrl}/register`, data);
  // }



// //export class RegistrationService 
//   submitRegistration(formData: any): Observable<any> {
//     const data = new FormData();

//     // Step 1: Basic info
//     if (formData.profilePicture) data.append('ProfilePicture', formData.profilePicture);
//     data.append('FullName', formData.fullName || '');
//     data.append('Email', formData.email || '');
//     data.append('Mobile', formData.mobile || '');
//     data.append('CoverageArea', formData.coverageArea || '');
//     data.append('ProfessionalType', formData.professionalType || '');
//     // if (formData.serviceCategory?.length) {
//     //   data.append('ServiceCategory', JSON.stringify(formData.serviceCategory));
//     // }
// if (formData.serviceCategory?.length) {
//   formData.serviceCategory.forEach((cat: string) => {
//     data.append('ServiceCategory', cat);
//   });
// }

//     // Step 2: Business info
//     data.append('BusinessName', formData.businessName || '');
//     data.append('RegistrationType', formData.registrationType || '');
//     data.append('RegistrationNumber', formData.registrationNumber || '');
//     if (formData.registrationDocument) data.append('RegistrationDocument', formData.registrationDocument);
//     if (formData.addressProof) data.append('AddressProof', formData.addressProof);
//     data.append('BusinessAddress', formData.businessAddress || '');
//     data.append('State', formData.state || '');
//      data.append('City', formData.city || '');
//     data.append('PinCode', formData.pinCode || '');

//     // Step 3: Professional details
//     data.append('SelfOverview', formData.selfOverview || '');
//     data.append('SkillsBackground', formData.skillsBackground || '');
//     if (formData.achievements) data.append('Achievements', formData.achievements);

//     return this.http.post(`${this.apiUrl}/register`, data);
 
//   }
submitRegistration(formData: FormData) {
  return this.http.post(`${this.apiUrl}/register`, formData);
  // DO NOT set Content-Type: let Angular handle multipart/form-data
}






  saveAuth(token: string, role: string, name?: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (name) localStorage.setItem('name', name);
  }

  redirectByRole(role: string) {
    const routes: Record<string, string> = {
      Admin: '/admin',
      SuperAdmin: '/admin',
      Buyer: '/buyer',
      Seller: '/seller'
    };

    this.router.navigate([routes[role] ?? '/login']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getRole() {
    return localStorage.getItem('role');
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
  // Service Categories APIs
getParentCategories(): Observable<any[]> {
  return this.http.get<any[]>(
     `${this.apiUrl}/parents`,
  );
}
 //`${environment.apiBaseUrl}/parents`
getSubCategories(parentId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/${parentId}/children`
  );
}

// AuthService.ts
getStates(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/states`);
}

getCities(stateId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/cities/${stateId}`);
}



}

