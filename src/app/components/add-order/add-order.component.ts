import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../config/environment';

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.css']
})
export class AddOrderComponent {
  orderData = {
    fullName: '',
    phone: '',
    anotherPhone: '',
    guests: 0,
    date: new Date(),
    time: '',
    orderAmount: 0,
    amount: 0,
    paidAmount: 0,
    orderType: '',
    comments: ''
  };

  orderTypes = ['type1', 'type2', 'type3'];
  message = '';

  constructor(private http: HttpClient) {}

  addOrder(form: any) {
    if (form.valid) {
      this.http.post(`${environment.apiBaseUrl}/orders`, this.orderData)
        .subscribe((res: any) => {
          this.message = res.message;
          form.resetForm();
        });
    }
  }
}