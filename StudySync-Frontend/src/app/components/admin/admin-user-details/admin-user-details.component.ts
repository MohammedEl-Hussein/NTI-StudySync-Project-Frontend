import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';
import { PopupService } from '../../../core/services/popup.service';

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
    private adminService: AdminService,
    private popupService: PopupService
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
    this.popupService.confirm(`Are you sure you want to delete user ${this.user.name}?`).subscribe(confirmed => {
      if (confirmed) {
        this.adminService.deleteUser(this.userId).subscribe({
          next: () => {
            this.popupService.toastSuccess('User deleted successfully.');
            this.router.navigate(['/admin/users']);
          },
          error: (err) => {
            console.error('Error deleting user:', err);
            this.popupService.toastError('Failed to delete user.');
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
