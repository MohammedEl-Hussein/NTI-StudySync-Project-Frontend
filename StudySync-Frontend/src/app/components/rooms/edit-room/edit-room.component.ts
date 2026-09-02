import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { PopupService } from '../../../core/services/popup.service';

function dateValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    return { dateInvalid: true };
  }
  return null;
}

@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.component.html',
  styleUrls: ['./edit-room.component.css']
})
export class EditRoomComponent implements OnInit {
  editForm!: FormGroup;
  roomId!: string;
  isLoading = true;
  isSaving = false;
  error = '';

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
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.isAdmin = user.role === 'admin';
    this.loadCategories();

    this.editForm = this.fb.group({
      title: ['', Validators.required],
      level: ['Beginner', Validators.required],
      description: [''],
      maxMembers: [10, [Validators.required, Validators.min(2), Validators.max(150)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      meetingURL: [''],
      categoryIds: [[]]
    }, { validators: dateValidator });

    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    if (this.roomId) {
      this.loadRoom();
    } else {
      this.error = 'Invalid Room ID';
      this.isLoading = false;
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(res => this.categories = res.categories);
  }

  loadRoom(): void {
    this.roomService.getRoomById(this.roomId).subscribe({
      next: (res) => {
        const room = res.data;
        const categoryIds = room.categoryIds.map((c: any) => c._id || c);
        const startDate = room.startDate ? new Date(room.startDate).toISOString().split('T')[0] : '';
        const endDate = room.endDate ? new Date(room.endDate).toISOString().split('T')[0] : '';

        this.editForm.patchValue({
          title: room.title,
          level: room.level,
          description: room.description,
          maxMembers: room.maxMembers,
          startDate: startDate,
          endDate: endDate,
          meetingURL: room.meetingURL,
          categoryIds: categoryIds
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load room data';
        this.isLoading = false;
      }
    });
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  toggleCategorySelection(categoryId: string, event: Event): void {
    event.stopPropagation();
    const current = this.editForm.get('categoryIds')?.value as string[] || [];
    if (current.includes(categoryId)) {
      this.editForm.patchValue({ categoryIds: current.filter(id => id !== categoryId) });
    } else {
      this.editForm.patchValue({ categoryIds: [...current, categoryId] });
    }
  }

  isSelected(categoryId: string): boolean {
    const current = this.editForm.get('categoryIds')?.value as string[] || [];
    return current.includes(categoryId);
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
      error: (err) => this.popupService.toastError(err.error?.message || 'Error creating category')
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
      error: (err) => this.popupService.toastError(err.error?.message || 'Error updating category')
    });
  }

  cancelEdit(event: Event): void {
    event.stopPropagation();
    this.editingCategoryId = null;
  }

  deleteCategory(categoryId: string, event: Event): void {
    event.stopPropagation();
    this.popupService.confirm('Are you sure you want to delete this category?').subscribe(confirmed => {
      if (!confirmed) return;
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          const current = this.editForm.get('categoryIds')?.value as string[] || [];
          if (current.includes(categoryId)) {
            this.editForm.patchValue({ categoryIds: current.filter(id => id !== categoryId) });
          }
          this.loadCategories();
          this.popupService.toastSuccess('Category deleted successfully');
        },
        error: (err) => this.popupService.toastError(err.error?.message || 'Error deleting category')
      });
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) return;
    this.isSaving = true;
    this.roomService.updateRoom(this.roomId, this.editForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/rooms', this.roomId]);
      },
      error: (err) => {
        this.isSaving = false;
        this.error = err.error?.message || 'Failed to update room';
      }
    });
  }

  deleteRoom(): void {
    this.popupService.confirm('Are you sure you want to delete this room? This will permanently delete all related chat messages, tasks, and member progress.').subscribe(confirmed => {
      if (confirmed) {
        this.roomService.deleteRoom(this.roomId).subscribe({
          next: () => {
            this.popupService.toastSuccess('Room deleted successfully');
            this.router.navigate(['/rooms']);
          },
          error: (err) => this.popupService.toastError(err.error?.message || 'Failed to delete room')
        });
      }
    });
  }
}
