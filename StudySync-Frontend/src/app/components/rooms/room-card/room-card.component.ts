import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { Room } from '../../../models/room.model';
import { RoomService } from '../../../services/room.service';

@Component({
  selector: 'app-room-card',
  templateUrl: './room-card.component.html',
  styleUrls: ['./room-card.component.css']
})
export class RoomCardComponent implements OnInit {
  @Input() room!: Room | any; // allow any for the extra UI fields like memberCount, progress
  @Output() join = new EventEmitter<Room>();
  @Output() leave = new EventEmitter<Room>();
  @Output() deleted = new EventEmitter<string>();

  menuOpen = false;

  constructor(private roomService: RoomService) { }

  get isMember(): boolean {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = user.id || user._id || user.userId;

    if (userId) {
      const isOwner = this.room?.ownerId === userId || this.room?.ownerId?._id === userId;
      const inMembers = this.room?.members?.some((m: any) => m === userId || m?._id === userId);
      return isOwner || inMembers;
    }
    return false;
  }

  get isOwnerOrAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = user.id || user._id || user.userId;
    if (userId) {
      const isOwner = this.room?.ownerId === userId || this.room?.ownerId?._id === userId;
      const isSuperAdmin = user.role === 'admin';
      return isOwner || isSuperAdmin;
    }
    return false;
  }

  ngOnInit() {
    // Initialization if needed
  }

  get randomCover(): string {
    if (!this.room || !this.room._id) return 'assets/room-covers/cover_1.jpg';
    const numCovers = 4;
    let hash = 0;
    for (let i = 0; i < this.room._id.length; i++) {
      hash += this.room._id.charCodeAt(i);
    }
    const index = (hash % numCovers) + 1;
    return `assets/room-covers/cover_${index}.jpg`;
  }

  get displayMemberCount(): number {
    if (this.room?.memberCount !== undefined && this.room?.memberCount !== null) {
      return this.room.memberCount;
    }
    // Fallback: If we don't have the real count from backend, but user is member, it's at least 1.
    return this.isMember ? 1 : 0;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close menu if clicking outside
    this.menuOpen = false;
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  deleteRoom(event: Event): void {
    event.stopPropagation();
    this.menuOpen = false;

    if (confirm(`Are you sure you want to delete "${this.room.title}"? This will permanently delete all related chat messages, tasks, and member progress.`)) {
      this.roomService.deleteRoom(this.room._id).subscribe({
        next: () => {
          this.deleted.emit(this.room._id);
        },
        error: (err) => alert(err.error?.message || 'Error deleting room')
      });
    }
  }

  joinRoom(room: Room): void {
    this.join.emit(room);
  }
}
