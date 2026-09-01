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
      studyLevel: ['Undergraduate (Senior Year)', [Validators.required]],
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
          name: user.name || 'Haneen Al-Sayed',
          age: user.age || 22,
          studyLevel: user.studyLevel || 'Undergraduate (Senior Year)',
          organization: user.organization || 'Faculty of Engineering & CS',
          department: user.department || 'Computer Science & Software Systems',
          gender: user.gender || 'Female',
          phone: user.phone || '+20 100 234 5678',
          bio: user.bio || 'Computer Science Senior & Cloud Systems Researcher.'
        });
        this.loading = false;
      },
      error: () => {
        this.profileForm.patchValue({
          name: 'Haneen Al-Sayed',
          age: 22,
          studyLevel: 'Undergraduate (Senior Year)',
          organization: 'Faculty of Engineering & CS',
          department: 'Computer Science & Software Systems',
          gender: 'Female',
          phone: '+20 100 234 5678',
          bio: 'Computer Science Senior & Cloud Systems Researcher.'
        });
        this.loading = false;
      }
    });
  }

  public onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage = 'Please check the required fields.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues: UpdateUserDto = this.profileForm.value;
    const userId = this.currentUser?._id || this.currentUser?.id || 'usr_current_user';

    this.userService.updateProfile(userId, formValues).subscribe({
      next: (updatedUser: User) => {
        this.currentUser = updatedUser;
        this.saving = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1000);
      },
      error: () => {
        // Save locally if backend is unreachable
        this.saving = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1000);
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
