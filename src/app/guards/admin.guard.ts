
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): Observable<boolean> {
    return this.auth.isAdmin().pipe(
      map(isAdmin => {
        if (!isAdmin) {
          this.router.navigate(['/home']);
          return false;
        }
        return true;
      })
    );
  }
}
