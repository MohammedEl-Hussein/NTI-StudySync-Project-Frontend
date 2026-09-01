import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.css']
})
export class TaskEditComponent implements OnInit {
  taskForm!: FormGroup;
  taskId: string = '';
  roomId: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    
    this.taskForm = this.fb.group({
      section: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      order: [1, [Validators.required, Validators.min(1)]],
      dueDate: ['']
    });

    if (this.taskId) {
      this.loadTask();
    }
  }

  loadTask(): void {
    this.loading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task: Task) => {
        this.loading = false;
        if (task) {
          this.roomId = task.roomId;
          let formattedDueDate = '';
          if (task.dueDate) {
            formattedDueDate = new Date(task.dueDate).toISOString().substring(0, 10);
          }
          this.taskForm.patchValue({
            section: task.section,
            title: task.title,
            description: task.description,
            order: task.order || 1,
            dueDate: formattedDueDate
          });
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching task:', err);
      }
    });
  }

  save(): void {
    if (this.taskForm.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

    this.loading = true;
    this.taskService.updateTask(this.taskId, this.taskForm.value).subscribe({
      next: (updatedTask: Task) => {
        this.loading = false;
        alert('Task updated successfully!');
        const targetRoom = this.roomId || updatedTask.roomId;
        if (targetRoom) {
          this.router.navigate(['/rooms', targetRoom]);
        } else {
          this.router.navigate(['/rooms']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error updating task:', err);
        alert(err.error?.message || 'Failed to update task.');
      }
    });
  }

  delete(): void {
    if (!this.taskId) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.loading = true;
      this.taskService.deleteTask(this.taskId).subscribe({
        next: () => {
          this.loading = false;
          alert('Task deleted successfully.');
          if (this.roomId) {
            this.router.navigate(['/rooms', this.roomId]);
          } else {
            this.router.navigate(['/rooms']);
          }
        },
        error: (err) => {
          this.loading = false;
          alert('Failed to delete task: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}
