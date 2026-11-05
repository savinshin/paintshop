import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  return next(req).pipe(catchError((error: unknown) => {
    if (req.url.startsWith('/api/') && !req.url.startsWith('/api/auth/') && error instanceof HttpErrorResponse) {
      if (error.status === 401)
        injector.get(AuthService).clearSession();
      else if (error.status === 403)
        void injector.get(AuthService).reloadSession();
    }
    return throwError(() => error);
  }));
};
