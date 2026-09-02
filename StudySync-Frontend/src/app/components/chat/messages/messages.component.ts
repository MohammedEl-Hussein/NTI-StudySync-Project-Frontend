import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, interval, of, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { Room } from '../../../models/room.model';
import { RoomService } from '../../../services/room.service';
import { ChatService } from '../../../services/chat.service';
import { MessageService } from '../../../services/message.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-messages-page',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesPageComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  selectedRoom: Room | null = null;
  search: string = '';
  isLoading: boolean = true;
  currentUser: any = null;
  currentUserId: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private roomService: RoomService,
    private chatService: ChatService,
    private messageService: MessageService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.currentUserId = this.currentUser.id || this.currentUser._id || this.currentUser.userId || '';
      } catch (e) {
        this.currentUserId = '';
      }
    }

    this.loadRooms();
    this.initPeriodicSync();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getRooms().subscribe({
      next: (res: any) => {
        const allRooms: Room[] = res?.data || (Array.isArray(res) ? res : []);
        if (allRooms.length === 0) {
          this.rooms = [];
          this.filteredRooms = [];
          this.selectedRoom = null;
          this.isLoading = false;
          return;
        }

        // Fetch members for all rooms in parallel to filter by user's joined rooms
        const memberRequests = allRooms.map((room) =>
          this.roomService.getRoomMembers(room._id).pipe(
            catchError(() => of({ members: [] }))
          )
        );

        forkJoin(memberRequests).subscribe({
          next: (membersResponses) => {
            const joinedRooms: Room[] = [];

            allRooms.forEach((room, index) => {
              const membersData = (membersResponses[index] as any)?.members || [];
              (room as any).memberCount = membersData.length;
              (room as any).members = membersData.map((m: any) => {
                if (typeof m === 'object' && m !== null) {
                  return m.userId?._id || m.userId?.id || m.userId || m._id || m.id;
                }
                return m;
              });

              if (this.isUserInRoom(room, this.currentUserId)) {
                joinedRooms.push(room);
              }
            });

            this.rooms = joinedRooms;
            this.loadRoomLatestMessages();
            this.filterRooms();

            // Check if query param or route specified a room
            const preselectId = this.route.snapshot.queryParamMap.get('roomId');
            if (preselectId) {
              const matched = this.rooms.find((r) => r._id === preselectId);
              if (matched) {
                this.selectRoom(matched);
              } else if (this.rooms.length > 0) {
                this.selectRoom(this.rooms[0]);
              } else {
                this.selectedRoom = null;
              }
            } else if (this.rooms.length > 0) {
              if (this.selectedRoom) {
                const stillExists = this.rooms.find((r) => r._id === this.selectedRoom?._id);
                this.selectRoom(stillExists || this.rooms[0]);
              } else {
                this.selectRoom(this.rooms[0]);
              }
            } else {
              this.selectedRoom = null;
            }

            this.isLoading = false;

            // Listen for real-time notifications to update the list immediately
            this.notificationService.incomingToast$.pipe(
              takeUntil(this.destroy$)
            ).subscribe(notification => {
              if (notification && notification.type === 'chat') {
                this.loadRoomLatestMessages();
              }
            });
          },
          error: () => {
            // Fallback: check room owner/admin if member request fails
            this.rooms = allRooms.filter((r) => this.isUserInRoom(r, this.currentUserId));
            this.loadRoomLatestMessages();
            this.filterRooms();
            if (this.rooms.length > 0) {
              this.selectRoom(this.rooms[0]);
            } else {
              this.selectedRoom = null;
            }
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private initPeriodicSync(): void {
    // Periodically update last message and unread counts every 6 seconds
    interval(6000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.rooms && this.rooms.length > 0) {
        this.loadRoomLatestMessages();
      }
    });
  }

  private loadRoomLatestMessages(): void {
    this.rooms.forEach((room: any) => {
      this.chatService.getChatByRoomId(room._id).pipe(
        takeUntil(this.destroy$),
        switchMap((chat) => {
          room.chatId = chat?._id || room._id;
          return this.messageService.getMessagesByChatId(room.chatId);
        }),
        catchError(() => of([]))
      ).subscribe((messages) => {
        if (messages && messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          const msgUserId = typeof lastMsg.userId === 'object' && lastMsg.userId !== null
            ? (lastMsg.userId._id || lastMsg.userId.id)
            : (lastMsg.user?._id || lastMsg.user?.id || lastMsg.userId);

          const isMine = Boolean(this.currentUserId && msgUserId && msgUserId.toString() === this.currentUserId.toString());
          const sender = isMine ? 'You' : (lastMsg.user?.name || (typeof lastMsg.userId === 'object' ? (lastMsg.userId as any)?.name : null) || 'Member');
          
          room.lastMessage = `${sender}: ${lastMsg.content}`;
          room.lastMessageTime = this.formatLastMessageTime(lastMsg.createdAt);
          room.lastMessageRawDate = lastMsg.createdAt ? new Date(lastMsg.createdAt).getTime() : 0;

          // Calculate unread count
          if (this.selectedRoom?._id === room._id) {
            room.unreadCount = 0;
            localStorage.setItem('lastReadMsg_' + room._id, new Date().toISOString());
          } else {
            const lastReadStr = localStorage.getItem('lastReadMsg_' + room._id);
            const lastReadTime = lastReadStr ? new Date(lastReadStr).getTime() : 0;
            const unread = messages.filter((m: any) => {
              const mUserId = typeof m.userId === 'object' && m.userId !== null
                ? (m.userId._id || m.userId.id)
                : (m.user?._id || m.user?.id || m.userId);
              const isFromOther = !mUserId || mUserId.toString() !== this.currentUserId.toString();
              const mTime = m.createdAt ? new Date(m.createdAt).getTime() : 0;
              return isFromOther && mTime > lastReadTime;
            }).length;

            room.unreadCount = unread;
          }
        } else {
          room.lastMessage = '';
          room.lastMessageTime = '';
          room.unreadCount = 0;
          room.lastMessageRawDate = 0;
        }

        // Sort rooms by most recent message
        this.rooms.sort((a, b) => {
          const dateA = a.lastMessageRawDate || 0;
          const dateB = b.lastMessageRawDate || 0;
          return dateB - dateA;
        });
        
        // Only resort filteredRooms if search is empty
        if (!this.search.trim()) {
          this.filteredRooms = [...this.rooms];
        }
      });
    });
  }

  formatLastMessageTime(dateInput?: string | Date): string {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const todayStr = now.toDateString();
      const msgDateStr = d.toDateString();

      if (todayStr === msgDateStr) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (yesterday.toDateString() === msgDateStr) {
        return 'Yesterday';
      }

      if (d.getFullYear() === now.getFullYear()) {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      return d.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' });
    } catch {
      return '';
    }
  }

  isUserInRoom(room: any, currentUserId: string): boolean {
    if (!currentUserId || !room) return false;

    // 1. Check if user is the room creator / owner
    const ownerId = typeof room.ownerId === 'object' && room.ownerId !== null
      ? (room.ownerId._id || room.ownerId.id)
      : room.ownerId;
    if (ownerId && ownerId.toString() === currentUserId.toString()) {
      return true;
    }

    // 2. Check if user is in room adminIds
    if (Array.isArray(room.adminIds)) {
      const isAdmin = room.adminIds.some((admin: any) => {
        const aId = typeof admin === 'object' && admin !== null
          ? (admin._id || admin.id)
          : admin;
        return aId && aId.toString() === currentUserId.toString();
      });
      if (isAdmin) return true;
    }

    // 3. Check if user is in members list
    if (Array.isArray(room.members)) {
      const isMember = room.members.some((m: any) => {
        if (!m) return false;
        const mId = typeof m === 'object'
          ? (m._id || m.id || m.userId?._id || m.userId?.id || m.userId)
          : m;
        return mId && mId.toString() === currentUserId.toString();
      });
      if (isMember) return true;
    }

    return false;
  }

  filterRooms(): void {
    if (!this.search.trim()) {
      this.filteredRooms = this.rooms;
      return;
    }
    const query = this.search.toLowerCase();
    this.filteredRooms = this.rooms.filter(
      (r) =>
        r.title?.toLowerCase().includes(query) ||
        r.level?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
    );
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
    if (room) {
      (room as any).unreadCount = 0;
      localStorage.setItem('lastReadMsg_' + room._id, new Date().toISOString());
    }
  }

  getAvatarInitial(room: Room): string {
    return room.title ? room.title.charAt(0).toUpperCase() : 'R';
  }

  getAvatarColor(title: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #4f46e5)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
      'linear-gradient(135deg, #3b82f6, #2563eb)'
    ];
    let hash = 0;
    for (let i = 0; i < (title || '').length; i++) {
      hash += title.charCodeAt(i);
    }
    return colors[hash % colors.length];
  }
}
