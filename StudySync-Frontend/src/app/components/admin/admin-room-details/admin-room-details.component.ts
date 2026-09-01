import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Room } from '../../../core/models/room.model';
import { Category } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-room-details',
  templateUrl: './admin-room-details.component.html',
  styleUrls: ['./admin-room-details.component.css']
})
export class AdminRoomDetailsComponent implements OnInit {
  room: Room | null = null;
  categories: Category[] = [];
  roomId: string = '';
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    if (this.roomId) {
      this.loadCategoriesAndRoom(this.roomId);
    } else {
      this.loading = false;
    }
  }

  loadCategoriesAndRoom(id: string): void {
    this.loading = true;
    this.adminService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
      }
    });

    this.adminService.getRoomById(id).subscribe({
      next: (data) => {
        this.room = data;
        if (this.room) {
          this.adminService.getRoomMembers(id).subscribe({
            next: (res) => {
              const members = res?.members || [];
              (this.room as any).memberCount = members.length;
              (this.room as any).members = members.length;
            },
            error: () => {}
          });

          this.adminService.getRoomTasks(id).subscribe({
            next: (tasks) => {
              (this.room as any).totalTasks = tasks?.length || 0;
            },
            error: () => {}
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching room details:', err);
        this.loading = false;
      }
    });
  }

  getRoomCategoryList(room: any): string[] {
    if (!room) return [];
    if (room.categoryIds && Array.isArray(room.categoryIds) && room.categoryIds.length > 0) {
      const names = room.categoryIds.map((cat: any) => {
        if (typeof cat === 'object' && cat !== null && cat.name) return cat.name;
        if (typeof cat === 'string') {
          const found = this.categories.find(c => (c._id || c.id) === cat);
          return found ? found.name : cat;
        }
        return '';
      }).filter((n: string) => !!n);
      if (names.length > 0) return names;
    }
    if (room.categoryNames && Array.isArray(room.categoryNames) && room.categoryNames.length > 0) {
      return room.categoryNames;
    }
    if (room.category) {
      if (typeof room.category === 'object' && room.category.name) return [room.category.name];
      if (typeof room.category === 'string') {
        const found = this.categories.find(c => (c._id || c.id) === room.category || c.name === room.category);
        return [found ? found.name : room.category];
      }
    }
    return ['General'];
  }

  getCategoryDisplay(room: any): string {
    const list = this.getRoomCategoryList(room);
    return list.length > 0 ? list.join(', ') : 'General';
  }

  deleteRoom(): void {
    if (!this.room || !this.roomId) return;
    if (confirm(`Are you sure you want to delete room "${this.room.title}"?`)) {
      this.adminService.deleteRoom(this.roomId).subscribe({
        next: () => {
          alert('Room deleted successfully.');
          this.router.navigate(['/admin/rooms']);
        },
        error: (err) => {
          console.error('Error deleting room:', err);
          alert('Failed to delete room.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/rooms']);
  }
}
