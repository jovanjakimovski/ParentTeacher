import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

type SignupRole = 'Parent' | 'Teacher';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent {
  name = signal('');
  email = signal('');
  password = signal('');
  role = signal<SignupRole>('Parent');
  signupError = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  signup(): void {
    this.signupError.set(false);
    const user = this.authService.signup(this.name(), this.email(), this.password(), this.role());

    if (user) {
      this.router.navigate(['/dashboard']);
    } else {
      this.signupError.set(true);
    }
  }
}