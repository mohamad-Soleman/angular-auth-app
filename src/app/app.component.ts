
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-auth-app';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Initialize authentication state when the app starts
    // This ensures that the user's session is restored if they have valid cookies
    this.authService.initializeAuthState().subscribe({
      next: (isAuthenticated) => {
        console.log('App initialized, authenticated:', isAuthenticated);
      },
      error: (error) => {
        console.warn('Auth initialization failed:', error);
        // App will continue to work, user will just need to login
      }
    });
  }
}
