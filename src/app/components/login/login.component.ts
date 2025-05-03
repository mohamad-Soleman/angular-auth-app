
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
          this.authService.setTokens(res.tokens);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.error = err.error.error;
        }
      });
  }
}
