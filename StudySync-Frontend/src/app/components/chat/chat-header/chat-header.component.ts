import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-chat-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.css']
})
export class ChatHeaderComponent {
  @Input() room: Room | any;
  @Input() memberCount: number = 0;
  @Input() onlineCount: number = 0;
  @Input() isMembersOpen: boolean = false;
  @Input() showBackBtn: boolean = true;

  @Output() toggleMembers = new EventEmitter<void>();
  @Output() backToRoom = new EventEmitter<void>();

  onToggleMembers(): void {
    this.toggleMembers.emit();
  }

  onBack(): void {
    this.backToRoom.emit();
  }
}
