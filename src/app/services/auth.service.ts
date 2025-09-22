
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UserStoreService, UserData } from './user-store.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private userStore: UserStoreService
  ) {}

  login(data: any) {
    return this.http.post(`${environment.apiBaseUrl}/auth/login`, data, { withCredentials: true }).pipe(
      switchMap((response: any) => {
        // After successful login, get user details for client-side validation
        return this.http.get(`${environment.apiBaseUrl}/auth/whoami`, { withCredentials: true }).pipe(
          tap((whoamiResponse: any) => {
            // Store user data in secure store for client-side checks
            if (whoamiResponse && whoamiResponse.user_details) {
              const userData = whoamiResponse.user_details;
              this.userStore.setUserData(userData);
            }
            
            // Emit authentication status change after successful login
            this.authStatusSubject.next(true);
          }),
          map(() => response), // Return the original login response
          catchError((error) => {
            // If whoami fails, we're still logged in via cookies, just can't do client-side validation
            this.authStatusSubject.next(true);
            return of(response); // Still return success
          })
        );
      })
    );
  }

  // Get stored user data from secure store
  private getUserData(): any {
    return this.userStore.getUserData();
  }

  // Clear user data from secure store
  private clearUserData() {
    this.userStore.clearUserData();
  }

  logout() {
    this.http.get(`${environment.apiBaseUrl}/auth/logout`, { withCredentials: true })
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
    // Cookies are cleared by the server, emit auth status change and redirect
    this.clearUserData();
    this.authStatusSubject.next(false);
    this.router.navigate(['/login']);
  }

  logoutLocally() {
    this.clearTokensAndRedirect();
  }

  // Public method to update auth status
  updateAuthStatus(status: boolean) {
    this.authStatusSubject.next(status);
  }


  isAdmin(): Observable<boolean> {
    return this.userStore.isAdmin();
  }


  isAuthenticated(): Observable<boolean> {
    // Check if we have user data stored (indicates successful authentication)
    const userData = this.getUserData();
    
    if (!userData) {
      // No user data available, try to restore from server
      return this.restoreAuthState();
    }

    // We have user data, so we're authenticated
    return of(true);
  }

  // Method to restore authentication state from server
  private restoreAuthState(): Observable<boolean> {
    return this.http.get(`${environment.apiBaseUrl}/auth/whoami`, { withCredentials: true }).pipe(
      tap((whoamiResponse: any) => {
        // If whoami succeeds, restore user data
        if (whoamiResponse && whoamiResponse.user_details) {
          const userData = whoamiResponse.user_details;
          this.userStore.setUserData(userData);
          this.authStatusSubject.next(true);
        }
      }),
      map(() => true), // If whoami succeeds, we're authenticated
      catchError((error) => {
        // If whoami fails, we're not authenticated
        this.userStore.clearUserData();
        this.authStatusSubject.next(false);
        return of(false);
      })
    );
  }

  refreshToken(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/auth/refresh`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        // If refresh fails with 401, it means there are no valid cookies
        if (error.status === 401) {
          this.logoutLocally();
        }
        throw error;
      })
    );
  }

  // Method to initialize authentication state on app startup
  initializeAuthState(): Observable<boolean> {
    const userData = this.getUserData();
    
    if (userData) {
      // We already have user data, emit current status
      this.authStatusSubject.next(true);
      return of(true);
    } else {
      // No user data, try to restore from server
      return this.restoreAuthState();
    }
  }
}
