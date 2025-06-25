import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';

interface OrderResponse {
  id: string;
  full_name: string;
  phone: string;
  another_phone: string;
  price: number;
  min_guests: number;
  max_guests: number;
  date: string;
  start_time: string;
  end_time: string;
  order_amount: number;
  paid_amount: number;
  order_type: string;
  comments?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) {}

  addOrder(orderData: Order): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/orders/addorder`, orderData);
  }

  editOrder(orderData: Order): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/orders/editorder`, orderData);
  }

  deactivateOrder(orderData: Order): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/orders/deactivateorder`, orderData);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<OrderResponse[]>(`${environment.apiBaseUrl}/orders/getorders`)
      .pipe(
        map(orders => orders.map(order => ({
          id: order.id,
          fullName: order.full_name,
          phone: order.phone,
          anotherPhone: order.another_phone,
          price: order.price,
          minGuests: order.min_guests,
          maxGuests: order.max_guests,
          date: order.date,
          startTime: order.start_time,
          endTime: order.end_time,
          orderAmount: order.order_amount,
          paidAmount: order.paid_amount,
          orderType: order.order_type,
          comments: order.comments
        })))
      );
  }

  searchOrders(startDate: string, endDate: string): Observable<Order[]> {
    const searchData = {
      startDate: startDate,
      endDate: endDate
    };
    return this.http.post<OrderResponse[]>(`${environment.apiBaseUrl}/orders/getorders`, searchData)
      .pipe(
        map(orders => orders.map(order => ({
          id: order.id,
          fullName: order.full_name,
          phone: order.phone,
          anotherPhone: order.another_phone,
          price: order.price,
          minGuests: order.min_guests,
          maxGuests: order.max_guests,
          date: order.date,
          startTime: order.start_time,
          endTime: order.end_time,
          orderAmount: order.order_amount,
          paidAmount: order.paid_amount,
          orderType: order.order_type,
          comments: order.comments
        })))
      );
  }
}