import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id?: string;
  name: string;
  isActive?: boolean;
  createdBy?: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {

  constructor(private http: HttpClient) {}

  addCategory(categoryData: { name: string }): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/categories/add`, categoryData, { withCredentials: true });
  }

  getAllCategories(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/categories/all`, { withCredentials: true });
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/categories/${categoryId}`, { withCredentials: true });
  }
}