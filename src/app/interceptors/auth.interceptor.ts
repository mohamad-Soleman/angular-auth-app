import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // With cookie-based auth, we only need to include credentials
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if this is a 401 error and not an excluded endpoint
      if (error.status === 401 && !isExcludedFromRefresh(req.url)) {
        
        // Check if we're already refreshing using the service's observable
        return authService.isRefreshing$.pipe(
          take(1),
          switchMap(isRefreshing => {
            if (isRefreshing) {
              // If already refreshing, wait for it to complete then retry
              return authService.isRefreshing$.pipe(
                filter(refreshing => !refreshing),
                take(1),
                switchMap(() => {
                  // Retry the original request after refresh completes
                  const retryReq = req.clone({
                    withCredentials: true
                  });
                  return next(retryReq);
                })
              );
            } else {
              // Not currently refreshing, attempt to refresh
              return authService.refreshToken().pipe(
                switchMap(() => {
                  // After successful refresh, retry the original request
                  const retryReq = req.clone({
                    withCredentials: true
                  });
                  return next(retryReq);
                }),
                catchError(refreshError => {
                  // Only logout if refresh actually failed due to authentication
                  if (refreshError.status === 401) {
                    authService.logoutLocally();
                  }
                  return throwError(() => refreshError);
                })
              );
            }
          })
        );
      }

      // For non-401 errors or excluded endpoints, just pass through the error
      return throwError(() => error);
    })
  );
};

function isExcludedFromRefresh(url: string): boolean {
  const excludedEndpoints = [
    AUTH_CONSTANTS.ENDPOINTS.REFRESH,
    AUTH_CONSTANTS.ENDPOINTS.LOGOUT,
    AUTH_CONSTANTS.ENDPOINTS.LOGIN,
    AUTH_CONSTANTS.ENDPOINTS.WHOAMI
  ];
  
  return excludedEndpoints.some(endpoint => url.includes(endpoint));
}
