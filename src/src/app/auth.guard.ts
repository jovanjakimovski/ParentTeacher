import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Using toObservable to convert signal to observable for pipe
  return toObservable(authService.currentUser).pipe(
    map(user => {
      if (user) {
        return true; // User is logged in, allow access
      }
      // User is not logged in, redirect to login page
      return router.parseUrl('/login');
    })
  );
};