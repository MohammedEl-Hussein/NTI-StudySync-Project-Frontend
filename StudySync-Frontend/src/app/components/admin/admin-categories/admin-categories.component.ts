import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Category } from '../../../core/models/admin.model';

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
    private router: Router
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

    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      this.adminService.deleteCategory(id).subscribe({
        next: () => {
          alert('Category deleted successfully.');
          this.loadCategories();
        },
        error: (err) => {
          console.error('Error deleting category:', err);
          alert('Failed to delete category.');
        }
      });
    }
  }
}
