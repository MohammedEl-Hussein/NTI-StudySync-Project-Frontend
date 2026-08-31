import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-user-details',
  templateUrl: './admin-user-details.component.html',
  styleUrls: ['./admin-user-details.component.css']
})
export class AdminUserDetailsComponent implements OnInit {
  user: User | null = null;
  loading: boolean = true;
  userId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUser(this.userId);
    } else {
      this.loading = false;
    }
  }

  loadUser(id: string): void {
    this.loading = true;
    this.adminService.getUserById(id).subscribe({
      next: (userData) => {
        this.user = userData;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
        this.loading = false;
      }
    });
  }

  deleteUser(): void {
    if (!this.user || !this.userId) return;
    if (confirm(`Are you sure you want to delete user ${this.user.name}?`)) {
      this.adminService.deleteUser(this.userId).subscribe({
        next: () => {
          alert('User deleted successfully.');
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
