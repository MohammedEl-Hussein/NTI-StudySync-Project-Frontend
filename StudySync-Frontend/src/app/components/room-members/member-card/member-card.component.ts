import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoomMember } from '../../../models/room-member.model';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent {
  @Input() member!: RoomMember | any;
  @Input() canManage: boolean = false;
  @Input() isOwner: boolean = false;
  @Input() currentUserId: string = '';

  @Output() toggleRole = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();

  get memberId(): string {
    return this.member?.userId?._id || this.member?.userId?.id || (typeof this.member?.userId === 'string' ? this.member.userId : '');
  }

  get memberName(): string {
    return this.member?.userId?.name || this.member?.name || 'Student';
  }

  get memberEmail(): string {
    return this.member?.userId?.email || this.member?.email || '';
  }

  get memberOrg(): string {
    return this.member?.userId?.organization || this.member?.userId?.department || this.member?.organization || 'Student';
  }

  get memberAvatar(): string {
    const name = this.memberName;
    return name.charAt(0).toUpperCase() || 'U';
  }

  get role(): string {
    return (this.member?.role || (this.isOwner ? 'owner' : 'member')).toLowerCase();
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  get isRoomOwner(): boolean {
    return this.isOwner || this.role === 'owner';
  }

  get isSelf(): boolean {
    return !!this.currentUserId && this.memberId === this.currentUserId;
  }

  onToggleRole(): void {
    this.toggleRole.emit(this.member);
  }

  onRemove(): void {
    this.remove.emit(this.member);
  }
}
