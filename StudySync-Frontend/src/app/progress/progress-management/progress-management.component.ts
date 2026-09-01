import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgressService } from '../../core/services/progress.service';
import { RoomService } from '../../services/room.service';
import { UserService } from '../../core/services/user.service';
import { Progress, CreateProgressDto, UpdateProgressDto } from '../../core/models/progress.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-progress-management',
  templateUrl: './progress-management.component.html',
  styleUrls: ['./progress-management.component.css']
})
export class ProgressManagementComponent implements OnInit {
  public progressList: Progress[] = [];
  public joinedRooms: Room[] = [];
  public loading = false;
  public saving = false;

  // Modal / Form state
  public isModalOpen = false;
  public isEditMode = false;
  public selectedProgressId: string | null = null;
  public progressForm!: FormGroup;

  // Delete confirmation
  public isDeleteModalOpen = false;
  public recordToDelete: Progress | null = null;

  // Toast / Alerts
  public notificationMessage = '';
  public notificationType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private progressService: ProgressService,
    private roomService: RoomService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRooms();
  }

  private initForm(): void {
    this.progressForm = this.fb.group({
      roomId: ['', [Validators.required]],
      section: ['', [Validators.required, Validators.minLength(3)]],
      totalTasks: [10, [Validators.required, Validators.min(1)]],
      completedTasks: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });

    // Auto calculate percentage when tasks change
    this.progressForm.valueChanges.subscribe((val) => {
      if (val.completedTasks > val.totalTasks && val.totalTasks > 0) {
        this.progressForm.patchValue({ completedTasks: val.totalTasks }, { emitEvent: false });
      }
    });
  }

  public loadProgressRecords(): void {
    this.loading = true;
    this.progressService.getAllProgress().subscribe({
      next: (list) => {
        // Map room title dynamically from loaded rooms since backend doesn't store roomTitle
        this.progressList = list.map(prog => {
          const matchedRoom = this.joinedRooms.find(r => r._id === prog.roomId);
          return {
            ...prog,
            roomTitle: matchedRoom ? matchedRoom.title : 'General Study Room'
          };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading progresses:', err);
        this.loading = false;
      }
    });
  }

  public loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (res: any) => {
        this.joinedRooms = Array.isArray(res) ? res : (res?.data || []);
        // Load records after rooms are ready so we can map room titles
        this.loadProgressRecords();
      }
    });
  }

  public openCreateModal(): void {
    this.isEditMode = false;
    this.selectedProgressId = null;
    this.progressForm.reset({
      roomId: this.joinedRooms[0]?._id || 'room_01',
      section: '',
      totalTasks: 10,
      completedTasks: 0,
      notes: ''
    });
    this.isModalOpen = true;
  }

  public openEditModal(record: Progress): void {
    this.isEditMode = true;
    this.selectedProgressId = record._id || record.id || null;
    this.progressForm.patchValue({
      roomId: record.roomId || '',
      section: record.section || '',
      totalTasks: record.totalTasks || 10,
      completedTasks: record.completedTasks || 0,
      notes: record.notes || ''
    });
    this.isModalOpen = true;
  }

  public closeModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedProgressId = null;
  }

  /**
   * Submit Create (POST /progresses) or Update (PUT /progresses/:id)
   */
  public saveProgress(): void {
    if (this.progressForm.invalid) {
      this.progressForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formVal = this.progressForm.value;
    const total = Number(formVal.totalTasks);
    const completed = Number(formVal.completedTasks);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const selectedRoom = this.joinedRooms.find((r) => r._id === formVal.roomId);

    if (this.isEditMode && this.selectedProgressId) {
      // PUT /progresses/:id
      const updateDto: UpdateProgressDto = {
        section: formVal.section,
        totalTasks: total,
        completedTasks: completed,
        percentage: percentage,
        notes: formVal.notes
      };

      this.progressService.updateProgress(this.selectedProgressId, updateDto).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadProgressRecords();
          this.showToast('Progress record updated successfully!', 'success');
        },
        error: (err) => {
          console.error('Error updating progress:', err);
          this.saving = false;
          this.showToast('Failed to update progress record.', 'error');
        }
      });
    } else {
      // POST /progresses
      const createDto: CreateProgressDto = {
        userId: 'usr_haneen_01',
        roomId: formVal.roomId,
        roomTitle: selectedRoom?.title || 'Study Room',
        section: formVal.section,
        totalTasks: total,
        completedTasks: completed,
        percentage: percentage,
        notes: formVal.notes
      };

      this.progressService.createProgress(createDto).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadProgressRecords();
          this.showToast('New progress record created successfully!', 'success');
        },
        error: (err) => {
          console.error('Error creating progress:', err);
          this.saving = false;
          this.showToast('Failed to create progress record.', 'error');
        }
      });
    }
  }

  public openDeleteConfirm(record: Progress): void {
    this.recordToDelete = record;
    this.isDeleteModalOpen = true;
  }

  public cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.recordToDelete = null;
  }

  /**
   * DELETE /progresses/:id
   */
  public confirmDelete(): void {
    if (!this.recordToDelete) return;
    const id = this.recordToDelete._id || this.recordToDelete.id;
    if (!id) return;

    this.progressService.deleteProgress(id).subscribe({
      next: () => {
        this.cancelDelete();
        this.loadProgressRecords();
        this.showToast('Progress record removed.', 'success');
      },
      error: (err) => {
        console.error('Error deleting progress:', err);
        this.showToast('Failed to delete progress record.', 'error');
      }
    });
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.notificationMessage = msg;
    this.notificationType = type;
    setTimeout(() => {
      this.notificationMessage = '';
    }, 3000);
  }

  get f() {
    return this.progressForm.controls;
  }
}
