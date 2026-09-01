import { Component, EventEmitter, Input, Output } from '@angular/core';

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
  @Input() isOpen: boolean = true;

  @Output() close = new EventEmitter<void>();

  searchTerm: string = '';

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
