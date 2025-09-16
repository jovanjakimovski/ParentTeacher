import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard';
import { MessagesComponent } from './messages/messages';
import { FileUploadsComponent } from './file-uploads/file-uploads';
import { MeetingRequestsComponent } from './meeting-requests/meeting-requests';
import { LoginComponent } from './login/login';
import { SignupComponent } from './signup/signup';
import { AdminPanelComponent } from './admin-panel/admin-panel';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [authGuard] },
  { path: 'messages/:id', component: MessagesComponent, canActivate: [authGuard] },
  { path: 'file-uploads', component: FileUploadsComponent, canActivate: [authGuard] },
  { path: 'meeting-requests', component: MeetingRequestsComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [authGuard, adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
