import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { PopupService } from '../../../core/services/popup.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  roomId: string = '';
  tasks: Task[] = [];
  search: string = '';
  section: string = '';
  sections: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || this.route.snapshot.paramMap.get('id') || '';
    if (this.roomId) {
      this.loadTasks();
    }
  }

  loadTasks(): void {
    this.taskService.getTasksByRoom(this.roomId).subscribe({
      next: (tasks) => {
        this.tasks = tasks || [];
        this.sections = Array.from(new Set(this.tasks.map(t => t.section).filter(Boolean)));
      },
      error: (err) => console.error('Error loading tasks:', err)
    });
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(t => {
      const matchSearch = !this.search || t.title.toLowerCase().includes(this.search.toLowerCase());
      const matchSec = !this.section || t.section === this.section;
      return matchSearch && matchSec;
    });
  }

  deleteTask(task: Task): void {
    const taskId = task._id || task.id;
    if (!taskId) return;
    
    this.popupService.confirm(`Are you sure you want to delete task "${task.title}"?`).subscribe(confirmed => {
      if (confirmed) {
        this.taskService.deleteTask(taskId).subscribe({
          next: () => {
            this.tasks = this.tasks.filter(t => (t._id || t.id) !== taskId);
            this.popupService.toastSuccess('Task deleted successfully!');
          },
          error: (err) => this.popupService.toastError('Failed to delete task: ' + (err.error?.message || err.message))
        });
      }
    });
  }
}
