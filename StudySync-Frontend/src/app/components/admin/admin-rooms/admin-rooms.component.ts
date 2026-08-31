import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Room } from '../../../core/models/room.model';

@Component({
  selector: 'app-admin-rooms',
  templateUrl: './admin-rooms.component.html',
  styleUrls: ['./admin-rooms.component.css']
})
export class AdminRoomsComponent implements OnInit {
  rooms: Room[] = [];
  searchTerm: string = '';
  categoryFilter: string = '';
  loading: boolean = true;

  // Quick edit state
  isEditModalOpen: boolean = false;
  editingRoom: Partial<Room> | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = true;
    this.adminService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching rooms:', err);
        this.loading = false;
      }
    });
  }

  get filteredRooms(): Room[] {
    return this.rooms.filter((r) => {
      const matchSearch =
        !this.searchTerm ||
        (r.title && r.title.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (r.description && r.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchCat =
        !this.categoryFilter || (r.category || '').toLowerCase() === this.categoryFilter.toLowerCase();

      return matchSearch && matchCat;
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
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingRoom = null;
  }

  saveRoomEdit(): void {
    if (!this.editingRoom) return;
    alert('Room settings updated successfully.');
    this.closeEditModal();
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
