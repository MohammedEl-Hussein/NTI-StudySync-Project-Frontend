import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Message } from '../../../models/message.model';

@Component({
  selector: 'app-chat-members',
  templateUrl: './chat-members.component.html',
  styleUrls: ['./chat-members.component.css']
})
export class ChatMembersComponent {
  @Input() members: any[] = [];
  @Input() ownerId: any;
  @Input() adminIds: any[] = [];
  @Input() currentUserId: string = '';
  @Input() messages: Message[] = [];
  @Input() isOpen: boolean = true;

  @Output() close = new EventEmitter<void>();

  searchTerm: string = '';

  isMemberActive(member: any): boolean {
    if (!member) return false;

    const memId = member.userId?._id || member.userId?.id || member.userId || member._id || member.id;

    // 1. Current user viewing the room is active live
    if (this.currentUserId && memId && memId.toString() === this.currentUserId.toString()) {
      return true;
    }

    // 2. Explicit backend online flag
    if (member.isOnline === true || member.userId?.isOnline === true) return true;
    if (member.status === 'online' || member.status === 'active' ||
        member.userId?.status === 'online' || member.userId?.status === 'active') return true;
    if (member.status === 'offline' || member.userId?.status === 'offline') return false;

    // 3. Live activity from recent messages (within last 30 minutes)
    if (this.messages && this.messages.length > 0 && memId) {
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      const hasRecentMessage = this.messages.some((msg) => {
        const msgUserId = typeof msg.userId === 'object' && msg.userId !== null
          ? (msg.userId._id || msg.userId.id)
          : (msg.user?._id || msg.user?.id || msg.userId);

        if (msgUserId && msgUserId.toString() === memId.toString()) {
          const msgTime = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
          return msgTime > thirtyMinutesAgo;
        }
        return false;
      });

      if (hasRecentMessage) {
        return true;
      }
    }

    return false;
  }

  get filteredMembers(): any[] {
    if (!this.searchTerm.trim()) {
      return this.members;
    }
    const term = this.searchTerm.toLowerCase();
    return this.members.filter((m) => {
      const name = (m.userId?.name || m.name || '').toLowerCase();
      const email = (m.userId?.email || m.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }

  isOwner(member: any): boolean {
    const memId = member.userId?._id || member.userId?.id || member.userId || member._id;
    const ownId = this.ownerId?._id || this.ownerId?.id || this.ownerId;
    return Boolean(memId && ownId && memId === ownId);
  }

  isAdmin(member: any): boolean {
    if (this.isOwner(member)) return true;
    const memId = member.userId?._id || member.userId?.id || member.userId || member._id;
    return this.adminIds?.some((a) => {
      const aId = a?._id || a?.id || a;
      return aId === memId;
    });
  }

  isCurrentUser(member: any): boolean {
    const memId = member.userId?._id || member.userId?.id || member.userId || member._id;
    return Boolean(memId && this.currentUserId && memId === this.currentUserId);
  }

  getMemberName(member: any): string {
    return member.userId?.name || member.name || 'Room Member';
  }

  getMemberEmail(member: any): string {
    return member.userId?.email || member.email || '';
  }

  getAvatarInitial(member: any): string {
    const name = this.getMemberName(member);
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #4f46e5)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
      'linear-gradient(135deg, #3b82f6, #2563eb)'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash += name.charCodeAt(i);
    }
    return colors[hash % colors.length];
  }

  onClose(): void {
    this.close.emit();
  }
}
