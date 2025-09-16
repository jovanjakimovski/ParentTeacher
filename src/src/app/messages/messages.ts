import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  WritableSignal,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../auth.service';
import { MessageService, Conversation, Message } from '../message.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css'],
})
export class MessagesComponent implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  currentUser: Signal<User | null> = this.authService.currentUser;
  conversations: Signal<Conversation[]> = signal([]);

  selectedConversation: WritableSignal<Conversation | null> = signal(null);
  newMessageText = signal('');

  // State for creating a new conversation
  isCreatingConversation = signal(false);
  availableRecipients = signal<User[]>([]);
  recipientRole = signal<'Teacher' | 'Parent' | ''>('');
  selectedRecipientId = signal<string | null>(null);
  conversationTitle = signal('');
  initialMessage = signal('');

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.conversations = this.messageService.getConversationsForUser(user.id);
      if (user.role === 'Parent') {
        this.availableRecipients.set(this.authService.getTeachers());
        this.recipientRole.set('Teacher');
      } else if (user.role === 'Teacher') {
        this.availableRecipients.set(this.authService.getParents());
        this.recipientRole.set('Parent');
      }
    }

    this.route.paramMap.subscribe((params) => {
      const conversationId = params.get('id');
      if (conversationId) {
        const conversationToSelect = this.conversations().find(
          (c) => c.id === conversationId
        );
        if (conversationToSelect) {
          this.selectConversation(conversationToSelect);
        }
      }
    });
  }

  selectConversation(conversation: Conversation): void {
    this.isCreatingConversation.set(false);
    this.selectedConversation.set(conversation);
  }

  joinConversation(conversation: Conversation): void {
    const user = this.currentUser();
    if (user && !conversation.participantIds.includes(user.id)) {
      this.messageService.joinConversation(conversation.id, user);
      // Refresh the selected conversation
      const updated = this.conversations().find(c => c.id === conversation.id);
      if (updated) this.selectedConversation.set(updated);
    }
  }

  sendMessage(): void {
    const conversation = this.selectedConversation();
    const user = this.currentUser();
    const text = this.newMessageText().trim();

    if (conversation && user && text) {
      this.messageService.sendMessage(conversation.id, user.id, text)
      this.newMessageText.set('');
    }
  }

  startNewConversation(): void {
    this.isCreatingConversation.set(true);
    this.selectedConversation.set(null); // Deselect any active conversation
  }

  cancelNewConversation(): void {
    this.isCreatingConversation.set(false);
    this.selectedRecipientId.set(null);
    this.conversationTitle.set('');
    this.initialMessage.set('');
  }

  createConversation(): void {
    const currentUser = this.currentUser();
    const recipientId = this.selectedRecipientId();
    const title = this.conversationTitle().trim();
    const initialText = this.initialMessage().trim();

    if (!currentUser || !recipientId || !title || !initialText) return;

    // For group, allow multiple recipients in future
    const recipients = this.availableRecipients().filter(t => t.id === recipientId);
    if (recipients.length === 0) return;

    const conversation = this.messageService.createConversation(currentUser, recipients, title, recipients.length > 1);
    this.messageService.sendMessage(conversation.id, currentUser.id, initialText);

    this.cancelNewConversation();
    this.selectConversation(conversation);
  }

  getParticipant(conversation: Conversation): Pick<User, 'id' | 'name' | 'role'> | undefined {
    const user = this.currentUser();
    if (!user) return undefined;
    // For group, return undefined (not used in UI for group)
    if (conversation.isGroup) return undefined;
    return conversation.participants.find(p => p.id !== user.id);
  }

  getLastMessageDetails(conv: Conversation): { senderName: string; text: string } | null {
    if (conv.messages.length === 0) {
      return null;
    }
    const lastMessage = conv.messages[conv.messages.length - 1];
    const sender = conv.participants.find((p) => p.id === lastMessage.senderId);
    return {
      senderName: sender?.name ?? 'Unknown',
      text: lastMessage.text,
    };
  }
}