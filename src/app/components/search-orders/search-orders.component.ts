import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order, getOrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-search-orders',
  templateUrl: './search-orders.component.html',
  styleUrls: ['./search-orders.component.css']
})
export class SearchOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';
  searching = false;
  
  // Search form data
  
  // Search form data
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = this.sortOrdersByDate(orders);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'שגיאה בטעינת ההזמנות';
        this.loading = false;
        console.error('Error loading orders:', err);
      }
    });
  }

  getOrderStatus(order: Order) {
    return getOrderStatus(order.paidAmount, order.orderAmount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('he-IL');
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5); // Remove seconds if present
  }

  getRemainingAmount(order: Order): number {
    return order.orderAmount - order.paidAmount;
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id || index.toString();
  }

  private sortOrdersByDate(orders: Order[]): Order[] {
    return orders.sort((a, b) => {
      // Convert date strings to Date objects for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Sort in ascending order (oldest first)
      return dateA.getTime() - dateB.getTime();
    });
  }
}
