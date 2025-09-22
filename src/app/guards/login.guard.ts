import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated().pipe(
      map(isAuth => {
        if (isAuth) {
          // User is already authenticated, redirect to home
          this.router.navigate(['/home']);
          return false;
        }
        // User is not authenticated, allow access to login page
        return true;
      }),
      catchError((error) => {
        // If authentication check fails, allow access to login page
        return [true];
      })
    );
  }
}