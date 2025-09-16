import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

type LoginRole = 'parent' | 'teacher' | 'admin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  role = signal<LoginRole>('parent');
  loginError = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  login(): void {
    this.loginError.set(false);
    const user = this.authService.login(
      this.email(),
      this.password(),
      this.role()
    );
    if (user) {
      if (user.role === 'Admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.loginError.set(true);
    }
  }
}