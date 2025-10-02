import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { OrderMenuService } from '../../services/order-menu.service';
import { PdfReportService } from '../../services/pdf-report.service';
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

  // Cache for order menu status to prevent infinite requests
  orderMenuCache = new Map<string, boolean>();
  
  // Report generation state
  isGeneratingReport = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private orderMenuService: OrderMenuService,
    private pdfReportService: PdfReportService,
    private router: Router
  ) {}

  ngOnInit() {
    // Don't load orders automatically - wait for search
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
        // Clear cache and preload menu status for all orders
        this.orderMenuCache.clear();
        this.preloadOrderMenuStatus();
      },
      error: (err) => {
        this.error = 'שגיאה בחיפוש ההזמנות';
        this.searching = false;
        this.loading = false;
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
    // Ensure extras is properly formatted as an array
    const orderForEdit = {
      ...order,
      extras: Array.isArray(order.extras) ? order.extras : (order.extras ? this.parseExtras(order.extras) : [])
    };
    
    // Store the order data for editing
    localStorage.setItem('editingOrder', JSON.stringify(orderForEdit));
    // Navigate to add-order component for editing
    this.router.navigate(['/add-order'], { queryParams: { edit: 'true' } });
  }

  navigateToOrderMenu(orderId: string) {
    this.router.navigate(['/order-menu', orderId]);
  }

  checkOrderHasMenu(orderId: string): boolean {
    return this.orderMenuCache.get(orderId) || false;
  }

  private preloadOrderMenuStatus(): void {
    this.orders.forEach(order => {
      if (order.id && !this.orderMenuCache.has(order.id)) {
        this.orderMenuService.checkOrderMenu(order.id).subscribe({
          next: (response) => {
            this.orderMenuCache.set(order.id!, response.success && response.data?.has_menu_items === true);
          },
          error: () => {
            this.orderMenuCache.set(order.id!, false);
          }
        });
      }
    });
  }

  async generateReport(order: Order): Promise<void> {
    if (this.isGeneratingReport) return;
    
    this.isGeneratingReport = true;
    
    try {
      await this.pdfReportService.generateOrderReport(order);
    } catch (error) {
      // Error generating report
      // You could add a snackbar notification here for user feedback
    } finally {
      this.isGeneratingReport = false;
    }
  }

  // Helper method to parse extras safely
  private parseExtras(extras: any): string[] {
    try {
      if (Array.isArray(extras)) {
        return extras;
      }
      if (typeof extras === 'string') {
        return JSON.parse(extras);
      }
      return [];
    } catch (error) {
      // Error parsing extras
      return [];
    }
  }
}