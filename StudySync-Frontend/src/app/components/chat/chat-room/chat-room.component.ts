import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, interval, takeUntil, switchMap, of, catchError } from 'rxjs';
import { Room } from '../../../models/room.model';
import { Chat } from '../../../models/chat.model';
import { Message } from '../../../models/message.model';
import { RoomService } from '../../../services/room.service';
import { ChatService } from '../../../services/chat.service';
import { MessageService } from '../../../services/message.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MessageInputComponent } from '../message-input/message-input.component';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnChanges, OnDestroy {
  @Input() roomId?: string;
  @Input() showHeader: boolean = true;
  @Input() showBackBtn: boolean = true;

  @ViewChild(MessageInputComponent) messageInputComp?: MessageInputComponent;

  room: Room | any = null;
  chat: Chat | null = null;
  messages: Message[] = [];
  members: any[] = [];
  
  currentUserId: string = '';
  currentUser: any = null;
  
  isLoadingRoom: boolean = true;
  isLoadingMessages: boolean = true;
  isSending: boolean = false;
  
  isMembersOpen: boolean = true;
  errorMessage: string = '';

  // Edit message modal state
  isEditModalOpen: boolean = false;
  editingMessage: Message | null = null;
  isSavingEdit: boolean = false;

  // Delete message modal state
  isDeleteModalOpen: boolean = false;
  deletingMessage: Message | null = null;
  isDeletingMsg: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private chatService: ChatService,
    private messageService: MessageService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    // If roomId not provided via @Input, read from route params (/rooms/:id/chat)
    if (!this.roomId) {
      const routeId = this.route.snapshot.paramMap.get('id');
      if (routeId) {
        this.roomId = routeId;
      }
    }

    if (this.roomId) {
      this.initRoomChat(this.roomId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomId'] && !changes['roomId'].firstChange && this.roomId) {
      this.destroy$.next();
      this.initRoomChat(this.roomId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.currentUserId = this.currentUser.id || this.currentUser._id || this.currentUser.userId || '';
      } catch (e) {
        this.currentUserId = '';
      }
    }
  }

  get isRoomOwnerOrAdmin(): boolean {
    if (!this.currentUserId) return false;
    const isOwner =
      this.room?.ownerId === this.currentUserId ||
      this.room?.ownerId?._id === this.currentUserId;
    const isSuperAdmin = this.currentUser?.role === 'admin';
    const isRoomAdmin = this.room?.adminIds?.some(
      (a: any) => (a?._id || a?.id || a) === this.currentUserId
    );
    return isOwner || isSuperAdmin || isRoomAdmin;
  }

  get onlineCount(): number {
    if (!this.members || this.members.length === 0) return 1;
    return this.members.filter((m) => this.isMemberActive(m)).length;
  }

  isMemberActive(member: any): boolean {
    if (!member) return false;

    const memId = member.userId?._id || member.userId?.id || member.userId || member._id || member.id;

    // 1. Current user viewing the room is active live
    if (this.currentUserId && memId && memId.toString() === this.currentUserId.toString()) {
      return true;
    }

    // 2. Explicit backend online flag
    if (member.isOnline === true || member.userId?.isOnline === true) return true;
    if (member.status === 'online' || member.status === 'active' ||
        member.userId?.status === 'online' || member.userId?.status === 'active') return true;
    if (member.status === 'offline' || member.userId?.status === 'offline') return false;

    // 3. Live activity from recent room messages (sent within last 30 minutes)
    if (this.messages && this.messages.length > 0 && memId) {
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      const hasRecentMessage = this.messages.some((msg) => {
        const msgUserId = typeof msg.userId === 'object' && msg.userId !== null
          ? (msg.userId._id || msg.userId.id)
          : (msg.user?._id || msg.user?.id || msg.userId);

        if (msgUserId && msgUserId.toString() === memId.toString()) {
          const msgTime = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
          return msgTime > thirtyMinutesAgo;
        }
        return false;
      });

      if (hasRecentMessage) {
        return true;
      }
    }

    return false;
  }

  private initRoomChat(roomId: string): void {
    this.isLoadingRoom = true;
    this.isLoadingMessages = true;
    this.errorMessage = '';

    // 1. Fetch Room Details
    this.roomService.getRoomById(roomId).pipe(
      takeUntil(this.destroy$),
      catchError(() => of(null))
    ).subscribe((res: any) => {
      if (res && res.data) {
        this.room = res.data;
      } else if (res && res._id) {
        this.room = res;
      }
      this.isLoadingRoom = false;
    });

    // 2. Fetch Room Members
    this.roomService.getRoomMembers(roomId).pipe(
      takeUntil(this.destroy$),
      catchError(() => of({ members: [] }))
    ).subscribe((res: any) => {
      this.members = res?.members || res?.data || [];
    });

    // 3. Fetch or Initialize Chat & Messages
    this.chatService.getChatByRoomId(roomId).pipe(
      takeUntil(this.destroy$),
      switchMap((chat) => {
        this.chat = chat;
        const chatId = chat?._id || roomId;
        return this.messageService.getMessagesByChatId(chatId);
      }),
      catchError((err) => {
        console.error('Error loading chat/messages:', err);
        return of([]);
      })
    ).subscribe({
      next: (messages) => {
        this.messages = messages || [];
        this.isLoadingMessages = false;
        this.startPeriodicRefresh();
      },
      error: () => {
        this.isLoadingMessages = false;
      }
    });
  }

  private startPeriodicRefresh(): void {
    // Listen for live socket notifications instead of heavy polling
    this.notificationService.incomingToast$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((notification) => {
      // If the notification is a chat message for this exact room
      if (notification && notification.type === 'chat' && notification.link?.includes(this.roomId || '')) {
        const chatId = this.chat?._id || this.roomId;
        if (chatId) {
          this.messageService.getMessagesByChatId(chatId).subscribe(freshMessages => {
            if (freshMessages && Array.isArray(freshMessages)) {
              this.messages = freshMessages;
            }
          });
        }
      }
    });

    // Fallback slow poll just to keep state sync over very long periods
    interval(15000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        const chatId = this.chat?._id || this.roomId;
        if (!chatId) return of([]);
        return this.messageService.getMessagesByChatId(chatId).pipe(
          catchError(() => of(this.messages))
        );
      })
    ).subscribe((freshMessages) => {
      if (freshMessages && Array.isArray(freshMessages)) {
        this.messages = freshMessages;
      }
    });
  }

  onSendMessage(content: string): void {
    if (!content.trim() || this.isSending) return;

    const chatId = this.chat?._id || this.roomId || '';
    
    // Create optimistic message
    const tempId = 'temp-' + Date.now();
    const optimisticMsg: Message = {
      _id: tempId,
      chatId: chatId,
      userId: this.currentUserId,
      user: {
        _id: this.currentUserId,
        name: this.currentUser?.name || 'You',
        email: this.currentUser?.email || '',
        role: this.currentUser?.role || 'student'
      },
      content: content,
      createdAt: new Date().toISOString(),
      isPending: true
    };

    this.messages = [...this.messages, optimisticMsg];
    this.isSending = true;

    this.messageService.sendMessage({
      chatId: chatId,
      roomId: this.roomId,
      content: content,
      userId: this.currentUserId
    }).subscribe({
      next: (savedMsg) => {
        this.isSending = false;
        // Replace optimistic with actual
        this.messages = this.messages.map((m) => (m._id === tempId ? { ...savedMsg, isPending: false } : m));
        this.messageInputComp?.focusInput();
      },
      error: (err) => {
        this.isSending = false;
        console.error('Failed to send message:', err);
        // Mark optimistic message as error or remove
        this.messages = this.messages.filter((m) => m._id !== tempId);
        this.messageInputComp?.focusInput();
        alert('Failed to send message. Please try again.');
      }
    });
  }

  // Edit Message Actions
  openEditModal(msg: Message): void {
    this.editingMessage = msg;
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingMessage = null;
    this.isSavingEdit = false;
  }

  onSaveEdit(event: { id: string; content: string }): void {
    this.isSavingEdit = true;
    this.messageService.updateMessage(event.id, { content: event.content }).subscribe({
      next: (updated) => {
        this.messages = this.messages.map((m) =>
          m._id === event.id ? { ...m, content: event.content, isEdited: true, updatedAt: new Date().toISOString() } : m
        );
        this.closeEditModal();
      },
      error: (err) => {
        this.isSavingEdit = false;
        console.error('Failed to edit message:', err);
        alert('Failed to update message. Please try again.');
      }
    });
  }

  // Delete Message Actions
  openDeleteModal(msg: Message): void {
    this.deletingMessage = msg;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.deletingMessage = null;
    this.isDeletingMsg = false;
  }

  onConfirmDelete(id: string): void {
    this.isDeletingMsg = true;

    // Store backup copy of messages in case server request fails
    const backupMessages = [...this.messages];
    this.messages = this.messages.filter((m) => m._id !== id);

    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.isDeletingMsg = false;
        this.closeDeleteModal();
      },
      error: (err) => {
        this.isDeletingMsg = false;
        console.error('Failed to delete message from server:', err);
        // Restore message list if server deletion failed
        this.messages = backupMessages;
        this.closeDeleteModal();
        alert(err?.error?.message || 'Failed to delete message from server.');
      }
    });
  }

  toggleMembers(): void {
    this.isMembersOpen = !this.isMembersOpen;
  }

  navigateBackToRoom(): void {
    if (this.roomId) {
      this.router.navigate(['/rooms', this.roomId]);
    } else {
      this.router.navigate(['/rooms']);
    }
  }
}
