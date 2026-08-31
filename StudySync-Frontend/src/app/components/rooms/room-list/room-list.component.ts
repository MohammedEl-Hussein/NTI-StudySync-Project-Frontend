import { Component, OnInit } from '@angular/core';
import { Room } from '../../../models/room.model';
import { Category } from '../../../models/category.model';
import { RoomService } from '../../../services/room.service';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';

  filters = {
    search: '',
    category: '',
    level: '',
    vacancy: '',
    sort: 'Newest'
  };

  constructor(
    private roomService: RoomService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories = res.categories,
      error: (err) => console.error(err)
    });

    this.roomService.getRooms().subscribe({
      next: (res) => {
        this.rooms = res.data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load rooms';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    this.filteredRooms = this.rooms.filter(room => {
      let match = true;
      
      if (this.filters.search) {
        const term = this.filters.search.toLowerCase();
        if (!room.title.toLowerCase().includes(term) && !(room.description || '').toLowerCase().includes(term)) {
          match = false;
        }
      }

      if (this.filters.category) {
        const hasCategory = room.categoryIds.some((cat: any) => 
          cat === this.filters.category || cat._id === this.filters.category
        );
        if (!hasCategory) match = false;
      }

      if (this.filters.level && room.level !== this.filters.level) match = false;
      
      if (this.filters.vacancy === 'available') {
        const members = (room as any).memberCount || 0;
        if (members >= room.maxMembers) match = false;
      }

      return match;
    });

    // Sort logic
    if (this.filters.sort === 'Most Members') {
      this.filteredRooms.sort((a: any, b: any) => (b.memberCount || 0) - (a.memberCount || 0));
    } else if (this.filters.sort === 'Progress') {
      this.filteredRooms.sort((a: any, b: any) => (b.progress || 0) - (a.progress || 0));
    } else { // Newest
      this.filteredRooms.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
  }

  clearFilters(): void {
    this.filters = { search: '', category: '', level: '', vacancy: '', sort: 'Newest' };
    this.applyFilters();
  }

  joinRoom(room: Room): void {
    this.roomService.joinRoom(room._id).subscribe({
      next: () => {
        alert('Successfully joined room!');
        this.fetchData();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to join room');
      }
    });
  }
}
