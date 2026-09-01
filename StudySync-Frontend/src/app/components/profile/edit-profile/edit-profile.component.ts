import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User, UpdateUserDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  public profileForm!: FormGroup;
  public currentUser: User | null = null;
  public loading = false;
  public saving = false;
  public successMessage = '';
  public errorMessage = '';

  public genderOptions: string[] = ['Female', 'Male'];
  public studyLevelOptions: string[] = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Undergraduate',
    'Graduate'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      age: [null, [Validators.min(13), Validators.max(100)]],
      studyLevel: [''],
      organization: [''],
      department: [''],
      gender: [''],
      phone: ['']
    });
  }

  private loadUserData(): void {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return;
        }
        this.currentUser = user;
        const currentStudyLevel = user.studyLevel && user.studyLevel.trim() !== '' ? user.studyLevel : '';
        if (currentStudyLevel && !this.studyLevelOptions.includes(currentStudyLevel)) {
          this.studyLevelOptions.push(currentStudyLevel);
        }

        const currentGender = user.gender && user.gender.trim() !== '' ? user.gender : '';
        if (currentGender && !this.genderOptions.includes(currentGender)) {
          this.genderOptions.push(currentGender);
        }

        this.profileForm.patchValue({
          name: user.name || '',
          age: user.age || null,
          studyLevel: currentStudyLevel,
          organization: user.organization || '',
          department: user.department || '',
          gender: currentGender,
          phone: user.phone || ''
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage = 'Please check the required fields (Name must be at least 3 characters).';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues: UpdateUserDto = this.profileForm.value;
    const userId = this.currentUser?._id || this.currentUser?.id || '';

    this.userService.updateProfile(userId, formValues).subscribe({
      next: (updatedUser: User) => {
        this.currentUser = updatedUser;
        this.saving = false;
        this.successMessage = 'Profile updated successfully in database!';
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1200);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Failed to update profile in database.';
      }
    });
  }

  public onCancel(): void {
    this.router.navigate(['/profile']);
  }

  get f() {
    return this.profileForm.controls;
  }
}
