
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated().pipe(
      map(isAuth => {
        if (!isAuth) {
          // Cookies are handled by the server, just redirect
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}
