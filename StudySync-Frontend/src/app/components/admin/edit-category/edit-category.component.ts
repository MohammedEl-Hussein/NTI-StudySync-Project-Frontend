import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PopupService } from '../../../core/services/popup.service';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.css']
})
export class EditCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  categoryId: string = '';
  loading: boolean = true;
  submitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private adminService: AdminService,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';
    this.initForm();
    if (this.categoryId) {
      this.loadCategory(this.categoryId);
    } else {
      this.loading = false;
    }
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadCategory(id: string): void {
    this.loading = true;
    this.adminService.getCategoryById(id).subscribe({
      next: (cat) => {
        if (cat) {
          this.categoryForm.patchValue({
            name: cat.name,
            description: cat.description || ''
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching category:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.adminService.updateCategory(this.categoryId, this.categoryForm.value).subscribe({
      next: () => {
        this.popupService.toastSuccess('Category updated successfully!');
        this.router.navigate(['/admin/categories']);
      },
      error: (err) => {
        console.error('Error updating category:', err);
        this.popupService.toastError('Failed to update category.');
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/categories']);
  }
}
