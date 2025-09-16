import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
import { provideBrowserGlobalErrorListeners } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideBrowserGlobalErrorListeners(),
  ],
})
  .catch(err => console.error(err));
