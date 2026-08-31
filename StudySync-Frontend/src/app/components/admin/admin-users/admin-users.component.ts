import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  searchTerm: string = '';
  roleFilter: string = '';
  levelFilter: string = '';
  loading: boolean = true;

  // Edit Modal state
  isEditModalOpen: boolean = false;
  editingUser: Partial<User> | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.loading = false;
      }
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter((u) => {
      const matchSearch =
        !this.searchTerm ||
        (u.name && u.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchRole =
        !this.roleFilter || (u.role || 'user').toLowerCase() === this.roleFilter.toLowerCase();

      const matchLevel =
        !this.levelFilter || (u.studyLevel || '').toLowerCase() === this.levelFilter.toLowerCase();

      return matchSearch && matchRole && matchLevel;
    });
  }

  viewUser(user: User): void {
    const id = user._id || user.id;
    if (id) {
      this.router.navigate(['/admin/users', id]);
    }
  }

  openEditModal(user: User): void {
    this.editingUser = { ...user };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingUser = null;
  }

  saveUserEdit(): void {
    if (!this.editingUser) return;
    const id = this.editingUser._id || this.editingUser.id;
    if (!id) return;

    this.adminService.updateUser(id, this.editingUser).subscribe({
      next: () => {
        alert('User updated successfully!');
        this.closeEditModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert('Failed to update user.');
      }
    });
  }

  deleteUser(user: User): void {
    const id = user._id || user.id;
    if (!id) return;

    if (confirm(`Are you sure you want to delete user "${user.name || user.email}"?`)) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          alert('User deleted successfully.');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user.');
        }
      });
    }
  }
}
