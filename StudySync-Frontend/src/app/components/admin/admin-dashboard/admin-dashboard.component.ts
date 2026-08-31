import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { AdminStats, SupportMessage } from '../../../core/models/admin.model';
import { User } from '../../../core/models/user.model';
import { Room } from '../../../core/models/room.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats = {
    totalUsers: 0,
    totalRooms: 0,
    totalCategories: 0,
    pendingSupport: 0
  };

  recentUsers: User[] = [];
  recentRooms: Room[] = [];
  recentTickets: SupportMessage[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard stats', err);
        this.loading = false;
      }
    });

    this.adminService.getUsers().subscribe(users => {
      this.recentUsers = users.slice(0, 4);
    });

    this.adminService.getRooms().subscribe(rooms => {
      this.recentRooms = rooms.slice(0, 3);
    });

    this.adminService.getSupportMessages().subscribe(messages => {
      this.recentTickets = messages.slice(0, 3);
    });
  }
}
