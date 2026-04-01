import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment.prod';
// import { environment } from '../../environments/environment';




@Injectable({
  providedIn: 'root'
})
export class BusinessUserService {
  private apiUrl = `${environment.apiBaseUrl}/provider_Ops_Manager`;

  // BehaviorSubject will store sellerId and emit it to subscribers
  private sellerIdSubject = new BehaviorSubject<number | null>(null);
  sellerId$ = this.sellerIdSubject.asObservable(); // Observable for components

  constructor(private http: HttpClient) { }

  // --- Auth Headers ---
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }







}