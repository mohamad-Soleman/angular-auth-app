import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubCategory {
  id: string;
  name: string;
  parent_category_id: string;
  parent_category_name: string;
  isActive: boolean;
  createdBy: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdBy: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {
  private apiUrl = environment.apiBaseUrl;
  private subCategoriesSubject = new BehaviorSubject<SubCategory[]>([]);
  public subCategories$ = this.subCategoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  addSubCategory(name: string, parentCategoryId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sub-categories/add`, {
      name: name,
      parent_category_id: parentCategoryId
    });
  }

  getAllSubCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sub-categories/all`);
  }

  getSubCategoriesByParent(parentCategoryId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sub-categories/by-parent/${parentCategoryId}`);
  }

  deleteSubCategory(subCategoryId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sub-categories/${subCategoryId}`);
  }

  loadSubCategories(): void {
    this.getAllSubCategories().subscribe({
      next: (response) => {
        this.subCategoriesSubject.next(response.sub_categories || []);
      },
      error: (error) => {
        this.subCategoriesSubject.next([]);
      }
    });
  }

  getSubCategoriesValue(): SubCategory[] {
    return this.subCategoriesSubject.value;
  }
}