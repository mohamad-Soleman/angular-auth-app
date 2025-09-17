import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubCategory {
  id: string;
  name: string;
  parent_category_id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sub_categories: SubCategory[];
}

export interface OrderMenuItem {
  id?: string;
  order_id: string;
  sub_category_id: string;
  sub_category_name?: string;
  category_name?: string;
  quantity: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddOrderMenuItemRequest {
  order_id: string;
  sub_category_id: string;
  quantity?: number;
  notes?: string;
}

export interface SimpleOrderMenuItemRequest {
  order_id: string;
  sub_category_id: string;
}

export interface OrderMenuUpdateRequest {
  items: SimpleOrderMenuItemRequest[];
  general_notes?: string;
}

export interface UpdateOrderMenuItemRequest {
  quantity: number;
  notes?: string;
}

export interface OrderMenuResponse {
  success: boolean;
  message: string;
  data?: OrderMenuItem[] | {
    items: OrderMenuItem[];
    general_notes?: string;
  };
}

export interface SingleOrderMenuResponse {
  success: boolean;
  message: string;
  data?: OrderMenuItem;
}

export interface CategoriesWithSubCategoriesResponse {
  success: boolean;
  message: string;
  data?: Category[];
}

export interface CheckOrderMenuResponse {
  success: boolean;
  message: string;
  data?: {
    has_menu_items: boolean;
    item_count: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrderMenuService {
  private apiUrl = `${environment.apiBaseUrl}/order-menu`;

  constructor(private http: HttpClient) { }

  /**
   * Get all menu items for a specific order
   */
  getOrderMenu(orderId: string): Observable<OrderMenuResponse> {
    return this.http.get<OrderMenuResponse>(`${this.apiUrl}/${orderId}`, {
      withCredentials: true
    });
  }

  /**
   * Add or update order menu items
   * If item exists for the order/sub_category combination, it will be updated
   * Otherwise, a new item will be created
   */
  updateOrderMenu(data: OrderMenuUpdateRequest | AddOrderMenuItemRequest[]): Observable<OrderMenuResponse> {
    const requestBody = Array.isArray(data) ? { items: data } : data;
    return this.http.post<OrderMenuResponse>(`${this.apiUrl}/update`, requestBody, {
      withCredentials: true
    });
  }

  /**
   * Update a specific order menu item
   */
  updateOrderMenuItem(itemId: string, data: UpdateOrderMenuItemRequest): Observable<SingleOrderMenuResponse> {
    return this.http.put<SingleOrderMenuResponse>(`${this.apiUrl}/item/${itemId}`, data, {
      withCredentials: true
    });
  }

  /**
   * Delete a specific order menu item
   */
  deleteOrderMenuItem(itemId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/item/${itemId}`, {
      withCredentials: true
    });
  }

  /**
   * Get all categories with their sub-categories for menu selection
   */
  getCategoriesWithSubCategories(): Observable<CategoriesWithSubCategoriesResponse> {
    return this.http.get<CategoriesWithSubCategoriesResponse>(`${this.apiUrl}/categories-with-subcategories`, {
      withCredentials: true
    });
  }

  /**
   * Check if an order has menu items
   */
  checkOrderMenu(orderId: string): Observable<CheckOrderMenuResponse> {
    return this.http.get<CheckOrderMenuResponse>(`${this.apiUrl}/check/${orderId}`, {
      withCredentials: true
    });
  }

  /**
   * Add a single menu item to an order
   */
  addSingleMenuItem(orderMenuItem: AddOrderMenuItemRequest): Observable<SingleOrderMenuResponse> {
    return this.http.post<SingleOrderMenuResponse>(`${this.apiUrl}/update`, {
      items: [orderMenuItem]
    }, {
      withCredentials: true
    });
  }
}