import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { PopupService } from 'src/app/core/services/popup.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      age: [''],
      studyLevel: [''],
      organization: [''],
      department: [''],
      gender: [''],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).*$/)
      ]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  register(): void {
    if (this.registerForm.invalid) {
      if (this.registerForm.get('name')?.hasError('required')) {
        this.popupService.toastError('Please enter your full name.');
      } else if (this.registerForm.get('email')?.hasError('required')) {
        this.popupService.toastError('Please enter your email address.');
      } else if (this.registerForm.get('email')?.hasError('email')) {
        this.popupService.toastError('Please enter a valid email address.');
      } else if (this.registerForm.get('password')?.hasError('required')) {
        this.popupService.toastError('Please enter a password.');
      } else if (this.registerForm.get('password')?.hasError('minlength')) {
        this.popupService.toastError('Your password must be at least 8 characters long.');
      } else if (this.registerForm.get('password')?.hasError('pattern')) {
        this.popupService.toastError('Your password must contain at least one letter and one number.');
      } else if (this.registerForm.get('confirmPassword')?.hasError('required')) {
        this.popupService.toastError('Please confirm your password.');
      } else if (this.registerForm.get('terms')?.invalid) {
        this.popupService.toastError('Please agree to the Terms of Service to proceed.');
      } else {
        this.popupService.toastError('Please fill out all required fields correctly.');
      }
      return;
    }

    const formData = this.registerForm.value;

    if (formData.password !== formData.confirmPassword) {
      this.popupService.toastError('Passwords do not match!');
      return;
    }

    this.loading = true;

    const newUser = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      age: formData.age,
      studyLevel: formData.studyLevel,
      organization: formData.organization,
      department: formData.department,
      gender: formData.gender,
      phone: formData.phone
    };

    this.usersService.addUser(newUser).subscribe({
      next: (res) => {
        this.loading = false;
        this.popupService.toastSuccess('Account created successfully! Redirecting to Login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        const errorMsg = err.error?.message || err.statusText || err.message || 'Unknown error';
        this.popupService.toastError(`Failed to create account. Error: ${errorMsg}`);
      }
    });
  }
}
