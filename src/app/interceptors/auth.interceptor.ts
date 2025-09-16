import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

// Track refresh attempts to prevent infinite loops
let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // With cookie-based auth, we only need to include credentials
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If access token is invalid and this is NOT a refresh/logout/login request and we're not already refreshing
      if (error.status === 401 &&
          !req.url.includes('/refresh') &&
          !req.url.includes('/logout') &&
          !req.url.includes('/login') &&
          !isRefreshing) {
        
        isRefreshing = true;
        
        return authService.refreshToken().pipe(
          switchMap(() => {
            isRefreshing = false;
            // After refreshing, retry the original request
            const retryReq = req.clone({
              withCredentials: true
            });

            return next(retryReq);
          }),
          catchError(refreshError => {
            isRefreshing = false;
            // Only logout if refresh actually failed due to authentication
            if (refreshError.status === 401) {
              authService.logoutLocally();
            }
            return throwError(() => refreshError);
          })
        );
      }

      // If we're already refreshing or this is a refresh/verify request, just pass through the error
      return throwError(() => error);
    })
  );
};
