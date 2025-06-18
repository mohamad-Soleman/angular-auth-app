
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {
  username = '';
  email = '';
  password = '';
  isAdmin = false;
  message = '';
  hidePassword = true;


  constructor(private http: HttpClient) {}

  addUser(form: any) {
    if (form.valid) {
    this.http.post(`${environment.apiBaseUrl}/auth/register`, {
      username: this.username,
      email: this.email,
      password: this.password,
      isAdmin: this.isAdmin
    }).subscribe((res: any) => {
      this.message = res.message;
    });
    form.resetForm();
  }
}
}