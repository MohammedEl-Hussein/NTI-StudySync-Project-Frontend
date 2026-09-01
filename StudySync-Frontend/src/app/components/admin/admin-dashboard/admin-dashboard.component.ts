import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../core/services/admin.service';
import { AdminStats, Category, SupportMessage } from '../../../core/models/admin.model';
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

  categories: Category[] = [];
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

    this.adminService.getCategories().subscribe(cats => {
      this.categories = cats || [];
    });

    // Fetch users and sort descending by createdAt (most recent first)
    this.adminService.getUsers().subscribe(users => {
      const sortedUsers = [...users].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      this.recentUsers = sortedUsers.slice(0, 4);
    });

    // Fetch rooms and enrich top 3 with member count & total tasks
    this.adminService.getRooms().subscribe(rooms => {
      const topRooms = rooms.slice(0, 3);
      if (topRooms.length === 0) {
        this.recentRooms = [];
        return;
      }

      const memberReqs = topRooms.map(r => {
        const id = r._id || r.id;
        if (!id) return of({ members: [] });
        return this.adminService.getRoomMembers(id).pipe(catchError(() => of({ members: [] })));
      });

      const taskReqs = topRooms.map(r => {
        const id = r._id || r.id;
        if (!id) return of([]);
        return this.adminService.getRoomTasks(id).pipe(catchError(() => of([])));
      });

      forkJoin({
        members: forkJoin(memberReqs),
        tasks: forkJoin(taskReqs)
      }).subscribe({
        next: ({ members, tasks }) => {
          topRooms.forEach((r, idx) => {
            const membersData = members[idx]?.members || [];
            const tasksData = tasks[idx] || [];
            (r as any).memberCount = membersData.length;
            (r as any).members = membersData.length;
            (r as any).totalTasks = tasksData.length;
          });
          this.recentRooms = topRooms;
        },
        error: () => {
          this.recentRooms = topRooms;
        }
      });
    });

    this.adminService.getSupportMessages().subscribe(messages => {
      this.recentTickets = messages.slice(0, 3);
    });
  }

  getPrimaryCategoryDisplay(room: any): string {
    if (!room) return 'General';
    if (room.categoryIds && Array.isArray(room.categoryIds) && room.categoryIds.length > 0) {
      const cat = room.categoryIds[0];
      if (typeof cat === 'object' && cat !== null && cat.name) return cat.name;
      if (typeof cat === 'string') {
        const found = this.categories.find(c => (c._id || c.id) === cat);
        return found ? found.name : cat;
      }
    }
    if (room.categoryNames && Array.isArray(room.categoryNames) && room.categoryNames.length > 0) {
      return room.categoryNames[0];
    }
    if (room.category) {
      if (typeof room.category === 'object' && room.category.name) return room.category.name;
      if (typeof room.category === 'string') {
        const found = this.categories.find(c => (c._id || c.id) === room.category || c.name === room.category);
        return found ? found.name : room.category;
      }
    }
    return 'General';
  }
}
