import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ProgressService } from '../../core/services/progress.service';
import { RoomService } from '../../services/room.service';
import { TaskService } from '../../core/services/task.service';
import { TaskCompletionService } from '../../core/services/task-completion.service';
import { RoomProgressData } from '../../core/models/progress.model';
import { Room } from '../../models/room.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-room-progress',
  templateUrl: './room-progress.component.html',
  styleUrls: ['./room-progress.component.css']
})
export class RoomProgressComponent implements OnInit, OnChanges {
  @Input() roomId = '';

  public roomData: RoomProgressData | null = null;
  public joinedRooms: Room[] = [];
  public selectedRoomId = '';
  public currentRoom: Room | null = null;
  public loading = false;

  constructor(
    private progressService: ProgressService,
    private roomService: RoomService,
    private taskService: TaskService,
    private taskCompletionService: TaskCompletionService
  ) {}

  ngOnInit(): void {
    this.selectedRoomId = this.roomId || '';
    this.loadJoinedRooms();
    if (this.selectedRoomId) {
      this.loadRoomProgress(this.selectedRoomId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomId'] && !changes['roomId'].firstChange) {
      this.selectedRoomId = this.roomId;
      this.loadRoomProgress(this.selectedRoomId);
    }
  }

  public loadJoinedRooms(): void {
    forkJoin({
      progresses: this.progressService.getAllProgress(),
      rooms: this.roomService.getRooms()
    }).subscribe({
      next: (res: any) => {
        const allRooms = Array.isArray(res.rooms) ? res.rooms : (res.rooms?.data || []);
        const myRoomIds = res.progresses.map((p: any) => p.roomId);
        this.joinedRooms = allRooms.filter((r: Room) => myRoomIds.includes(r._id));
        this.currentRoom = this.joinedRooms.find(r => r._id === this.selectedRoomId) || null;
      },
      error: (err) => console.error('Error fetching joined rooms for progress:', err)
    });
  }

  public onRoomChange(newRoomId: string): void {
    this.selectedRoomId = newRoomId;
    this.currentRoom = this.joinedRooms.find(r => r._id === newRoomId) || null;
    this.loadRoomProgress(newRoomId);
  }

  /**
   * Calls API: GET /progresses/room/:roomId and calculates real progress from tasks
   */
  public loadRoomProgress(roomId: string): void {
    this.loading = true;
    
    forkJoin({
      progressData: this.progressService.getRoomProgress(roomId),
      tasks: this.taskService.getTasksByRoom(roomId),
      completions: this.taskCompletionService.getMyCompletions()
    }).subscribe({
      next: (res) => {
        const data = res.progressData;
        const tasks = res.tasks || [];
        const completions = res.completions || [];
        
        const completedTaskIds = new Set(completions.map((c: any) => {
          return typeof c.taskId === 'object' ? (c.taskId._id || c.taskId.id) : c.taskId;
        }));
        
        const sectionMap = new Map<string, { total: number, completed: number }>();
        let completedCount = 0;
        
        tasks.forEach(task => {
          const tId = task._id || task.id;
          const isCompleted = tId && completedTaskIds.has(tId);
          if (isCompleted) {
            completedCount++;
          }
          
          const sectionName = task.section || 'General Phase';
          if (!sectionMap.has(sectionName)) {
            sectionMap.set(sectionName, { total: 0, completed: 0 });
          }
          const secStats = sectionMap.get(sectionName)!;
          secStats.total++;
          if (isCompleted) {
            secStats.completed++;
          }
        });
        
        const sectionsData = Array.from(sectionMap.entries()).map(([title, stats]) => {
          const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
          return {
            section: title,
            completedTasks: stats.completed,
            totalTasks: stats.total,
            percentage: percentage,
            status: percentage >= 100 ? 'completed' : (percentage > 0 ? 'in-progress' : 'pending') as 'completed' | 'in-progress' | 'pending'
          };
        });
        
        const totalCount = tasks.length;
        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        this.roomData = {
          ...data,
          peers: data?.peers || [],
          completedTasks: completedCount,
          totalTasks: totalCount,
          overallProgress: percentage,
          sections: sectionsData
        } as RoomProgressData;
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error fetching progress for room ${roomId}:`, err);
        this.loading = false;
      }
    });
  }
}
