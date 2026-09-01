import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../../core/services/user.service';
import { RoomService } from '../../services/room.service';
import { ProgressService } from '../../core/services/progress.service';
import { TaskCompletionService } from '../../core/services/task-completion.service';
import { User, ProfileStats } from '../../core/models/user.model';
import { Room } from '../../core/models/room.model';
import { TaskCompletion } from '../../core/models/task.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public currentUser: User | null = null;
  public stats: ProfileStats = {
    joinedRooms: 0,
    completedTasks: 0,
    overallProgress: 0,
    totalTasks: 0,
    activeStreakDays: 0
  };
  
  public myRooms: Room[] = [];
  public recentCompletions: any[] = [];
  public loading = true;
  private sub = new Subscription();

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private progressService: ProgressService,
    private taskCompletionService: TaskCompletionService
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.userService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadDashboardData();
        }
      })
    );
  }

  loadDashboardData(): void {
    this.loading = true;

    const data$ = forkJoin({
      userStats: this.userService.getUserStats().pipe(catchError(() => of({} as ProfileStats))),
      rooms: this.roomService.getRooms().pipe(catchError(() => of({ data: [] }))),
      overallProg: this.progressService.getOverallProgress().pipe(catchError(() => of({} as any))),
      completions: this.taskCompletionService.getMyCompletions().pipe(catchError(() => of([])))
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

          const roomList = (rooms as any).data || (Array.isArray(rooms) ? rooms : []);
          const userId = this.currentUser?._id || this.currentUser?.id;
          
          this.myRooms = roomList.filter((room: any) => {
            const owner: any = room.ownerId;
            return owner === userId || owner?._id === userId;
          });

          // Sort completions descending by date and map room title
          this.recentCompletions = completions
            .sort((a: any, b: any) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())
            .slice(0, 5)
            .map((comp: any) => {
              // Try to find the roomId from the completion object or the populated task
              const roomId = comp.roomId?._id || comp.roomId || comp.task?.roomId || comp.taskId?.roomId;
              if (roomId) {
                const foundRoom = roomList.find((r: any) => r._id === roomId || r.id === roomId);
                if (foundRoom) {
                  comp.mappedRoomTitle = foundRoom.title;
                }
              }
              return comp;
            });

          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading dashboard data', err);
          this.loading = false;
        }
      })
    );
  }

  private calculateStreak(completions: any[]): number {
    if (!completions || completions.length === 0) return 0;
    
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

    if (firstDate.getTime() !== today.getTime() && firstDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let currentDate = firstDate;
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  getMembersCount(room: any): number {
    if (Array.isArray(room?.members)) {
      return room.members.length;
    }
    return typeof room?.members === 'number' ? room.members : 1;
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}