
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  
  canActivate(): Observable<boolean> {
    // First check if user is authenticated, then check admin status
    return this.auth.isAuthenticated().pipe(
      switchMap(isAuth => {
        if (!isAuth) {
          // Not authenticated, redirect to login
          this.router.navigate([AUTH_CONSTANTS.ROUTES.LOGIN]);
          return of(false);
        }
        // User is authenticated, now check admin status
        return this.auth.isAdmin();
      }),
      map(isAdmin => {
        if (!isAdmin) {
          // User is authenticated but not admin, redirect to home
          this.router.navigate([AUTH_CONSTANTS.ROUTES.HOME]);
          return false;
        }
        return true;
      }),
      catchError((error) => {
        // If any check fails, redirect to login
        this.router.navigate([AUTH_CONSTANTS.ROUTES.LOGIN]);
        return of(false);
      })
    );
  }
}
