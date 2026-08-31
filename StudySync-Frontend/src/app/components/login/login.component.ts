import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  // Helper method to decode JWT token payload ({ id, name, email, role })
  private parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  login(): void {
    if (this.loginForm.invalid) {
      alert('Please enter a valid email address and password.');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // Send POST http://localhost:3001/users/login
    this.usersService.loginUser(credentials).subscribe({
      next: (response: any) => {
        this.loading = false;
        
        // Backend returns: { message: "login success", data: tokenString }
        const token = response.data || response.token;

        if (token) {
          localStorage.setItem('token', token);
          // Decode token payload to get user role, name, email, id
          const decodedUser = this.parseJwt(token);
          if (decodedUser) {
            localStorage.setItem('currentUser', JSON.stringify(decodedUser));
          }
        }

        alert('Login Successful! Welcome back.');
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
        alert(err.error?.message || 'Login failed! Please check your email and password.');
      }
    });
  }
}
