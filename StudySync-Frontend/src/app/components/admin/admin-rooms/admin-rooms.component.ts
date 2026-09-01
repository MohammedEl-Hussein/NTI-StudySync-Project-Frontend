import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../core/services/admin.service';
import { Room } from '../../../core/models/room.model';
import { Category } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-rooms',
  templateUrl: './admin-rooms.component.html',
  styleUrls: ['./admin-rooms.component.css']
})
export class AdminRoomsComponent implements OnInit {
  rooms: Room[] = [];
  categories: Category[] = [];
  searchTerm: string = '';
  categoryFilter: string = '';
  loading: boolean = true;

  // Quick edit state
  isEditModalOpen: boolean = false;
  editingRoom: Partial<Room> | null = null;
  editingCategoryIds: string[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = true;

    // Load categories first (or in parallel) for lookup
    this.adminService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
      },
      error: (err) => console.error('Error fetching categories:', err)
    });

    this.adminService.getRooms().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.rooms = [];
          this.loading = false;
          return;
        }

        const memberRequests = data.map((room) => {
          const id = room._id || room.id;
          if (!id) return of({ members: [] });
          return this.adminService.getRoomMembers(id).pipe(
            catchError(() => of({ members: [] }))
          );
        });

        const taskRequests = data.map((room) => {
          const id = room._id || room.id;
          if (!id) return of([]);
          return this.adminService.getRoomTasks(id).pipe(
            catchError(() => of([]))
          );
        });

        forkJoin({
          members: forkJoin(memberRequests),
          tasks: forkJoin(taskRequests)
        }).subscribe({
          next: (results) => {
            data.forEach((room, index) => {
              const membersData = results.members[index]?.members || [];
              const tasksData = results.tasks[index] || [];
              (room as any).memberCount = membersData.length;
              (room as any).members = membersData.length;
              (room as any).totalTasks = tasksData.length;
            });
            this.rooms = data;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading room members and tasks:', err);
            this.rooms = data;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching rooms:', err);
        this.loading = false;
      }
    });
  }

  getRoomCategoryList(room: any): string[] {
    if (!room) return [];
    if (room.categoryIds && Array.isArray(room.categoryIds) && room.categoryIds.length > 0) {
      return room.categoryIds.map((cat: any) => {
        if (typeof cat === 'object' && cat !== null && cat.name) {
          return cat.name;
        }
        if (typeof cat === 'string') {
          const found = this.categories.find(c => (c._id || c.id) === cat);
          return found ? found.name : cat;
        }
        return '';
      }).filter((n: string) => !!n);
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
    return [];
  }

  getPrimaryCategoryDisplay(room: any): string {
    const list = this.getRoomCategoryList(room);
    return list.length > 0 ? list[0] : 'General';
  }

  getExtraCategoryCount(room: any): number {
    const list = this.getRoomCategoryList(room);
    return list.length > 1 ? list.length - 1 : 0;
  }

  getCategoryDisplay(room: any): string {
    const list = this.getRoomCategoryList(room);
    return list.length > 0 ? list.join(', ') : 'General';
  }

  get filteredRooms(): Room[] {
    return this.rooms.filter((r) => {
      const matchSearch =
        !this.searchTerm ||
        (r.title && r.title.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (r.description && r.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (!this.categoryFilter) return true;

      const catDisplay = this.getCategoryDisplay(r).toLowerCase();
      const filterVal = this.categoryFilter.toLowerCase();
      let matchCat = catDisplay.includes(filterVal);

      if (!matchCat && (r as any).categoryIds && Array.isArray((r as any).categoryIds)) {
        matchCat = (r as any).categoryIds.some((cat: any) => {
          const id = typeof cat === 'object' ? (cat._id || cat.id) : cat;
          const name = typeof cat === 'object' ? cat.name : '';
          return id === this.categoryFilter || (name && name.toLowerCase().includes(filterVal));
        });
      }

      return matchCat;
    });
  }

  viewRoom(room: Room): void {
    const id = room._id || room.id;
    if (id) {
      this.router.navigate(['/admin/rooms', id]);
    }
  }

  openEditModal(room: Room): void {
    this.editingRoom = { ...room };
    this.editingCategoryIds = [];

    const roomAny = room as any;
    if (roomAny.categoryIds && Array.isArray(roomAny.categoryIds)) {
      this.editingCategoryIds = roomAny.categoryIds.map((c: any) => {
        if (typeof c === 'object' && c !== null) return c._id || c.id;
        return c;
      });
    } else if (roomAny.category) {
      const catVal = roomAny.category;
      if (typeof catVal === 'object') {
        this.editingCategoryIds = [catVal._id || catVal.id];
      } else {
        const found = this.categories.find(c => (c._id || c.id) === catVal || c.name === catVal);
        if (found) {
          this.editingCategoryIds = [found._id || found.id || ''];
        }
      }
    }

    this.isEditModalOpen = true;
  }

  getCategoryNameById(catId: string): string {
    const found = this.categories.find(c => (c._id || c.id) === catId);
    return found ? found.name : catId;
  }

  isCategorySelectedInEdit(catId: string): boolean {
    return this.editingCategoryIds.includes(catId);
  }

  toggleCategoryInEdit(catId: string): void {
    if (!catId) return;
    if (this.isCategorySelectedInEdit(catId)) {
      this.editingCategoryIds = this.editingCategoryIds.filter(id => id !== catId);
    } else {
      this.editingCategoryIds = [...this.editingCategoryIds, catId];
    }
  }

  removeCategoryFromEdit(catId: string): void {
    this.editingCategoryIds = this.editingCategoryIds.filter(id => id !== catId);
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingRoom = null;
    this.editingCategoryIds = [];
  }

  saveRoomEdit(): void {
    if (!this.editingRoom) return;
    const id = this.editingRoom._id || this.editingRoom.id;
    if (!id) return;

    const payload = {
      title: this.editingRoom.title,
      description: this.editingRoom.description,
      level: this.editingRoom.level,
      maxMembers: this.editingRoom.maxMembers,
      categoryIds: this.editingCategoryIds
    };

    this.adminService.updateRoom(id, payload).subscribe({
      next: () => {
        alert('Room settings updated successfully.');
        this.closeEditModal();
        this.loadRooms();
      },
      error: (err) => {
        console.error('Error updating room:', err);
        alert('Failed to update room settings.');
      }
    });
  }

  deleteRoom(room: Room): void {
    const id = room._id || room.id;
    if (!id) return;

    if (confirm(`Are you sure you want to delete room "${room.title}"?`)) {
      this.adminService.deleteRoom(id).subscribe({
        next: () => {
          alert('Room deleted successfully.');
          this.loadRooms();
        },
        error: (err) => {
          console.error('Error deleting room:', err);
          alert('Failed to delete room.');
        }
      });
    }
  }
}
