
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  hidePassword = true;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: (res: any) => {
          // Tokens are now set as cookies by the server
          // Auth status is automatically updated via the service
          // Add a small delay to ensure navbar updates
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 100);
        },
        error: (err) => {
          this.error = err.error.error;
        }
      });
  }
}
