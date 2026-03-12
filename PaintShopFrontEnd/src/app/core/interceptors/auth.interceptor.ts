import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '@env/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  const apiBase = (environment.apiBaseUrl ?? '').trim();
  const isAbsoluteApi = apiBase.length > 0 ? req.url.startsWith(apiBase) : false;

  const isApiRequest = req.url.startsWith('/api') || isAbsoluteApi;

  if (!token || !isApiRequest) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
