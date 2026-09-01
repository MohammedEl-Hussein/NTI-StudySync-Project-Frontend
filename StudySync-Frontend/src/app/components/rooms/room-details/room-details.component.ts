import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { TaskService } from '../../../core/services/task.service';
import { TaskCompletionService } from '../../../core/services/task-completion.service';
import { Task, TaskCompletion } from '../../../core/models/task.model';

@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.css']
})
export class RoomDetailsComponent implements OnInit {
  room: any;
  roomId: string = '';
  isLoading = true;
  error = '';
  tab = 'overview';
  memberCount = 0;
  taskCount = 0;
  completedTaskCount = 0;
  progress = 0;
  phases: any[] = [];
  isOwner = false;
  tasksList: Task[] = [];
  completedTaskIds: Set<string> = new Set();

  // Inline Task Creation State
  showInlineAddForm: boolean = false;
  isSavingTask: boolean = false;
  newTaskData: Partial<Task> = {
    section: '',
    title: '',
    description: '',
    order: 1,
    dueDate: ''
  };

  // Inline Task Editing State
  editingTaskId: string | null = null;
  editTaskData: Partial<Task> = {
    section: '',
    title: '',
    description: '',
    order: 1,
    dueDate: ''
  };

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private taskService: TaskService,
    private taskCompletionService: TaskCompletionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.roomId = id;
      this.fetchRoomDetails(id);
      this.loadRoomTasks(id);
    }
  }

  getValidTaskId(task: any): string | null {
    if (!task) return null;
    const rawId = task._id || task.id;
    if (!rawId) return null;
    const idStr = typeof rawId === 'object' ? String(rawId._id || rawId) : String(rawId).trim();
    return idStr.length > 0 ? idStr : null;
  }

  fetchRoomDetails(id: string): void {
    this.roomService.getRoomById(id).subscribe({
      next: (res) => {
        this.room = res.data;
        
        if (!this.room) {
          this.error = 'Room not found';
          this.isLoading = false;
          return;
        }

        this.roomService.getRoomMembers(id).subscribe({
          next: (memRes) => {
            const members = memRes.members || [];
            this.memberCount = members.length;
            this.room.members = members.map((m: any) => m.userId?._id || m.userId);

            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userId = user.id || user._id || user.userId;
            
            this.isOwner = this.room?.ownerId === userId || this.room?.ownerId?._id === userId;
          },
          error: () => {
            this.memberCount = 0;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load room details';
        this.isLoading = false;
      }
    });
  }

  loadRoomTasks(roomId: string): void {
    this.taskService.getTasksByRoom(roomId).subscribe({
      next: (tasks) => {
        console.log('Room Tasks fetched from MongoDB:', tasks);
        this.tasksList = tasks || [];
        this.loadCompletions();
      },
      error: (err) => {
        console.error('Failed to load room tasks:', err);
        this.tasksList = [];
        this.processTasksAndPhases();
        this.isLoading = false;
      }
    });
  }

  loadCompletions(): void {
    this.taskCompletionService.getMyCompletions().subscribe({
      next: (completions: any[]) => {
        this.completedTaskIds.clear();
        (completions || []).forEach(c => {
          if (c.taskId) {
            const tId = typeof c.taskId === 'object' ? (c.taskId._id || c.taskId.id) : c.taskId;
            if (tId) {
              this.completedTaskIds.add(String(tId));
            }
          }
        });
        console.log('Loaded completed task IDs:', Array.from(this.completedTaskIds));
        this.processTasksAndPhases();
        this.isLoading = false;
      },
      error: (err) => {
        console.warn('Could not load task completions:', err);
        this.processTasksAndPhases();
        this.isLoading = false;
      }
    });
  }

  processTasksAndPhases(): void {
    this.taskCount = this.tasksList.length;
    this.completedTaskCount = 0;

    this.tasksList.forEach(t => {
      const taskId = this.getValidTaskId(t);
      t.isCompleted = taskId ? this.completedTaskIds.has(taskId) : !!t.completed;
      t.completed = t.isCompleted;
      if (t.isCompleted) {
        this.completedTaskCount++;
      }
    });

    this.progress = this.taskCount > 0 
      ? Math.round((this.completedTaskCount / this.taskCount) * 100) 
      : 0;

    // Group tasks into phases/sections
    const phaseMap = new Map<string, Task[]>();
    this.tasksList.forEach(t => {
      const sec = (t.section && t.section.trim()) ? t.section.trim() : 'General Phase';
      if (!phaseMap.has(sec)) {
        phaseMap.set(sec, []);
      }
      phaseMap.get(sec)!.push(t);
    });

    this.phases = Array.from(phaseMap.entries()).map(([section, tasks]) => {
      const sorted = tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      const completed = sorted.filter(t => t.isCompleted).length;
      return {
        section,
        completed,
        total: sorted.length,
        tasks: sorted
      };
    });

    console.log('Processed Room Details Phases:', this.phases);
  }

  toggleTask(task: any): void {
    const taskId = this.getValidTaskId(task);
    if (!taskId) return;

    const previousState = !!task.completed;
    task.completed = !previousState;
    task.isCompleted = task.completed;

    if (task.completed) {
      this.completedTaskIds.add(taskId);
      this.taskCompletionService.completeTask(taskId).subscribe({
        next: () => this.processTasksAndPhases(),
        error: (err) => {
          console.error('Failed to complete task in backend:', err);
          if (err.error?.message?.includes('already completed')) {
            this.completedTaskIds.add(taskId);
            task.completed = true;
            task.isCompleted = true;
          } else {
            task.completed = previousState;
            task.isCompleted = previousState;
            this.completedTaskIds.delete(taskId);
          }
          this.processTasksAndPhases();
        }
      });
    } else {
      this.completedTaskIds.delete(taskId);
      this.taskCompletionService.uncompleteTask(taskId).subscribe({
        next: () => this.processTasksAndPhases(),
        error: (err) => {
          console.error('Failed to uncomplete task in backend:', err);
          task.completed = previousState;
          task.isCompleted = previousState;
          this.completedTaskIds.add(taskId);
          this.processTasksAndPhases();
        }
      });
    }
  }

  openInlineAddForm(presetSection?: string): void {
    this.editingTaskId = null;
    this.showInlineAddForm = true;
    
    const defaultSection = presetSection || (this.phases.length > 0 ? this.phases[this.phases.length - 1].section : 'Week 1');
    const defaultOrder = this.tasksList.length + 1;

    this.newTaskData = {
      section: defaultSection,
      title: '',
      description: '',
      order: defaultOrder,
      dueDate: ''
    };
  }

  cancelInlineAdd(): void {
    this.showInlineAddForm = false;
  }

  submitInlineAddTask(): void {
    if (!this.newTaskData.title || !this.newTaskData.title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    if (!this.newTaskData.section || !this.newTaskData.section.trim()) {
      alert('Please enter a Phase / Section name.');
      return;
    }

    this.isSavingTask = true;
    const payload = {
      ...this.newTaskData,
      roomId: this.roomId,
      title: this.newTaskData.title.trim(),
      section: this.newTaskData.section.trim()
    };

    this.taskService.createTask(payload).subscribe({
      next: (createdTask) => {
        this.isSavingTask = false;
        this.showInlineAddForm = false;
        
        if (createdTask) {
          this.tasksList.push({ ...createdTask, isCompleted: false, completed: false });
          this.processTasksAndPhases();
        }
        
        this.loadRoomTasks(this.roomId);
      },
      error: (err) => {
        this.isSavingTask = false;
        alert(err.error?.message || 'Failed to create task in database.');
      }
    });
  }

  startInlineEdit(task: Task): void {
    this.showInlineAddForm = false;
    const id = this.getValidTaskId(task);
    if (!id) return;
    this.editingTaskId = id;

    let formattedDueDate = '';
    if (task.dueDate) {
      formattedDueDate = new Date(task.dueDate).toISOString().substring(0, 10);
    }

    this.editTaskData = {
      section: task.section,
      title: task.title,
      description: task.description || '',
      order: task.order || 1,
      dueDate: formattedDueDate
    };
  }

  cancelInlineEdit(): void {
    this.editingTaskId = null;
  }

  submitInlineEditTask(): void {
    if (!this.editingTaskId) return;

    if (!this.editTaskData.title || !this.editTaskData.title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    this.isSavingTask = true;
    const payload = {
      ...this.editTaskData,
      title: this.editTaskData.title.trim(),
      section: this.editTaskData.section ? this.editTaskData.section.trim() : 'General'
    };

    this.taskService.updateTask(this.editingTaskId, payload).subscribe({
      next: () => {
        this.isSavingTask = false;
        this.editingTaskId = null;
        this.loadRoomTasks(this.roomId);
      },
      error: (err) => {
        this.isSavingTask = false;
        alert(err.error?.message || 'Failed to update task in database.');
      }
    });
  }

  deleteInlineTask(task: Task): void {
    const id = this.getValidTaskId(task);
    if (!id) return;

    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.isSavingTask = true;
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.isSavingTask = false;
          this.editingTaskId = null;
          this.loadRoomTasks(this.roomId);
        },
        error: (err) => {
          this.isSavingTask = false;
          alert('Failed to delete task: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}
