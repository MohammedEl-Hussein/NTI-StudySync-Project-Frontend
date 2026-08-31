import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ProgressService } from '../../core/services/progress.service';
import { RoomService } from '../../core/services/room.service';
import { RoomProgressData, PeerProgressItem } from '../../core/models/progress.model';
import { Room } from '../../core/models/room.model';

@Component({
  selector: 'app-room-progress',
  templateUrl: './room-progress.component.html',
  styleUrls: ['./room-progress.component.css']
})
export class RoomProgressComponent implements OnInit, OnChanges {
  @Input() roomId = 'room_01';

  public roomData: RoomProgressData | null = null;
  public joinedRooms: Room[] = [];
  public selectedRoomId = 'room_01';
  public loading = false;

  constructor(
    private progressService: ProgressService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.selectedRoomId = this.roomId || 'room_01';
    this.loadJoinedRooms();
    this.loadRoomProgress(this.selectedRoomId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomId'] && !changes['roomId'].firstChange) {
      this.selectedRoomId = this.roomId;
      this.loadRoomProgress(this.selectedRoomId);
    }
  }

  public loadJoinedRooms(): void {
    this.roomService.getJoinedRooms().subscribe({
      next: (rooms) => {
        this.joinedRooms = rooms;
      },
      error: (err) => console.error('Error fetching joined rooms for progress:', err)
    });
  }

  public onRoomChange(newRoomId: string): void {
    this.selectedRoomId = newRoomId;
    this.loadRoomProgress(newRoomId);
  }

  /**
   * Calls API: GET /progresses/room/:roomId
   */
  public loadRoomProgress(roomId: string): void {
    this.loading = true;
    this.progressService.getRoomProgress(roomId).subscribe({
      next: (data: RoomProgressData) => {
        this.roomData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error fetching progress for room ${roomId}:`, err);
        this.loading = false;
      }
    });
  }
}
