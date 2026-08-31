import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-room-card',
  templateUrl: './room-card.component.html',
  styleUrls: ['./room-card.component.css']
})
export class RoomCardComponent {
  @Input() room!: Room | any; // allow any for the extra UI fields like memberCount, progress
  @Output() join = new EventEmitter<Room>();

  joinRoom(room: Room): void {
    this.join.emit(room);
  }
}
