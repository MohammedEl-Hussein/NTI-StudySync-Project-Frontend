import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Category } from '../../../core/models/admin.model';
import { PopupService } from '../../../core/services/popup.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  searchTerm: string = '';
  loading: boolean = true;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.adminService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.loading = false;
      }
    });
  }

  get filteredCategories(): Category[] {
    return this.categories.filter((c) =>
      !this.searchTerm ||
      c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  goToCreate(): void {
    this.router.navigate(['/admin/categories/create']);
  }

  goToEdit(cat: Category): void {
    const id = cat._id || cat.id;
    if (id) {
      this.router.navigate(['/admin/categories/edit', id]);
    }
  }

  deleteCategory(cat: Category): void {
    const id = cat._id || cat.id;
    if (!id) return;

    this.popupService.confirm(`Are you sure you want to delete category "${cat.name}"?`).subscribe(confirmed => {
      if (confirmed) {
        this.adminService.deleteCategory(id).subscribe({
          next: () => {
            this.popupService.toastSuccess('Category deleted successfully.');
            this.loadCategories();
          },
          error: (err) => {
            console.error('Error deleting category:', err);
            this.popupService.toastError('Failed to delete category.');
          }
        });
      }
    });
  }
}
