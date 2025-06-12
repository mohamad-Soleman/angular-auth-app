import { Component } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order, OrderType } from '../../models/order.model';

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.css']
})
export class AddOrderComponent {
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

  constructor(private orderService: OrderService) {}

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
      
      // Get the selected date and format as YYYY-MM-DD for Israel timezone
      const selectedDate = new Date(this.orderData.date);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const israelDateString = `${year}-${month}-${day}`;
      
      const orderToSend = {
        ...this.orderData,
        date: israelDateString
      };
      
      console.log('Order Data:', orderToSend);
      this.orderService.addOrder(orderToSend)
        .subscribe((res: any) => {
          this.message = res.message;
          form.resetForm();
        });
    }
  }
}
