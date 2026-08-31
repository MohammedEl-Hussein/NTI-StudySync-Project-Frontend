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

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(res => this.categories = res.categories);

    this.roomForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      categoryIds: [[], Validators.required],
      level: ['Beginner', Validators.required],
      maxMembers: [10, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      meetingURL: ['']
    }, { validators: dateValidator });
  }

  next(): void {
    if (this.step < 5) this.step++;
  }

  previous(): void {
    if (this.step > 1) this.step--;
  }

  submitRoom(): void {
    if (this.roomForm.invalid) return;
    this.roomService.createRoom(this.roomForm.value).subscribe({
      next: (res) => this.router.navigate(['/rooms', res.data._id]),
      error: (err) => alert(err.error?.message || 'Error creating room')
    });
  }
}
