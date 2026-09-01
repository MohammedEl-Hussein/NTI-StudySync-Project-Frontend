import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppNotification, NotificationService } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  activeToasts: AppNotification[] = [];
  private subscription?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.incomingToast$.subscribe(notification => {
      if (notification) {
        this.showToast(notification);
      }
    });
  }

  showToast(notification: AppNotification): void {
    this.activeToasts.push(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeToast(notification._id);
    }, 5000);
  }

  removeToast(id: string): void {
    this.activeToasts = this.activeToasts.filter(t => t._id !== id);
  }

  handleToastClick(notification: AppNotification): void {
    this.removeToast(notification._id);
    this.notificationService.markAsRead(notification._id);
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
