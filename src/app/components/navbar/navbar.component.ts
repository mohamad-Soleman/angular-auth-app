
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  canViewContent: boolean = false;  
  constructor(public auth: AuthService, private router: Router) {}

  goHome() {
    if (this.router.url === '/home') {
      window.location.reload();
    } else {
      this.router.navigate(['/home']);
    }
  }

  logout() {
    this.auth.logout();
  }
}
