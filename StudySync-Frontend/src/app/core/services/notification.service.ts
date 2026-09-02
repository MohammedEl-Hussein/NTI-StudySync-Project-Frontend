import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface AppNotification {
  _id: string;
  recipient: string;
  type: 'chat' | 'task' | 'system' | 'reminder';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private socket: Socket;
  
  // State management
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  // Real-time toast emitter
  private incomingToastSubject = new BehaviorSubject<AppNotification | null>(null);
  public incomingToast$ = this.incomingToastSubject.asObservable();

  private apiUrl = `http://localhost:3001/notifications`; // Adjust if your backend route differs

  constructor(private http: HttpClient) {
    // Initialize socket connection
    this.socket = io('http://localhost:3001', {
      autoConnect: false // Connect manually after login
    });

    this.setupSocketListeners();
  }

  // Called when user logs in or app initializes with a valid token
  public connectSocket(userId: string): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
    
    // Register the user on the socket server
    this.socket.off('connect'); // Remove any existing listeners
    this.socket.on('connect', () => {
      this.socket.emit('register', userId);
    });
    
    this.socket.connect();
    
    if (this.socket.connected) {
      this.socket.emit('register', userId);
    }

    // Load initial notification history
    this.fetchNotifications();
  }

  public disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private setupSocketListeners(): void {
    this.socket.on('new_notification', (notification: AppNotification) => {
      // Add to state
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      
      // Update unread count
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      
      // Emit for toast popup
      this.incomingToastSubject.next(notification);
    });
  }

  public fetchNotifications(): void {
    this.http.get<AppNotification[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.notificationsSubject.next(data);
        const unread = data.filter(n => !n.isRead).length;
        this.unreadCountSubject.next(unread);
      },
      error: (err) => console.error('Error fetching notifications:', err)
    });
  }

  public markAsRead(id: string): void {
    this.http.put(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => n._id === id ? { ...n, isRead: true } : n);
        this.notificationsSubject.next(updated);
        
        const unread = updated.filter(n => !n.isRead).length;
        this.unreadCountSubject.next(unread);
      },
      error: (err) => console.error('Error marking notification as read:', err)
    });
  }

  public markAllAsRead(): void {
    this.http.put(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => ({ ...n, isRead: true }));
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(0);
      },
      error: (err) => console.error('Error marking all notifications as read:', err)
    });
  }

  ngOnDestroy(): void {
    this.disconnectSocket();
  }
}
