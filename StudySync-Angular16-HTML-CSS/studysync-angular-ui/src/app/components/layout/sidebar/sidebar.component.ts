import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  collapsed = false;
  currentUser: User | null = null;
  private userSub!: Subscription;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userSub = this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  get isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !!this.currentUser;
  }

  get userInitial(): string {
    return this.currentUser?.name?.trim().charAt(0).toUpperCase() || 'U';
  }

  logout(): void {
    this.userService.setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
