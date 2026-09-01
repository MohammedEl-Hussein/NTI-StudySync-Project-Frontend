import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.css']
})
export class TaskCreateComponent implements OnInit {
  taskForm!: FormGroup;
  roomId: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || this.route.snapshot.paramMap.get('id') || '';
    const initialSection = this.route.snapshot.queryParamMap.get('section') || '';

    this.taskForm = this.fb.group({
      section: [initialSection, Validators.required],
      title: ['', Validators.required],
      description: [''],
      order: [1, [Validators.required, Validators.min(1)]],
      dueDate: ['']
    });
  }

  save(): void {
    if (this.taskForm.invalid) {
      alert('Please fill in all required fields (Section, Title, Order).');
      return;
    }

    this.loading = true;
    const taskData = {
      ...this.taskForm.value,
      roomId: this.roomId
    };

    this.taskService.createTask(taskData).subscribe({
      next: () => {
        this.loading = false;
        alert('Task created successfully!');
        this.router.navigate(['/rooms', this.roomId]);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error creating task:', err);
        alert(err.error?.message || 'Failed to create task.');
      }
    });
  }
}
