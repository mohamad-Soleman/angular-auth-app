
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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
          this.clearTokensAndRedirect();
        },
        error: () => {
          this.clearTokensAndRedirect();
        }
      });
  }

  private clearTokensAndRedirect() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  logoutLocally() {
    this.clearTokensAndRedirect();
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
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.is_admin === true;
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      this.logoutLocally();
      return false;
    }
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isValidJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      JSON.parse(atob(parts[1]));
      return true;
    } catch (error) {
      return false;
    }
  }

  isCurrentlyAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    if (!this.isValidJWT(token)) {
      this.logoutLocally();
      return false;
    }
    
    return !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      this.logoutLocally();
      return true;
    }
  }

  isAuthenticated(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }
    
    // Check if token is valid JWT format
    if (!this.isValidJWT(token)) {
      this.logoutLocally();
      return of(false);
    }
    
    // If token is expired, try to refresh it
    if (this.isTokenExpired()) {
      return this.refreshToken().pipe(
        switchMap(newToken => {
          localStorage.setItem('access_token', newToken);
          return this.http.get(`${environment.apiBaseUrl}/auth/verify`, { observe: 'response' }).pipe(
            map(response => response.status === 200),
            catchError(() => of(false))
          );
        }),
        catchError(() => {
          // Refresh failed, user needs to login again
          this.logoutLocally();
          return of(false);
        })
      );
    }
    
    return this.http.get(`${environment.apiBaseUrl}/auth/verify`, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError(() => of(false))
    );
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      this.logoutLocally();
      throw new Error('No refresh token found');
    }

    return this.http.get<any>(`${environment.apiBaseUrl}/auth/refresh`, {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    }).pipe(
      map(response => response.access_token),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.logoutLocally();
        throw error;
      })
    );
  }
}
