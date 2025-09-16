import { Component, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../auth.service';
import { MeetingRequest, MeetingService } from '../meeting.service';
import { Conversation, MessageService } from '../message.service';
import { FileService } from '../file.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private meetingService = inject(MeetingService);
  private messageService = inject(MessageService);
  private fileService = inject(FileService);

  currentUser = this.authService.currentUser;

  // Get the count of pending meeting requests for the dashboard card
  pendingMeetingRequests = this.meetingService.pendingRequestsCount;

  private userConversations: Signal<Conversation[]> = computed(() => {
    const user = this.currentUser();
    return user ? this.messageService.getConversationsForUser(user.id)() : [];
  });

  unreadMessagesCount = computed(() => {
    // A simple count of all messages in the user's conversations.
    // A real app would have a more sophisticated unread mechanism.
    return this.userConversations().reduce(
      (total, conv) => total + conv.messages.length,
      0
    );
  });

  recentConversations = computed(() => {
    return this.userConversations()
      .filter((c) => c.messages.length > 0)
      .slice()
      .sort((a, b) => {
        const lastMsgA = a.messages[a.messages.length - 1];
        const lastMsgB = b.messages[b.messages.length - 1];
        if (!lastMsgA) return 1;
        if (!lastMsgB) return -1;
        return lastMsgB.timestamp.getTime() - lastMsgA.timestamp.getTime();
      })
      .slice(0, 2);
  });

  // --- Files ---
  newFilesCount = computed(() => this.fileService.getFiles()().length);

  recentFiles = computed(() => {
    // In a real app, files would have a timestamp to sort by.
    // For this demo, we'll just reverse and take the last 2.
    return this.fileService.getFiles()().slice().reverse().slice(0, 2);
  });

  // --- Meetings ---
  upcomingMeetings = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    return this.meetingService
      .getAllRequests()()
      .filter(
        (m) =>
          (m.parentId === user.email || m.teacherId === user.id) &&
          (m.status === 'Confirmed' || m.status === 'Pending')
      )
      .sort((a, b) => new Date(a.preferredDateTime).getTime() - new Date(b.preferredDateTime).getTime())
      .slice(0, 2);
  });

  upcomingMeetingsCount = computed(() => this.upcomingMeetings().length);

  // Helper to get the other participant in a conversation
  getParticipant(
    conversation: Conversation
  ): Pick<User, 'id' | 'name' | 'role'> | undefined {
    const user = this.currentUser();
    if (!user) return undefined;
    return conversation.participants.find((p) => p.id !== user.id);
  }

  getMeetingParticipantName(meeting: MeetingRequest): string {
    const user = this.currentUser();
    if (!user) return '';
    return user.role === 'Parent' ? meeting.teacherName : meeting.requestedBy;
  }

  getMeetingStatusClass(status: 'Pending' | 'Confirmed' | 'Rejected'): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
    }
  }
}