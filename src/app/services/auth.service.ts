
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../config/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(data: any) {
    return this.http.post(`${environment.apiBaseUrl}/auth/login`, data);
  }

  logout() {
    this.http.get(`${environment.apiBaseUrl}/auth/logout`, {})
      .subscribe({
        next: () => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          this.router.navigate(['/login']);
        },
        error: () => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          this.router.navigate(['/login']);
        }
      });
  }

  setTokens(tokens: any) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.is_admin === true;
  }

  hasToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return true;
  }

  isAuthenticated(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return of(false);
    }
    return this.http.get(`${environment.apiBaseUrl}/auth/verify`, { observe: 'response' }).pipe(
      map(response => response.status === 200), 
      catchError(() => of(false))
    );
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token found');
    }

    return this.http.get<any>(`${environment.apiBaseUrl}/auth/refresh`, {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    }).pipe(
      map(response => response.access_token)
    );
  }
}
