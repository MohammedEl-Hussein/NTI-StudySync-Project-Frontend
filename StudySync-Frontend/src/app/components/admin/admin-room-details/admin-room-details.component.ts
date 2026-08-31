import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Room } from '../../../core/models/room.model';

@Component({
  selector: 'app-admin-room-details',
  templateUrl: './admin-room-details.component.html',
  styleUrls: ['./admin-room-details.component.css']
})
export class AdminRoomDetailsComponent implements OnInit {
  room: Room | null = null;
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
      this.loadRoom(this.roomId);
    } else {
      this.loading = false;
    }
  }

  loadRoom(id: string): void {
    this.loading = true;
    this.adminService.getRoomById(id).subscribe({
      next: (data) => {
        this.room = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching room details:', err);
        this.loading = false;
      }
    });
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
