import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { TaskCompletionService } from '../../../core/services/task-completion.service';
import { RoomService } from '../../../core/services/room.service';
import { Task, TaskCompletion } from '../../../core/models/task.model';
import { Room } from '../../../core/models/room.model';

export interface SectionGroup {
  name: string;
  tasks: Task[];
  expanded: boolean;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

@Component({
  selector: 'app-study-plan',
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.css']
})
export class StudyPlanComponent implements OnInit {
  roomId: string = '';
  roomTitle: string = 'Study Room Plan';
  room: Room | null = null;
  tasks: Task[] = [];
  completedTaskIds: Set<string> = new Set();
  sectionGroups: SectionGroup[] = [];
  
  // Filters
  searchQuery: string = '';
  selectedSection: string = '';
  statusFilter: 'all' | 'completed' | 'incomplete' = 'all';
  sectionsList: string[] = [];

  loading: boolean = true;
  overallProgress: number = 0;
  totalTasksCount: number = 0;
  completedTasksCount: number = 0;

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
    private router: Router,
    private taskService: TaskService,
    private taskCompletionService: TaskCompletionService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('roomId') || '';
    if (this.roomId) {
      this.loadRoomDetails();
      this.loadTasksAndCompletions();
    } else {
      this.loading = false;
    }
  }

  getValidTaskId(task: any): string | null {
    if (!task) return null;
    const rawId = task._id || task.id;
    if (!rawId) return null;
    const idStr = typeof rawId === 'object' ? String(rawId._id || rawId) : String(rawId).trim();
    return idStr.length > 0 ? idStr : null;
  }

  loadRoomDetails(): void {
    this.roomService.getRoomById(this.roomId).subscribe({
      next: (room) => {
        if (room) {
          this.room = room;
          this.roomTitle = room.title || 'Study Room Plan';
        }
      }
    });
  }

  loadTasksAndCompletions(): void {
    this.loading = true;
    this.taskService.getTasksByRoom(this.roomId).subscribe({
      next: (tasks) => {
        this.tasks = tasks || [];
        this.loadCompletions();
      },
      error: (err) => {
        console.error('Error fetching tasks:', err);
        this.loading = false;
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

        this.applyTaskCompletionStatus();
        this.processSections();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching completions:', err);
        this.applyTaskCompletionStatus();
        this.processSections();
        this.loading = false;
      }
    });
  }

  applyTaskCompletionStatus(): void {
    this.tasks.forEach(task => {
      const taskId = this.getValidTaskId(task);
      task.isCompleted = taskId ? this.completedTaskIds.has(taskId) : !!task.completed;
      task.completed = task.isCompleted;
    });

    this.totalTasksCount = this.tasks.length;
    this.completedTasksCount = this.tasks.filter(t => t.isCompleted).length;
    this.overallProgress = this.totalTasksCount > 0 
      ? Math.round((this.completedTasksCount / this.totalTasksCount) * 100) 
      : 0;
  }

