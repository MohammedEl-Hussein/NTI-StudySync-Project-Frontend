import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchTerm = '';
  notificationsOpen = false;
  profileMenuOpen = false;
  currentUser: User | null = null;
  private userSub!: Subscription;

  notifications: any[] = [
    { title: 'Welcome to StudySync!', time: 'Just now' }
  ];

  constructor(
    private router: Router,
    private searchService: SearchService,
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

  get isAdmin(): boolean {
    if (this.currentUser?.role === 'admin') return true;
    const storedStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (storedStr) {
      try {
        const parsed = JSON.parse(storedStr);
        return parsed?.role === 'admin';
      } catch (e) {}
    }
    return false;
  }

  get userInitial(): string {
    return this.currentUser?.name?.trim().charAt(0).toUpperCase() || 'U';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.notificationsOpen = false;
    this.profileMenuOpen = false;
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.profileMenuOpen = false;
    this.notificationsOpen = !this.notificationsOpen;
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.notificationsOpen = false;
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeDropdowns(): void {
    this.notificationsOpen = false;
    this.profileMenuOpen = false;
  }

  markAllRead(): void {
    this.notifications = [];
    this.notificationsOpen = false;
  }

  onSearchInput(): void {
    this.searchService.setSearchTerm(this.searchTerm);
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/rooms']);
    }
  }

  logout(): void {
    this.closeDropdowns();
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
