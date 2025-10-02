
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, AuthLoadingState } from '../../models/auth.types';
import { AUTH_CONSTANTS } from '../../constants/auth.constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  username = '';
  password = '';
  error = '';
  hidePassword = true;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to loading state
    this.authService.loadingState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((loadingState: AuthLoadingState) => {
      this.isLoading = loadingState.login;
    });

    // Subscribe to error state
    this.authService.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((error: string | null) => {
      this.error = error || '';
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'אנא מלא את כל השדות';
      return;
    }

    // Clear any previous errors
    this.authService.clearCurrentError();
    this.error = '';

    const credentials: LoginRequest = {
      username: this.username.trim(),
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        // Navigation will be handled by the auth service after successful login
        this.router.navigate([AUTH_CONSTANTS.ROUTES.HOME]);
      },
      error: (err: any) => {
        // Error is already handled by the service and displayed via subscription
        
        // Handle specific error cases for better UX
        if (err.type === 'NETWORK_ERROR') {
          // Maybe show a retry button or different message
        } else if (err.type === 'INVALID_CREDENTIALS') {
          // Clear password field for security
          this.password = '';
        }
      }
    });
  }

  onUsernameChange(): void {
    // Clear error when user starts typing
    if (this.error) {
      this.authService.clearCurrentError();
    }
  }

  onPasswordChange(): void {
    // Clear error when user starts typing
    if (this.error) {
      this.authService.clearCurrentError();
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
