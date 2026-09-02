import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { PopupService } from 'src/app/core/services/popup.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;
  currentUser: any = null;
  isAdmin: boolean = false;
  roleFilter: string = '';
  levelFilter: string = '';

  constructor(
    private userServices: UsersService,
    private router: Router,
    private popupService: PopupService
  ) {}

  ngOnInit() {
    this.checkUserRole();
    this.getAllUsers();
  }

  checkUserRole() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        const role = (this.currentUser.role || '').toString().toLowerCase();
        this.isAdmin = role === 'admin';
      } catch (e) {
        this.isAdmin = false;
      }
    } else {
      this.isAdmin = false;
    }
  }

  get filteredUsers(): any[] {
    return this.users.filter(u => {
      const matchesRole = !this.roleFilter || (u.role || 'user').toLowerCase() === this.roleFilter.toLowerCase();
      const matchesLevel = !this.levelFilter || (u.studyLevel || '').toLowerCase() === this.levelFilter.toLowerCase();
      return matchesRole && matchesLevel;
    });
  }

  getAllUsers() {
    this.userServices.getUsers().subscribe({
      next: (res: any) => {
        console.log('GET /users response:', res);
        if (Array.isArray(res.data)) {
          this.users = res.data;
        } else if (Array.isArray(res)) {
          this.users = res;
        } else {
          this.users = [];
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  deleteUser(id: any) {
    this.popupService.confirm('Are you sure you want to delete this user?').subscribe(confirmed => {
      if (confirmed) {
        this.userServices.deleteUser(id).subscribe({
          next: () => {
            this.popupService.toastSuccess('User deleted successfully!');
            this.getAllUsers();
          },
          error: (err) => {
            console.error('Error deleting user:', err);
            this.popupService.toastError(err.error?.message || 'Failed to delete user.');
          }
        });
      }
    });
  }

  selectUserForEdit(user: any) {
    this.selectedUser = { ...user };
  }

  saveUserUpdate() {
    if (!this.selectedUser) return;

    this.userServices.update(this.selectedUser).subscribe({
      next: () => {
        this.popupService.toastSuccess('User updated successfully!');
        this.selectedUser = null;
        this.getAllUsers();
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.popupService.toastError(err.error?.message || 'Failed to update user.');
      }
    });
  }

  cancelEdit() {
    this.selectedUser = null;
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
