import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../core/services/progress.service';
import { RoomService } from '../core/services/room.service';
import { OverallProgressData, SectionProgressItem, PeerProgressItem } from '../core/models/progress.model';
import { Room } from '../core/models/room.model';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  public activeTab: 'overview' | 'room' | 'sections' | 'management' = 'overview';

  public overallStats: OverallProgressData = {
    completedTasks: 44,
    remainingTasks: 12,
    totalTasks: 56,
    percentage: 78
  };

  public sectionList: SectionProgressItem[] = [];
  public peerList: PeerProgressItem[] = [];
  public rooms: Room[] = [];
  public selectedRoomId = 'room_01';
  public loading = false;

  constructor(
    private progressService: ProgressService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadAllProgressData();
  }

  public setTab(tab: 'overview' | 'room' | 'sections' | 'management'): void {
    this.activeTab = tab;
  }

  public loadAllProgressData(): void {
    this.loading = true;

    this.progressService.getOverallProgress().subscribe({
      next: (data) => (this.overallStats = data)
    });

    this.progressService.getSectionProgress().subscribe({
      next: (sections) => (this.sectionList = sections)
    });

    this.progressService.getPeerProgress().subscribe({
      next: (peers) => (this.peerList = peers)
    });

    this.roomService.getJoinedRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        if (rooms.length > 0) {
          this.selectedRoomId = rooms[0]._id || rooms[0].id || 'room_01';
        }
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
