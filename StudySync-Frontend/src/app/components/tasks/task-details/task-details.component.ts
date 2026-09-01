import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { TaskCompletionService } from '../../../core/services/task-completion.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {
  taskId: string = '';
  task: Task | null = null;
  loading: boolean = true;
  isCompleted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private taskCompletionService: TaskCompletionService
  ) {}

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    if (this.taskId) {
      this.loadTask();
    }
  }

  loadTask(): void {
    this.loading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (t) => {
        this.task = t;
        this.loading = false;
        this.checkCompletion();
      },
      error: (err) => {
        console.error('Error loading task details:', err);
        this.loading = false;
      }
    });
  }

  checkCompletion(): void {
    if (!this.taskId) return;
    this.taskCompletionService.getMyCompletions().subscribe({
      next: (completions) => {
        this.isCompleted = completions.some(c => c.taskId === this.taskId);
        if (this.task) {
          this.task.isCompleted = this.isCompleted;
        }
      }
    });
  }

  toggleCompletion(): void {
    if (!this.taskId || !this.task) return;
    if (this.isCompleted) {
      this.taskCompletionService.uncompleteTask(this.taskId).subscribe({
        next: () => {
          this.isCompleted = false;
          if (this.task) this.task.isCompleted = false;
        }
      });
    } else {
      this.taskCompletionService.completeTask(this.taskId).subscribe({
        next: () => {
          this.isCompleted = true;
          if (this.task) this.task.isCompleted = true;
        }
      });
    }
  }

  deleteTask(): void {
    if (!this.taskId) return;
    if (confirm('Are you sure you want to delete this task?')) {
      const roomId = this.task?.roomId;
      this.taskService.deleteTask(this.taskId).subscribe({
        next: () => {
          alert('Task deleted successfully.');
          if (roomId) {
            this.router.navigate(['/rooms', roomId, 'study-plan']);
          } else {
            this.router.navigate(['/rooms']);
          }
        }
      });
    }
  }
}
