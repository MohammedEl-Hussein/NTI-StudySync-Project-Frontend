import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User, ProfileStats } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public user: User | null = null;
  public loading = true;
  public joinedRooms = 0;
  public completedTasks = 0;
  public averageProgress = 0;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  public loadProfile(): void {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (userData: User) => {
        this.user = userData;
        this.loading = false;
      },
      error: (err) => {
        console.warn('Using local profile data fallback:', err);
        this.loading = false;
      }
    });

    this.userService.getUserStats().subscribe({
      next: (stats: ProfileStats) => {
        this.joinedRooms = stats.joinedRooms;
        this.completedTasks = stats.completedTasks;
        this.averageProgress = stats.overallProgress;
      }
    });
  }

  public editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }
}