  processSections(): void {
    const groupMap = new Map<string, Task[]>();
    const sectionsSet = new Set<string>();

    this.filteredTasks().forEach(task => {
      const secName = task.section || 'General Phase';
      sectionsSet.add(secName);
      if (!groupMap.has(secName)) {
        groupMap.set(secName, []);
      }
      groupMap.get(secName)!.push(task);
    });

    this.sectionsList = Array.from(new Set(this.tasks.map(t => t.section || 'General Phase')));

    this.sectionGroups = Array.from(groupMap.entries()).map(([name, tasks]) => {
      const sortedTasks = tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      const done = sortedTasks.filter(t => t.isCompleted).length;
      const total = sortedTasks.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        name,
        tasks: sortedTasks,
        expanded: true,
        completedCount: done,
        totalCount: total,
        percentage: pct
      };
    });
  }

  filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      const matchesSearch = !this.searchQuery || 
        task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesSection = !this.selectedSection || task.section === this.selectedSection;

      let matchesStatus = true;
      if (this.statusFilter === 'completed') {
        matchesStatus = !!task.isCompleted;
      } else if (this.statusFilter === 'incomplete') {
        matchesStatus = !task.isCompleted;
      }

      return matchesSearch && matchesSection && matchesStatus;
    });
  }

  toggleTaskCompletion(task: Task, event: Event): void {
    event.stopPropagation();
    const taskId = this.getValidTaskId(task);
    if (!taskId) return;

    const previousState = !!task.isCompleted;
    task.isCompleted = !previousState;
    task.completed = task.isCompleted;

    if (task.isCompleted) {
      this.completedTaskIds.add(taskId);
      this.taskCompletionService.completeTask(taskId).subscribe({
        next: () => this.updateStatsAndGroups(),
        error: (err) => {
          console.error('Error completing task:', err);
          if (err.error?.message?.includes('already completed')) {
            this.completedTaskIds.add(taskId);
            task.isCompleted = true;
            task.completed = true;
          } else {
            task.isCompleted = previousState;
            task.completed = previousState;
            this.completedTaskIds.delete(taskId);
          }
          this.updateStatsAndGroups();
        }
      });
    } else {
      this.completedTaskIds.delete(taskId);
      this.taskCompletionService.uncompleteTask(taskId).subscribe({
        next: () => this.updateStatsAndGroups(),
        error: (err) => {
          console.error('Error uncompleting task:', err);
          task.isCompleted = previousState;
          task.completed = previousState;
          this.completedTaskIds.add(taskId);
          this.updateStatsAndGroups();
        }
      });
    }

    this.updateStatsAndGroups();
  }

  updateStatsAndGroups(): void {
    this.completedTasksCount = this.tasks.filter(t => t.isCompleted).length;
    this.overallProgress = this.totalTasksCount > 0 
      ? Math.round((this.completedTasksCount / this.totalTasksCount) * 100) 
      : 0;

    this.sectionGroups.forEach(group => {
      group.completedCount = group.tasks.filter(t => t.isCompleted).length;
      group.percentage = group.totalCount > 0 
        ? Math.round((group.completedCount / group.totalCount) * 100) 
        : 0;
    });
  }

  toggleSection(group: SectionGroup): void {
    group.expanded = !group.expanded;
  }

  openInlineAddForm(presetSection?: string): void {
    this.editingTaskId = null;
    this.showInlineAddForm = true;

    const defaultSec = presetSection || (this.sectionsList.length > 0 ? this.sectionsList[this.sectionsList.length - 1] : 'Week 1');
    const defaultOrder = this.tasks.length + 1;

    this.newTaskData = {
      section: defaultSec,
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
          this.tasks.push({ ...createdTask, isCompleted: false, completed: false });
          this.applyTaskCompletionStatus();
          this.processSections();
        }

        this.loadTasksAndCompletions();
      },
      error: (err) => {
        this.isSavingTask = false;
        alert(err.error?.message || 'Failed to create task.');
      }
    });
  }

  startInlineEdit(task: Task, event: Event): void {
    event.stopPropagation();
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

  cancelInlineEdit(event?: Event): void {
    if (event) event.stopPropagation();
    this.editingTaskId = null;
  }

  submitInlineEditTask(event: Event): void {
    event.stopPropagation();
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
        this.loadTasksAndCompletions();
      },
      error: (err) => {
        this.isSavingTask = false;
        alert(err.error?.message || 'Failed to update task.');
      }
    });
  }

  deleteTask(task: Task, event: Event): void {
    event.stopPropagation();
    const taskId = this.getValidTaskId(task);
    if (!taskId) return;

    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.editingTaskId = null;
          this.loadTasksAndCompletions();
        },
        error: (err) => alert('Failed to delete task: ' + (err.error?.message || err.message))
      });
    }
  }

  onFilterChange(): void {
    this.processSections();
  }
}
