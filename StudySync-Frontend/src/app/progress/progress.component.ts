import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../core/services/progress.service';
import { RoomService } from '../services/room.service';
import { OverallProgressData, SectionProgressItem, PeerProgressItem } from '../core/models/progress.model';
import { Room } from '../models/room.model';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  public activeTab: 'overview' | 'room' | 'sections' = 'overview';

  public overallStats: OverallProgressData = {
    completedTasks: 44,
    remainingTasks: 12,
    totalTasks: 56,
    percentage: 78
  };

  public sectionList: SectionProgressItem[] = [];
  public peerList: PeerProgressItem[] = [];
  public rooms: Room[] = [];
  public selectedRoomId = '';
  public loading = false;

  constructor(
    private progressService: ProgressService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadAllProgressData();
  }

  public setTab(tab: 'overview' | 'room' | 'sections'): void {
    this.activeTab = tab;
  }

  public loadAllProgressData(): void {
    this.loading = true;

    this.progressService.getOverallProgress().subscribe({
      next: (data) => (this.overallStats = data)
    });

    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        progresses: this.progressService.getAllProgress(),
        rooms: this.roomService.getRooms()
      }).subscribe({
        next: (res: any) => {
          const allRooms = Array.isArray(res.rooms) ? res.rooms : (res.rooms?.data || []);
          const myRoomIds = res.progresses.map((p: any) => p.roomId);
          this.rooms = allRooms.filter((r: Room) => myRoomIds.includes(r._id));

          if (this.rooms.length > 0) {
            this.selectedRoomId = this.rooms[0]._id || '';
          }
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    });
  }
}
