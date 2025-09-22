import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { OrderService } from '../../services/order.service';
import { Order, OrderType } from '../../models/order.model';
import { OrderMenuDialogComponent, OrderMenuDialogData } from '../order-menu-dialog/order-menu-dialog.component';

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.css']
})

export class AddOrderComponent implements OnInit {
  orderData: Order = {
    fullName: '',
    phone: '',
    anotherPhone: '',
    price: null as any,
    minGuests: null as any,
    maxGuests: null as any,
    date: new Date().toISOString(),
    startTime: '',
    endTime: '',
    orderAmount: 0,
    paidAmount: null as any,
    orderType: '',
    comments: ''
  };

  orderTypes = Object.values(OrderType);
  message = '';
  isEditMode = false;
  buttonText = ''

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true') {
        this.isEditMode = true;
        this.loadOrderForEdit();
      }
    });
    this.buttonText = this.isEditMode ? 'עדכן הזמנה' : 'הוסף הזמנה'
  }

  loadOrderForEdit() {
    const orderData = localStorage.getItem('editingOrder');
    if (orderData) {
      const order: Order = JSON.parse(orderData);
      this.orderData = {
        ...order,
        date: new Date(order.date).toISOString()
      };
      localStorage.removeItem('editingOrder');
    } else {
      this.router.navigate(['/search-orders']);
    }
  }

  updateOrderAmount() {
    if (this.orderData.price && this.orderData.maxGuests) {
      this.orderData.orderAmount = this.orderData.price * this.orderData.maxGuests;
    } else {
      this.orderData.orderAmount = 0;
    }
  }

  validateTimes(): boolean {
    if (this.orderData.startTime && this.orderData.endTime) {
      const [startHours, startMinutes] = this.orderData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = this.orderData.endTime.split(':').map(Number);
      
      if (startHours > endHours) return false;
      if (startHours === endHours && startMinutes >= endMinutes) return false;
      
      return true;
    }
    return false;
  }

  addOrder(form: any) {
    if (form.valid && this.validateTimes()) {
      this.updateOrderAmount();
      
      if (this.isEditMode) {
        // In edit mode, just print to console as requested
        const selectedDate = new Date(this.orderData.date);
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const israelDateString = `${year}-${month}-${day}`;
        
        const orderToUpdate = {
          ...this.orderData,
          date: israelDateString
        };
        this.orderService.editOrder(orderToUpdate)
          .subscribe((res: any) => {
            this.message = res.message;
            form.resetForm();
          });
        this.isEditMode = false; // Reset edit mode after update
        this.router.navigate(['/search-orders']); // Redirect to search orders after edit  
      } else {
        // Regular add mode
        const selectedDate = new Date(this.orderData.date);
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const israelDateString = `${year}-${month}-${day}`;
        
        const orderToSend = {
          ...this.orderData,
          date: israelDateString
        };
        this.orderService.addOrder(orderToSend)
          .subscribe((res: any) => {
            this.message = res.message;
            
            // Show success dialog for adding order menu
            if (res.success && res.order_id) {
              this.showOrderMenuDialog(res.order_id, this.orderData.fullName, this.orderData.orderType);
            }
            
            form.resetForm();
          });
      }
    }
  }

  onDelete(){
    if (this.isEditMode) {
        const orderToUpdate = {
          ...this.orderData,
        };
        this.orderService.deactivateOrder(orderToUpdate)
          .subscribe((res: any) => {
            this.message = res.message;
          });
        this.isEditMode = false;
        this.router.navigate(['/search-orders']); 
      } else {
        this.router.navigate(['/search-orders']); 
      }
  }

  showOrderMenuDialog(orderId: string, customerName: string, orderType: string): void {
    const dialogData: OrderMenuDialogData = {
      orderId: orderId,
      customerName: customerName,
      orderType: orderType
    };

    const dialogRef = this.dialog.open(OrderMenuDialogComponent, {
      width: '500px',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // User wants to add order menu, navigate to order menu page
        this.router.navigate(['/order-menu', orderId]);
      } else {
        // User chose "Later", just navigate to search orders
        this.router.navigate(['/search-orders']);
      }
    });
  }
}
