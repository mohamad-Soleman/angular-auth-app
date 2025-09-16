import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, getOrderStatus } from '../../models/order.model';
import { Observable } from 'rxjs';

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

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

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

  isAdmin(): Observable<boolean> {
    return this.authService.isAdmin();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('he-IL');
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5); // Remove seconds if present
  }

  getRemainingAmount(order: Order): number {
    if (order.orderAmount === undefined || order.paidAmount === undefined) {
      return 0;
    }
    return order.orderAmount - order.paidAmount;
  }

  formatDateForAPI(date: Date): string {
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const israelDateString = `${year}-${month}-${day}`;
    return israelDateString
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

  editOrder(order: Order) {
    // Store the order data for editing
    localStorage.setItem('editingOrder', JSON.stringify(order));
    // Navigate to add-order component for editing
    this.router.navigate(['/add-order'], { queryParams: { edit: 'true' } });
  }
}