import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Room } from '../../../models/room.model';
import { Category } from '../../../models/category.model';
import { RoomService } from '../../../services/room.service';
import { CategoryService } from '../../../services/category.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchService } from '../../../services/search.service';
import { ProgressService } from '../../../core/services/progress.service';

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
  isMyRooms = false;

  filters = {
    search: '',
    category: '',
    level: '',
    vacancy: '',
    dates: '',
    sort: 'Newest'
  };

  activeDropdown = '';

  constructor(
    private roomService: RoomService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.isMyRooms = !!data['myRoomsOnly'];
      this.fetchData();
    });
    this.searchService.currentSearch.subscribe(term => {
      this.filters.search = term;
      this.applyFilters();
    });
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.activeDropdown = '';
  }

  toggleDropdown(name: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? '' : name;
  }

  setFilter(type: 'category' | 'level' | 'vacancy' | 'dates' | 'sort', value: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.filters[type] = value;
    this.activeDropdown = '';
    this.applyFilters();
  }

  getCategoryName(): string {
    if (!this.filters.category) return 'All Categories';
    const category = this.categories.find(c => c._id === this.filters.category);
    return category ? category.name : 'All Categories';
  }

  fetchData(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories = res.categories,
      error: (err) => console.error(err)
    });

    forkJoin({
      roomsRes: this.roomService.getRooms(),
      progressRes: this.progressService.getAllProgress().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ roomsRes, progressRes }) => {
        const rooms = roomsRes.data || [];
        if (rooms.length === 0) {
          this.rooms = [];
          this.applyFilters();
          this.loading = false;
          return;
        }

        const requests = rooms.map(room => 
          this.roomService.getRoomMembers(room._id).pipe(
            catchError(() => of({ members: [] }))
          )
        );

        forkJoin(requests).subscribe(membersArrays => {
           rooms.forEach((room, index) => {
              const membersData = (membersArrays[index] as any).members || [];
              (room as any).memberCount = membersData.length;
              (room as any).members = membersData.map((m: any) => m.userId?._id || m.userId);
              
              const prog = progressRes.find((p: any) => p.roomId === room._id);
              (room as any).progress = prog ? (prog.percentage || 0) : 0;
           });

           if (this.isMyRooms) {
             const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
             const userId = user.id || user._id || user.userId;
             this.rooms = rooms.filter(room => {
               const owner: any = room.ownerId;
               const isOwner = owner === userId || owner?._id === userId;
               const inMembers = (room as any).members?.some((m: any) => m === userId);
               return isOwner || inMembers;
             });
           } else {
             this.rooms = rooms;
           }

           this.applyFilters();
           this.loading = false;
        });
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
        const titleMatch = (room.title || '').toLowerCase().includes(term);
        const descMatch = (room.description || '').toLowerCase().includes(term);
        if (!titleMatch && !descMatch) {
          match = false;
        }
      }

      if (this.filters.category) {
        let cats: any[] = [];
        if (room.categoryIds && Array.isArray(room.categoryIds)) cats = room.categoryIds;
        else if ((room as any).categoryId) cats = [(room as any).categoryId];
        else if ((room as any).category) cats = [(room as any).category];
        
        const hasCategory = cats.some((cat: any) => {
          const catId = typeof cat === 'object' ? (cat._id || cat.id) : cat;
          return catId === this.filters.category;
        });
        console.log('Room:', room.title, 'Categories:', cats, 'Filter:', this.filters.category, 'Match:', hasCategory);
        if (!hasCategory) match = false;
      }

      if (this.filters.level) {
        let roomLevel = (room.level || '').toLowerCase().trim();
        let filterLevel = this.filters.level.toLowerCase().trim();
        
        // Handle backend spelling mistake "Begginer"
        if (roomLevel === 'begginer') roomLevel = 'beginner';
        if (filterLevel === 'begginer') filterLevel = 'beginner';

        if (roomLevel !== filterLevel) {
          match = false;
        }
      }
      
      if (this.filters.vacancy === 'available') {
        const members = (room as any).memberCount || 0;
        if (members >= (room.maxMembers || 0)) match = false;
      }

      if (this.filters.dates) {
        const now = new Date().getTime();
        const start = new Date(room.startDate || 0).getTime();
        const end = new Date(room.endDate || 0).getTime();
        
        if (this.filters.dates === 'Upcoming' && start <= now) match = false;
        if (this.filters.dates === 'Ongoing' && (start > now || end < now)) match = false;
        if (this.filters.dates === 'Past' && end >= now) match = false;
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
    this.filters = { search: '', category: '', level: '', vacancy: '', dates: '', sort: 'Newest' };
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

  leaveRoom(room: Room): void {
    if (!confirm(`Are you sure you want to leave "${room.title}"?`)) return;
    
    this.roomService.leaveRoom(room._id).subscribe({
      next: () => {
        alert('Successfully left room!');
        this.fetchData();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to leave room');
      }
    });
  }

  onRoomDeleted(roomId: string): void {
    this.rooms = this.rooms.filter(r => r._id !== roomId);
    this.applyFilters();
  }
}
