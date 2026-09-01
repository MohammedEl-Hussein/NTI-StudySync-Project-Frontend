import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  modalOpen = false;
  editing: Category | null = null;
  categoryForm!: FormGroup;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchCategories();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  fetchCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories = res.categories,
      error: (err) => console.error(err)
    });
  }

  openCreate(): void {
    this.editing = null;
    this.categoryForm.reset();
    this.modalOpen = true;
  }

  edit(category: Category): void {
    this.editing = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
    this.modalOpen = true;
  }

  delete(category: Category): void {
    if (confirm(`Are you sure you want to delete ${category.name}?`)) {
      // NOTE: This assumes a deleteCategory method exists or will exist in the service.
      // If it doesn't exist yet, it's a placeholder.
      console.log('Delete logic goes here');
      // this.categoryService.deleteCategory(category._id).subscribe(() => this.fetchCategories());
    }
  }

  save(): void {
    if (this.categoryForm.invalid) return;

    if (this.editing) {
      console.log('Update logic goes here for', this.editing._id);
      // this.categoryService.updateCategory(this.editing._id, this.categoryForm.value).subscribe(() => {
      //   this.fetchCategories();
      //   this.modalOpen = false;
      // });
      this.modalOpen = false;
    } else {
      console.log('Create logic goes here');
      // this.categoryService.createCategory(this.categoryForm.value).subscribe(() => {
      //   this.fetchCategories();
      //   this.modalOpen = false;
      // });
      this.modalOpen = false;
    }
  }
}
