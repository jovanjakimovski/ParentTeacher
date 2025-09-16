import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.currentUser).pipe(
    map(user => {
      if (user?.role === 'Admin') {
        return true;
      }
      // Redirect to dashboard if not an admin
      return router.parseUrl('/dashboard');
    })
  );
};
