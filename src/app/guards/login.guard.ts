import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated().pipe(
      map(isAuth => {
        if (isAuth) {
          // User is already authenticated, redirect to home
          this.router.navigate([AUTH_CONSTANTS.ROUTES.HOME]);
          return false;
        }
        // User is not authenticated, allow access to login page
        return true;
      }),
      catchError((error) => {
        // If authentication check fails, allow access to login page
        console.warn('Login guard error:', error);
        return of(true);
      })
    );
  }
}