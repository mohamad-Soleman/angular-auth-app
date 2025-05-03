import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  let tokenToUse = localStorage.getItem('access_token');

  if (req.url.includes('/refresh')) {
    tokenToUse = localStorage.getItem('refresh_token');
  }


  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${tokenToUse || ''}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If access token is invalid and this is NOT a refresh request — try refreshing
      if (error.status === 401 && !req.url.includes('/refresh')) {
        return from(authService.refreshToken()).pipe(
          switchMap((newAccessToken: string) => {
            localStorage.setItem('access_token', newAccessToken);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`
              }
            });

            return next(retryReq);
          }),
          catchError(refreshError => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
