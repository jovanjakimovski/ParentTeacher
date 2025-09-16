import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../auth.service';
import { MeetingService } from '../meeting.service';

@Component({
  selector: 'app-meeting-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting-requests.html',
  styleUrl: './meeting-requests.css'
})
export class MeetingRequestsComponent {
  private authService = inject(AuthService);
  private meetingService = inject(MeetingService);

  currentUser = this.authService.currentUser;
  teachers = signal<User[]>([]);

  // Form state
  reason = signal('');
  selectedTeacherId = signal<string>('');
  preferredDateTime = signal('');
  submissionStatus = signal<'idle' | 'success' | 'error'>('idle');

  constructor() {
    this.teachers.set(this.authService.getTeachers());
  }

  // This will be reactive and update whenever the user or requests change.
  requests = computed(() => {
    const user = this.currentUser();
    if (user?.role === 'Parent') {
      return this.meetingService.getRequestsForParent(user.email)();
    }
    if (user?.role === 'Teacher') {
      // Only show requests assigned to the logged-in teacher
      return this.meetingService.getAllRequests()().filter(r => r.teacherId === user.id);
    }
    return [];
  });

  submitRequest(): void {
    const user = this.currentUser();
    if (!user || user.role !== 'Parent') {
      return;
    }
    const selectedTeacher = this.teachers().find(
      (t) => t.id === this.selectedTeacherId()
    );

    if (this.reason().trim() && this.preferredDateTime().trim() && selectedTeacher) {
      this.meetingService.requestMeeting(
        this.reason(),
        this.preferredDateTime(),
        user,
        selectedTeacher.id,
        selectedTeacher.name
      );
      this.submissionStatus.set('success');
      // Reset form
      this.reason.set('');
      this.selectedTeacherId.set('');
      this.preferredDateTime.set('');
      setTimeout(() => this.submissionStatus.set('idle'), 3000);
    } else {
      this.submissionStatus.set('error');
      setTimeout(() => this.submissionStatus.set('idle'), 3000);
    }
  }

  confirmMeeting(requestId: string): void {
    this.meetingService.updateRequestStatus(requestId, 'Confirmed');
  }

  rejectMeeting(requestId: string): void {
    this.meetingService.updateRequestStatus(requestId, 'Rejected');
  }

  getStatusClass(status: 'Pending' | 'Confirmed' | 'Rejected'): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
    }
  }
}