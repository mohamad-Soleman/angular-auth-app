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
  startDate: Date | null = null;
  endDate: Date | null = null;
  hasSearched = false;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    // Don't load orders automatically - wait for search
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

  searchOrders() {
    if (!this.startDate || !this.endDate) {
      this.error = 'יש להזין תאריך התחלה ותאריך סיום';
      return;
    }

    if (this.startDate > this.endDate) {
      this.error = 'תאריך ההתחלה חייב להיות לפני תאריך הסיום';
      return;
    }

    this.searching = true;
    this.loading = true;
    this.error = '';
    this.hasSearched = true;

    // Format dates to YYYY-MM-DD
    const startDateString = this.formatDateForAPI(this.startDate);
    const endDateString = this.formatDateForAPI(this.endDate);

    this.orderService.searchOrders(startDateString, endDateString).subscribe({
      next: (orders) => {
        this.orders = this.sortOrdersByDate(orders);
        this.searching = false;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'שגיאה בחיפוש ההזמנות';
        this.searching = false;
        this.loading = false;
        console.error('Error searching orders:', err);
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

  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
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