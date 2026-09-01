import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../services/room.service';

@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.css']
})
export class RoomDetailsComponent implements OnInit {
  room: any;
  isLoading = true;
  error = '';
  tab = 'overview';
  memberCount = 0;
  taskCount = 0;
  progress = 0;
  phases: any[] = [];
  isOwner = false; // Add actual auth check if possible

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchRoomDetails(id);
    }
  }

  fetchRoomDetails(id: string): void {
    this.roomService.getRoomById(id).subscribe({
      next: (res) => {
        this.room = res.data;
        
        if (!this.room) {
          this.error = 'Room not found';
          this.isLoading = false;
          return;
        }

        this.roomService.getRoomMembers(id).subscribe({
          next: (memRes) => {
            const members = memRes.members || [];
            this.memberCount = members.length;
            this.room.members = members.map((m: any) => m.userId?._id || m.userId);

            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userId = user.id || user._id || user.userId;
            
            this.isOwner = this.room?.ownerId === userId || this.room?.ownerId?._id === userId;

            // Mock data since tasks/progress APIs aren't integrated here yet
            this.progress = 25;
            this.taskCount = 4;
            this.phases = [
              { section: 'Week 1: Fundamentals', completed: 1, total: 4, tasks: [
                { title: 'Read Chapter 1', description: 'Introduction', completed: true, dueDate: new Date() },
                { title: 'Complete Quiz', description: 'Test your knowledge', completed: false, dueDate: new Date() }
              ] }
            ];
            
            this.isLoading = false;
          },
          error: () => {
            this.memberCount = 0;
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load room details';
        this.isLoading = false;
      }
    });
  }

  toggleTask(task: any): void {
    task.completed = !task.completed;
  }
}
