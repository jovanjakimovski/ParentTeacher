import { Injectable, signal, computed } from '@angular/core';
import { User } from './auth.service';

export interface MeetingRequest {
  id: string;
  requestedBy: string; // parent's name
  parentId: string; // parent's email
  teacherId: string;
  teacherName: string;
  reason: string;
  preferredDateTime: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
}

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private meetingsKey = 'meetingRequests';
  private requests = signal<MeetingRequest[]>([]);

  pendingRequestsCount = computed(() => this.requests().filter(r => r.status === 'Pending').length);

  constructor() {
    const meetingsJson = localStorage.getItem(this.meetingsKey);
    if (meetingsJson) {
      this.requests.set(JSON.parse(meetingsJson));
    }
  }

  getRequestsForParent(parentId: string) {
    return computed(() => this.requests().filter(r => r.parentId === parentId));
  }

  getAllRequests() {
    return this.requests.asReadonly();
  }

  requestMeeting(
    reason: string,
    preferredDateTime: string,
    parent: User,
    teacherId: string,
    teacherName: string
  ): void {
    const newRequest: MeetingRequest = {
      id: crypto.randomUUID(),
      parentId: parent.email, // Use email as the unique identifier for the parent
      requestedBy: parent.name,
      teacherId,
      teacherName,
      reason,
      preferredDateTime,
      status: 'Pending',
    };
    this.requests.update(reqs => [...reqs, newRequest]);
    this.saveToLocalStorage();
  }

  updateRequestStatus(
    requestId: string,
    status: 'Confirmed' | 'Rejected'
  ): void {
    this.requests.update(reqs =>
      reqs.map(req => (req.id === requestId ? { ...req, status } : req))
    );
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.meetingsKey, JSON.stringify(this.requests()));
  }
}