import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

function dateValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    return { dateInvalid: true };
  }
  return null;
}

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent implements OnInit {
  roomForm!: FormGroup;
  step = 1;
  categories: Category[] = [];
  
  isCategoryDropdownOpen = false;
  newCategoryName = '';
  editingCategoryId: string | null = null;
  editingCategoryName = '';
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.isAdmin = user.role === 'admin';

    this.loadCategories();

    this.roomForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      categoryIds: [[], Validators.required],
      level: ['Beginner', Validators.required],
      maxMembers: [10, [Validators.required, Validators.min(2), Validators.max(150)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      meetingURL: ['']
    }, { validators: dateValidator });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(res => this.categories = res.categories);
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  toggleCategorySelection(categoryId: string, event: Event): void {
    event.stopPropagation();
    const current = this.roomForm.get('categoryIds')?.value as string[];
    if (current.includes(categoryId)) {
      this.roomForm.patchValue({ categoryIds: current.filter(id => id !== categoryId) });
    } else {
      this.roomForm.patchValue({ categoryIds: [...current, categoryId] });
    }
  }

  isSelected(categoryId: string): boolean {
    return (this.roomForm.get('categoryIds')?.value as string[]).includes(categoryId);
  }

  getCategoryName(id: string): string {
    return this.categories.find(c => c._id === id)?.name || '';
  }

  addCategory(event: Event): void {
    event.stopPropagation();
    if (!this.newCategoryName.trim()) return;
    this.categoryService.createCategory(this.newCategoryName.trim()).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.loadCategories();
      },
      error: (err) => alert(err.error?.message || 'Error creating category')
    });
  }

  startEditCategory(category: Category, event: Event): void {
    event.stopPropagation();
    this.editingCategoryId = category._id;
    this.editingCategoryName = category.name;
  }

  saveCategory(id: string, event: Event): void {
    event.stopPropagation();
    if (!this.editingCategoryName.trim()) return;
    this.categoryService.updateCategory(id, this.editingCategoryName.trim()).subscribe({
      next: () => {
        this.editingCategoryId = null;
        this.loadCategories();
      },
      error: (err) => alert(err.error?.message || 'Error updating category')
    });
  }

  cancelEdit(event: Event): void {
    event.stopPropagation();
    this.editingCategoryId = null;
  }

  deleteCategory(id: string, event: Event): void {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this category?')) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        // Remove from selected if deleted
        const current = this.roomForm.get('categoryIds')?.value as string[];
        if (current.includes(id)) {
          this.roomForm.patchValue({ categoryIds: current.filter(cId => cId !== id) });
        }
        this.loadCategories();
      },
      error: (err) => alert(err.error?.message || 'Error deleting category')
    });
  }

  next(): void {
    if (this.step < 5) this.step++;
  }

  previous(): void {
    if (this.step > 1) this.step--;
  }

  submitRoom(): void {
    if (this.roomForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    this.roomService.createRoom(this.roomForm.value).subscribe({
      next: (res) => this.router.navigate(['/rooms', res.data._id]),
      error: (err) => alert(err.error?.message || 'Error creating room')
    });
  }
}
