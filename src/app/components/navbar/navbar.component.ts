
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAdmin$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
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

    // Initialize authentication state on component load
    this.auth.initializeAuthState().subscribe({
      next: (isAuth) => {
        // Auth state is already updated by initializeAuthState
        console.log('Authentication state initialized:', isAuth);
      },
      error: (error) => {
        console.error('Failed to initialize authentication state:', error);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
