import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { RoomService } from '../../../services/room.service';
import { ProgressService } from '../../../core/services/progress.service';
import { TaskCompletionService } from '../../../core/services/task-completion.service';
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
    joinedRooms: 0,
    completedTasks: 0,
    overallProgress: 0,
    totalTasks: 0,
    activeStreakDays: 0
  };

  public loading = false;
  private sub = new Subscription();

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private progressService: ProgressService,
    private taskCompletionService: TaskCompletionService
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
      overallProg: this.progressService.getOverallProgress(),
      completions: this.taskCompletionService.getMyCompletions()
    });

    this.sub.add(
      data$.subscribe({
        next: ({ userStats, rooms, overallProg, completions }) => {
          this.stats = {
            joinedRooms: overallProg.joinedRooms ?? userStats.joinedRooms ?? 0,
            completedTasks: overallProg.completedTasks ?? userStats.completedTasks ?? 0,
            overallProgress: overallProg.percentage ?? userStats.overallProgress ?? 0,
            totalTasks: overallProg.totalTasks ?? userStats.totalTasks ?? 0,
            activeStreakDays: this.calculateStreak(completions)
          };
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      })
    );
  }

  private calculateStreak(completions: any[]): number {
    if (!completions || completions.length === 0) return 0;
    
    // Extract unique dates in YYYY-MM-DD format, sorted descending
    const dates = [...new Set(completions.map(c => {
      const d = new Date(c.completedAt || c.createdAt);
      return d.toISOString().split('T')[0];
    }))].sort().reverse();

    if (dates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const firstDate = new Date(dates[0]);
    firstDate.setHours(0, 0, 0, 0);

    // If the most recent completion is not today or yesterday, streak is broken
    if (firstDate.getTime() !== today.getTime() && firstDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let currentDate = firstDate;
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      d.setHours(0, 0, 0, 0);
      
      if (d.getTime() === currentDate.getTime()) {
        streak++;
        // Setup for the next expected date (1 day before)
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }
    return streak;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
