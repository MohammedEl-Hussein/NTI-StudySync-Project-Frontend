import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../services/room.service';

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

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      level: ['Beginner', Validators.required],
      description: [''],
      maxMembers: [10, Validators.required],
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
    if (confirm('Are you sure you want to delete this room?')) {
      this.roomService.deleteRoom(this.roomId).subscribe({
        next: () => this.router.navigate(['/rooms']),
        error: (err) => alert(err.error?.message || 'Failed to delete room')
      });
    }
  }
}
