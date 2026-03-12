import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const adminGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.whenReady();

  return auth.isAdmin() ? true : router.parseUrl('/login');
};
