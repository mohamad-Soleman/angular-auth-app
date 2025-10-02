
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, of, BehaviorSubject, throwError, EMPTY, timer } from 'rxjs';
import { catchError, map, switchMap, tap, shareReplay, finalize, timeout, retry, takeUntil } from 'rxjs/operators';
import { UserStoreService } from './user-store.service';
import { 
  UserData, 
  LoginRequest, 
  LoginResponse, 
  WhoAmIResponse, 
  AuthError, 
  AuthState, 
  AuthErrorType, 
  AuthLoadingState 
} from '../models/auth.types';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  private loadingStateSubject = new BehaviorSubject<AuthLoadingState>({
    login: false,
    logout: false,
    refresh: false,
    initialization: false
  });
  private errorSubject = new BehaviorSubject<string | null>(null);
  private isRefreshingSubject = new BehaviorSubject<boolean>(false);
  
  // Cached observables to prevent multiple simultaneous requests
  private whoAmICache$: Observable<WhoAmIResponse> | null = null;
  private refreshCache$: Observable<any> | null = null;

  public authStatus$ = this.authStatusSubject.asObservable();
  public loadingState$ = this.loadingStateSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public isRefreshing$ = this.isRefreshingSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private userStore: UserStoreService
  ) {}

  private setLoadingState(key: keyof AuthLoadingState, value: boolean): void {
    const currentState = this.loadingStateSubject.value;
    this.loadingStateSubject.next({ ...currentState, [key]: value });
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  private setError(error: string): void {
    this.errorSubject.next(error);
  }

  private handleError(error: HttpErrorResponse): AuthErrorType {
    if (!navigator.onLine) {
      return AuthErrorType.NETWORK_ERROR;
    }

    switch (error.status) {
      case 401:
        return AuthErrorType.INVALID_CREDENTIALS;
      case 403:
        return AuthErrorType.UNAUTHORIZED;
      case 0:
      case 504:
      case 502:
        return AuthErrorType.NETWORK_ERROR;
      case 500:
      case 503:
        return AuthErrorType.SERVER_ERROR;
      default:
        return AuthErrorType.UNKNOWN_ERROR;
    }
  }

  private getErrorMessage(errorType: AuthErrorType): string {
    return AUTH_CONSTANTS.ERROR_MESSAGES[errorType] || AUTH_CONSTANTS.ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoadingState('login', true);
    this.clearError();

    return this.http.post<LoginResponse>(
      `${environment.apiBaseUrl}${AUTH_CONSTANTS.ENDPOINTS.LOGIN}`, 
      credentials, 
      { withCredentials: true }
    ).pipe(
      timeout(AUTH_CONSTANTS.TIMEOUTS.REQUEST_TIMEOUT),
      switchMap((response: LoginResponse) => {
        // After successful login, get user details for client-side validation
        return this.getWhoAmI().pipe(
          tap((whoamiResponse: WhoAmIResponse) => {
            // Store user data in secure store for client-side checks
            if (whoamiResponse?.user_details) {
              this.userStore.setUserData(whoamiResponse.user_details);
              this.authStatusSubject.next(true);
            }
          }),
          map(() => response), // Return the original login response
          catchError((whoamiError) => {
            // If whoami fails, we're still logged in via cookies, just can't do client-side validation
            console.warn('WhoAmI failed after login:', whoamiError);
            this.authStatusSubject.next(true);
            return of(response); // Still return success
          })
        );
      }),
      catchError((error: HttpErrorResponse) => {
        const errorType = this.handleError(error);
        const errorMessage = this.getErrorMessage(errorType);
        this.setError(errorMessage);
        return throwError(() => ({ error: errorMessage, type: errorType }));
      }),
      finalize(() => this.setLoadingState('login', false))
    );
  }

  private getWhoAmI(): Observable<WhoAmIResponse> {
    // Use cached request if available to prevent multiple simultaneous calls
    if (this.whoAmICache$) {
      return this.whoAmICache$;
    }

    this.whoAmICache$ = this.http.get<WhoAmIResponse>(
      `${environment.apiBaseUrl}${AUTH_CONSTANTS.ENDPOINTS.WHOAMI}`, 
      { withCredentials: true }
    ).pipe(
      timeout(AUTH_CONSTANTS.TIMEOUTS.REQUEST_TIMEOUT),
      shareReplay(1),
      finalize(() => {
        // Clear cache after request completes
        setTimeout(() => {
          this.whoAmICache$ = null;
        }, 1000);
      })
    );

    return this.whoAmICache$;
  }

  // Get stored user data from secure store
  private getUserData(): UserData | null {
    return this.userStore.getUserData();
  }

  // Clear user data from secure store
  private clearUserData(): void {
    this.userStore.clearUserData();
  }

  logout(): Observable<void> {
    this.setLoadingState('logout', true);
    this.clearError();

    return this.http.get<void>(
      `${environment.apiBaseUrl}${AUTH_CONSTANTS.ENDPOINTS.LOGOUT}`, 
      { withCredentials: true }
    ).pipe(
      timeout(AUTH_CONSTANTS.TIMEOUTS.REQUEST_TIMEOUT),
      catchError((error) => {
        // Even if logout fails on server, clear local state
        console.warn('Server logout failed:', error);
        return of(void 0);
      }),
      tap(() => this.clearTokensAndRedirect()),
      finalize(() => this.setLoadingState('logout', false))
    );
  }

  private clearTokensAndRedirect(): void {
    // Cookies are cleared by the server, emit auth status change and redirect
    this.clearUserData();
    this.authStatusSubject.next(false);
    this.clearError();
    this.router.navigate([AUTH_CONSTANTS.ROUTES.LOGIN]);
  }

  logoutLocally(): void {
    this.clearTokensAndRedirect();
  }

  // Public method to update auth status
  updateAuthStatus(status: boolean): void {
    this.authStatusSubject.next(status);
  }

  isAdmin(): Observable<boolean> {
    return this.userStore.isAdmin();
  }

  isAuthenticated(): Observable<boolean> {
    // Check if we have user data stored and session is not expired
    const userData = this.getUserData();
    
    if (!userData || this.userStore.isSessionExpired()) {
      // No user data available or session expired, try to restore from server
      return this.restoreAuthState();
    }

    // We have valid user data, so we're authenticated
    this.userStore.updateSessionTimestamp(); // Update activity timestamp
    return of(true);
  }

  // Method to restore authentication state from server
  private restoreAuthState(): Observable<boolean> {
    return this.getWhoAmI().pipe(
      tap((whoamiResponse: WhoAmIResponse) => {
        // If whoami succeeds, restore user data
        if (whoamiResponse?.user_details) {
          this.userStore.setUserData(whoamiResponse.user_details);
          this.authStatusSubject.next(true);
        }
      }),
      map(() => true), // If whoami succeeds, we're authenticated
      catchError((error: HttpErrorResponse) => {
        // If whoami fails, we're not authenticated
        this.clearUserData();
        this.authStatusSubject.next(false);
        
        // Only set error if it's not a simple 401 (which is expected when not authenticated)
        if (error.status !== 401) {
          const errorType = this.handleError(error);
          const errorMessage = this.getErrorMessage(errorType);
          this.setError(errorMessage);
        }
        
        return of(false);
      })
    );
  }

  refreshToken(): Observable<any> {
    // Use cached request if already refreshing
    if (this.refreshCache$) {
      return this.refreshCache$;
    }

    this.setLoadingState('refresh', true);
    this.isRefreshingSubject.next(true);

    this.refreshCache$ = this.http.get(
      `${environment.apiBaseUrl}${AUTH_CONSTANTS.ENDPOINTS.REFRESH}`,
      { withCredentials: true }
    ).pipe(
      timeout(AUTH_CONSTANTS.TIMEOUTS.REQUEST_TIMEOUT),
      tap(() => {
        // Update session timestamp on successful refresh
        this.userStore.updateSessionTimestamp();
      }),
      catchError((error: HttpErrorResponse) => {
        // If refresh fails with 401, it means there are no valid cookies
        if (error.status === 401) {
          this.logoutLocally();
        }
        return throwError(() => error);
      }),
      shareReplay(1),
      finalize(() => {
        this.setLoadingState('refresh', false);
        this.isRefreshingSubject.next(false);
        // Clear cache after request completes
        setTimeout(() => {
          this.refreshCache$ = null;
        }, 1000);
      })
    );

    return this.refreshCache$;
  }

  // Method to initialize authentication state on app startup
  initializeAuthState(): Observable<boolean> {
    this.setLoadingState('initialization', true);
    
    const userData = this.getUserData();
    
    if (userData && !this.userStore.isSessionExpired()) {
      // We already have valid user data, emit current status
      this.authStatusSubject.next(true);
      this.setLoadingState('initialization', false);
      return of(true);
    } else {
      // No user data or session expired, try to restore from server
      return this.restoreAuthState().pipe(
        finalize(() => this.setLoadingState('initialization', false))
      );
    }
  }

  // Get current loading state
  getLoadingState(): AuthLoadingState {
    return this.loadingStateSubject.value;
  }

  // Check if any operation is currently loading
  isLoading(): boolean {
    const state = this.getLoadingState();
    return Object.values(state).some(loading => loading);
  }

  // Clear current error
  clearCurrentError(): void {
    this.clearError();
  }
}
