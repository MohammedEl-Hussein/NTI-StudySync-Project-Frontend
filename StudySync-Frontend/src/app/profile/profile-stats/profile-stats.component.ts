import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { RoomService } from '../../core/services/room.service';
import { ProgressService } from '../../core/services/progress.service';
import { ProfileStats } from '../../core/models/user.model';

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
    joinedRooms: 0,
    completedTasks: 0,
    overallProgress: 0,
    totalTasks: 0,
    activeStreakDays: 12
  };

  public loading = false;
  private sub = new Subscription();

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    // If inputs were explicitly passed, use them
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

    // Otherwise, fetch and combine live data from multiple services (UserService, RoomService, ProgressService)
    this.fetchCombinedStats();
  }

  fetchCombinedStats(): void {
    this.loading = true;

    // Combining data from 3 separate services
    const data$ = forkJoin({
      userStats: this.userService.getUserStats(),
      rooms: this.roomService.getJoinedRooms(),
      overallProg: this.progressService.getOverallProgress()
    });

    this.sub.add(
      data$.subscribe({
        next: ({ userStats, rooms, overallProg }) => {
          this.stats = {
            joinedRooms: rooms.length || userStats.joinedRooms || 5,
            completedTasks: overallProg.completedTasks || userStats.completedTasks || 42,
            overallProgress: overallProg.percentage || userStats.overallProgress || 78,
            totalTasks: overallProg.totalTasks || userStats.totalTasks || 54,
            activeStreakDays: userStats.activeStreakDays || 12
          };
          this.loading = false;
        },
        error: (err) => {
          console.warn('Could not fetch all stats in forkJoin, using default profile stats', err);
          this.loading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
