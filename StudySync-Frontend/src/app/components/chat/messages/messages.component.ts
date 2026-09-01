import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../../../models/room.model';
import { RoomService } from '../../../services/room.service';

@Component({
  selector: 'app-messages-page',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesPageComponent implements OnInit {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  selectedRoom: Room | null = null;
  search: string = '';
  isLoading: boolean = true;
  currentUser: any = null;

  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (e) {}
    }

    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getRooms().subscribe({
      next: (res: any) => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        this.rooms = list;
        this.filterRooms();

        // Check if query param or route specified a room
        const preselectId = this.route.snapshot.queryParamMap.get('roomId');
        if (preselectId) {
          const matched = this.rooms.find((r) => r._id === preselectId);
          if (matched) {
            this.selectedRoom = matched;
          }
        } else if (this.rooms.length > 0) {
          this.selectedRoom = this.rooms[0];
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterRooms(): void {
    if (!this.search.trim()) {
      this.filteredRooms = this.rooms;
      return;
    }
    const query = this.search.toLowerCase();
    this.filteredRooms = this.rooms.filter(
      (r) =>
        r.title?.toLowerCase().includes(query) ||
        r.level?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
    );
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
  }

  getAvatarInitial(room: Room): string {
    return room.title ? room.title.charAt(0).toUpperCase() : 'R';
  }

  getAvatarColor(title: string): string {
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
    for (let i = 0; i < (title || '').length; i++) {
      hash += title.charCodeAt(i);
    }
    return colors[hash % colors.length];
  }
}
