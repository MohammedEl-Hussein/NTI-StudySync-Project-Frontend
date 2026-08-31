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
        // Mock data since tasks/progress APIs aren't integrated here yet
        this.memberCount = this.room.maxMembers > 2 ? 2 : 1; 
        this.progress = 25;
        this.taskCount = 4;
        this.phases = [
          { section: 'Week 1: Fundamentals', completed: 1, total: 4, tasks: [
            { title: 'Read Chapter 1', description: 'Introduction', completed: true, dueDate: new Date() },
            { title: 'Complete Quiz', description: 'Test your knowledge', completed: false, dueDate: new Date() }
          ] }
        ];
        
        // Pseudo check, usually compare with logged in user ID
        this.isOwner = true; 
        
        this.isLoading = false;
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
