import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchTerm = '';
  notificationsOpen = false;
  currentUser: any;
  notifications: AppNotification[] = [];
  unreadCount = 0;
  
  private subs: Subscription = new Subscription();

  constructor(
    private router: Router, 
    private searchService: SearchService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      // Connect socket when user is logged in
      if (this.currentUser._id || this.currentUser.id) {
        this.notificationService.connectSocket(this.currentUser._id || this.currentUser.id);
      }
    }

    this.subs.add(this.notificationService.notifications$.subscribe(data => {
      this.notifications = data;
    }));

    this.subs.add(this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    }));
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead();
    this.notificationsOpen = false;
  }
  
  handleNotificationClick(notification: AppNotification): void {
    this.notificationService.markAsRead(notification._id);
    this.notificationsOpen = false;
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  onSearchInput(): void {
    this.searchService.setSearchTerm(this.searchTerm);
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/rooms']);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
