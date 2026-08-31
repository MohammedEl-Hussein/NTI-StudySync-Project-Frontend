import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User, UpdateUserDto } from '../../core/models/user.model';

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

  public genderOptions: string[] = ['Female', 'Male', 'Other', 'Prefer not to say'];
  public studyLevelOptions: string[] = [
    'High School',
    'Undergraduate (Freshman)',
    'Undergraduate (Sophomore)',
    'Undergraduate (Junior)',
    'Undergraduate (Senior Year)',
    'Postgraduate / Masters',
    'Ph.D. Candidate',
    'Lifelong Learner'
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
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(70)]],
      age: [null, [Validators.min(10), Validators.max(120)]],
      studyLevel: ['', [Validators.required]],
      organization: ['', [Validators.maxLength(100)]],
      department: ['', [Validators.maxLength(100)]],
      gender: ['Female', [Validators.required]],
      phone: ['', [Validators.pattern('^[+0-9\\s-]{7,20}$')]],
      bio: ['', [Validators.maxLength(300)]]
    });
  }

  private loadUserData(): void {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          name: user.name || '',
          age: user.age || null,
          studyLevel: user.studyLevel || 'Undergraduate (Senior Year)',
          organization: user.organization || '',
          department: user.department || '',
          gender: user.gender || 'Female',
          phone: user.phone || '',
          bio: user.bio || ''
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching user for edit:', err);
        this.errorMessage = 'Failed to load user information. Please try again.';
        this.loading = false;
      }
    });
  }

  public onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage = 'Please correct the invalid fields in the form.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues: UpdateUserDto = this.profileForm.value;
    const userId = this.currentUser?._id || this.currentUser?.id || 'usr_haneen_01';

    // Call API: PUT /users/:id
    this.userService.updateProfile(userId, formValues).subscribe({
      next: (updatedUser: User) => {
        this.currentUser = updatedUser;
        this.saving = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1200);
      },
      error: (err) => {
        console.error('Error updating user profile:', err);
        this.saving = false;
        this.errorMessage = 'An error occurred while saving your profile. Please try again.';
      }
    });
  }

  public onCancel(): void {
    this.router.navigate(['/profile']);
  }

  // Helper getters for template validation
  get f() {
    return this.profileForm.controls;
  }
}
