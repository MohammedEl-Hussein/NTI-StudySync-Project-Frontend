import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PopupService } from '../../../core/services/popup.service';

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.css']
})
export class CreateCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private popupService: PopupService
  ) { }

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.adminService.createCategory(this.categoryForm.value).subscribe({
      next: () => {
        this.popupService.toastSuccess('Category created successfully!');
        this.router.navigate(['/admin/categories']);
      },
      error: (err) => {
        console.error('Error creating category:', err);
        this.popupService.toastError('Failed to create category.');
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/categories']);
  }
}
