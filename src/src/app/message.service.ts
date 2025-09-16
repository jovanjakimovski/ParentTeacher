import { Injectable, signal, computed } from '@angular/core';

import { User } from './auth.service';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  ownerId: string; // The user who created the conversation
  participantIds: string[];
  participants: Pick<User, 'id' | 'name' | 'role'>[];
  messages: Message[];
  isGroup?: boolean;
}

// MOCK DATA
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    title: 'Parent-teacher conference',
    ownerId: 'teacher1',
    participantIds: ['parent1', 'teacher1'],
    participants: [
      { id: 'parent1', name: 'John Doe', role: 'Parent' },
      { id: 'teacher1', name: 'Jane Smith', role: 'Teacher' },
    ],
    messages: [
      { id: 'msg1', senderId: 'teacher1', text: "Just a reminder about the upcoming parent-teacher conference on Friday. Please confirm your time slot.", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: 'msg2', senderId: 'parent1', text: "Thanks for the reminder! We're confirmed for 3 PM.", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) }
    ],
    isGroup: false,
  },
  {
    id: 'conv2',
    title: "Johnny's progress report",
    ownerId: 'teacher1',
    participantIds: ['parent2', 'teacher1'],
    participants: [
        { id: 'parent2', name: 'Mary Williams', role: 'Parent' },
        { id: 'teacher1', name: 'Jane Smith', role: 'Teacher' },
    ],
    messages: [
      { id: 'msg3', senderId: 'parent2', text: "Thank you for the update on Johnny's progress report. I have a quick question about his math assignment.", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    ],
    isGroup: false,
  },
];

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private conversationsKey = 'conversations';
  conversations = signal<Conversation[]>([]);

  constructor() {
    const storedConversations = localStorage.getItem(this.conversationsKey);
    this.conversations.set(storedConversations ? JSON.parse(storedConversations, (key, value) => {
      if (key === 'timestamp') return new Date(value);
      return value;
    }) : MOCK_CONVERSATIONS);
  }

  getConversationsForUser(userId: string) {
    return computed(() => this.conversations().filter(c => c.participantIds.includes(userId)));
  }

  createConversation(currentUser: User, recipients: User[], title: string, isGroup: boolean = false): Conversation {
    // For 1-1, check if a conversation already exists
    if (!isGroup && recipients.length === 1) {
      const targetUser = recipients[0];
      const existingConversation = this.conversations().find(c =>
        !c.isGroup &&
        c.participantIds.length === 2 &&
        c.participantIds.includes(currentUser.id) &&
        c.participantIds.includes(targetUser.id)
      );
      if (existingConversation) {
        return existingConversation;
      }
    }
    const allParticipants = [currentUser, ...recipients];
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title,
      ownerId: currentUser.id,
      participantIds: allParticipants.map(u => u.id),
      participants: allParticipants.map(u => ({ id: u.id, name: u.name, role: u.role })),
      messages: [],
      isGroup,
    };
    this.conversations.update(convs => [...convs, newConversation]);
    this.saveToLocalStorage();
    return newConversation;
  }
  joinConversation(conversationId: string, user: User): void {
    this.conversations.update(convs => {
      const conv = convs.find(c => c.id === conversationId);
      if (conv && !conv.participantIds.includes(user.id)) {
        conv.participantIds.push(user.id);
        conv.participants.push({ id: user.id, name: user.name, role: user.role });
      }
      return [...convs];
    });
    this.saveToLocalStorage();
  }

  sendMessage(conversationId: string, senderId: string, text: string): void {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId,
      text,
      timestamp: new Date(),
    };

    this.conversations.update(convs => {
      const conversation = convs.find(c => c.id === conversationId);
      if (conversation) {
        // Create a new array for messages to ensure change detection
        conversation.messages = [...conversation.messages, newMessage];
      }
      return [...convs];
    });

    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.conversationsKey, JSON.stringify(this.conversations()));
  }
}