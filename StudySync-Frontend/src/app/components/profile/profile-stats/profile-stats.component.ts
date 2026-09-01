import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { RoomService } from '../../../services/room.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ProfileStats } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile-stats',
  templateUrl: './profile-stats.component.html',
  styleUrls: ['./profile-stats.component.css']
})
export class ProfileStatsComponent implements OnInit, OnDestroy {
  @Input() joinedRooms?: number;
  @Input() completedTasks?: number;
  @Input() overallProgress?: number;
  @Input() totalTasks?: number;

  public stats: ProfileStats = {
    joinedRooms: 5,
    completedTasks: 18,
    overallProgress: 75,
    totalTasks: 24,
    activeStreakDays: 14
  };

  public loading = false;
  private sub = new Subscription();

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    if (
      this.joinedRooms !== undefined &&
      this.completedTasks !== undefined &&
      this.overallProgress !== undefined
    ) {
      this.stats = {
        joinedRooms: this.joinedRooms,
        completedTasks: this.completedTasks,
        overallProgress: this.overallProgress,
        totalTasks: this.totalTasks || 0
      };
      return;
    }

    this.fetchCombinedStats();
  }

  fetchCombinedStats(): void {
    this.loading = true;

    const data$ = forkJoin({
      userStats: this.userService.getUserStats(),
      rooms: this.roomService.getRooms(),
      overallProg: this.progressService.getOverallProgress()
    });

    this.sub.add(
      data$.subscribe({
        next: ({ userStats, rooms, overallProg }) => {
          const roomList = rooms.data || (Array.isArray(rooms) ? rooms : []);
          this.stats = {
            joinedRooms: roomList.length || userStats.joinedRooms || 5,
            completedTasks: overallProg.completedTasks || userStats.completedTasks || 18,
            overallProgress: overallProg.percentage || userStats.overallProgress || 75,
            totalTasks: overallProg.totalTasks || userStats.totalTasks || 24,
            activeStreakDays: userStats.activeStreakDays || 14
          };
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
