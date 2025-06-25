import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderType } from '../../models/order.model';

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
    price: 0,
    minGuests: 0,
    maxGuests: 0,
    date: new Date().toISOString(),
    startTime: '',
    endTime: '',
    orderAmount: 0,
    paidAmount: 0,
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
    private router: Router
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
    this.orderData.orderAmount = this.orderData.price * this.orderData.maxGuests;
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
        console.log("no edit mode found");
        this.router.navigate(['/search-orders']); 
      }
  }
}

