import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Message } from '../../../models/message.model';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.css']
})
export class MessageItemComponent {
  @Input() message!: Message;
  @Input() currentUserId: string = '';
  @Input() isRoomOwnerOrAdmin: boolean = false;
  @Input() room: Room | any;
  @Input() isFirstInGroup: boolean = true;
  @Input() isLastInGroup: boolean = true;

  @Output() edit = new EventEmitter<Message>();
  @Output() delete = new EventEmitter<Message>();

  copied = false;

  get isMine(): boolean {
    if (!this.message || !this.currentUserId) return false;
    const msgUserId = this.message.userId?._id || this.message.userId?.id || this.message.userId;
    return Boolean(msgUserId && msgUserId === this.currentUserId);
  }

  get canEdit(): boolean {
    return this.isMine;
  }

  get canDelete(): boolean {
    return this.isMine || this.isRoomOwnerOrAdmin;
  }

  get senderName(): string {
    if (this.isMine) return 'You';
    return this.message.user?.name || (typeof this.message.userId === 'object' ? (this.message.userId as any)?.name : null) || 'Member';
  }

  get avatarInitial(): string {
    const name = this.message.user?.name || (typeof this.message.userId === 'object' ? (this.message.userId as any)?.name : null) || (this.isMine ? 'Y' : 'M');
    return name.charAt(0).toUpperCase();
  }

  get isEdited(): boolean {
    if (this.message.isEdited) return true;
    if (this.message.updatedAt && this.message.createdAt) {
      const created = new Date(this.message.createdAt).getTime();
      const updated = new Date(this.message.updatedAt).getTime();
      return updated - created > 2000;
    }
    return false;
  }

  get messageDate(): Date {
    if (this.message?.createdAt) {
      const d = new Date(this.message.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    if (this.message?.updatedAt) {
      const d = new Date(this.message.updatedAt);
      if (!isNaN(d.getTime())) return d;
    }
    if (this.message?._id && typeof this.message._id === 'string' && this.message._id.length === 24 && /^[0-9a-fA-F]{24}$/.test(this.message._id)) {
      try {
        const sec = parseInt(this.message._id.substring(0, 8), 16);
        const d = new Date(sec * 1000);
        if (!isNaN(d.getTime()) && d.getFullYear() >= 2020) return d;
      } catch {}
    }
    return new Date();
  }

  get formattedTime(): string {
    try {
      const d = this.messageDate;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  get formattedFullDate(): string {
    try {
      const d = this.messageDate;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + this.formattedTime;
    } catch {
      return '';
    }
  }

  get isRoomHost(): boolean {
    const msgUserId = this.message.userId?._id || this.message.userId?.id || this.message.userId;
    const hostId = this.room?.ownerId?._id || this.room?.ownerId?.id || this.room?.ownerId;
    return Boolean(msgUserId && hostId && msgUserId === hostId);
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

  onEdit(): void {
    this.edit.emit(this.message);
  }

  onDelete(): void {
    this.delete.emit(this.message);
  }

  copyContent(): void {
    if (this.message?.content) {
      navigator.clipboard.writeText(this.message.content).then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      });
    }
  }
}
