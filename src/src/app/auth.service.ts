import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'Parent' | 'Teacher' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Made optional for existing mock data structure
  role: UserRole;
}

const MOCK_USERS: User[] = [
  { id: 'admin0', name: 'Admin User', email: 'admin@admin.com', password: 'admin', role: 'Admin' },
  { id: 'parent1', name: 'John Doe', email: 'parent1@family.com', password: 'password', role: 'Parent' },
  { id: 'teacher1', name: 'Jane Smith', email: 'teacher1@school.com', password: 'password', role: 'Teacher' },
  { id: 'teacher2', name: 'Peter Jones', email: 'teacher2@school.com', password: 'password', role: 'Teacher' },
  { id: 'parent2', name: 'Mary Williams', email: 'mary.williams@parent.com', password: 'password', role: 'Parent' },
];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userKey = 'currentUser';
  currentUser = signal<User | null>(null);
  private users = signal<User[]>([]);
  private router = inject(Router);

  constructor() {
    // Initialize users from mock data or localStorage
    const storedUsers = localStorage.getItem('users');
    this.users.set(storedUsers ? JSON.parse(storedUsers) : MOCK_USERS);

    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      this.currentUser.set(JSON.parse(userJson));
    }
  }

  login(
    email: string,
    password: string,
    role: 'parent' | 'teacher' | 'admin'
  ): User | null {
    const user = this.users().find(
      u =>
        u.email === email && u.password === password && u.role.toLowerCase() === role
    );
    if (user) {
      this.currentUser.set(user);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      return user;
    }
    return null;
  }

  signup(name: string, email: string, password: string, role: 'Parent' | 'Teacher'): User | null {
    if (this.users().some(u => u.email === email)) {
      return null; // Email already exists
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role,
    };

    this.users.update(users => [...users, newUser]);
    this.saveUsersToLocalStorage();
    return this.login(email, password, role.toLowerCase() as 'parent' | 'teacher');
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  getTeachers(): User[] {
    return this.users().filter(u => u.role === 'Teacher');
  }

  getParents(): User[] {
    return this.users().filter(u => u.role === 'Parent');
  }

  getUsers(): User[] {
    // Return all users except the currently logged-in one for the admin panel
    const currentUser = this.currentUser();
    return this.users().filter(u => u.id !== currentUser?.id);
  }

  deleteUser(userId: string): void {
    this.users.update(users => users.filter(u => u.id !== userId));
    this.saveUsersToLocalStorage();
  }

  private saveUsersToLocalStorage(): void {
    localStorage.setItem('users', JSON.stringify(this.users()));
  }
}