
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated().pipe(
      map(isAuth => {
        if (!isAuth) {
          // Authentication failed, redirect to login
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
      catchError((error) => {
        // If authentication check fails, redirect to login
        this.router.navigate(['/login']);
        return [false];
      })
    );
  }
}
