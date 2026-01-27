// src/app/features/admin/city-master/services/city.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { City, CreateCity, UpdateCity, State } from '../models/city.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = `${environment.apiBaseUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Cities endpoints
  getCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiUrl}/cities`);
  }

  getCity(id: number): Observable<City> {
    return this.http.get<City>(`${this.apiUrl}/cities/${id}`);
  }

  createCity(city: CreateCity): Observable<City> {
    return this.http.post<City>(`${this.apiUrl}/cities`, city);
  }

  updateCity(id: number, city: UpdateCity): Observable<City> {
    return this.http.put<City>(`${this.apiUrl}/cities/${id}`, city);
  }

  deleteCity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cities/${id}`);
  }

  // States endpoints
  getStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiUrl}/states`);
  }
}