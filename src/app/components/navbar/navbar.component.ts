
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, catchError, switchMap } from 'rxjs/operators';
import { AUTH_CONSTANTS } from '../../constants/auth.constants';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAdmin$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Directly use the auth status observable that updates automatically on login/logout
    this.isAuthenticated$ = this.auth.authStatus$.pipe(
      takeUntil(this.destroy$),
      catchError(() => of(false))
    );
    
    this.isAdmin$ = this.auth.authStatus$.pipe(
      switchMap(isAuth => {
        if (isAuth) {
          return this.auth.isAdmin();
        } else {
          return of(false);
        }
      }),
      takeUntil(this.destroy$),
      catchError(() => of(false))
    );

    // Subscribe to loading state for logout button
    this.isLoading$ = this.auth.loadingState$.pipe(
      takeUntil(this.destroy$),
      switchMap(loadingState => of(loadingState.logout))
    );

    // Note: Auth initialization is now handled in app.component.ts
    // This prevents redundant initialization calls
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goHome(): void {
    if (this.router.url === AUTH_CONSTANTS.ROUTES.HOME) {
      window.location.reload();
    } else {
      this.router.navigate([AUTH_CONSTANTS.ROUTES.HOME]);
    }
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        // Logout successful, navigation is handled by the service
      },
      error: (error) => {
        console.warn('Logout error:', error);
        // Even if logout fails, the service will clear local state
      }
    });
  }
}
