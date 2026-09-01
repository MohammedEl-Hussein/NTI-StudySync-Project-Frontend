import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewChecked
} from '@angular/core';
import { Message } from '../../../models/message.model';
import { Room } from '../../../models/room.model';

interface DateGroup {
  dateLabel: string;
  messages: Message[];
}

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() currentUserId: string = '';
  @Input() isRoomOwnerOrAdmin: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() room: Room | any;

  @Output() editMessage = new EventEmitter<Message>();
  @Output() deleteMessage = new EventEmitter<Message>();

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  showScrollBottomBtn = false;
  private shouldScrollToBottom = true;
  private prevMessageCount = 0;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      const currentCount = this.messages ? this.messages.length : 0;
      if (currentCount > this.prevMessageCount) {
        this.shouldScrollToBottom = true;
      }
      this.prevMessageCount = currentCount;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  get groupedMessages(): DateGroup[] {
    if (!this.messages || this.messages.length === 0) return [];

    const groups: { [key: string]: Message[] } = {};
    const todayStr = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    for (const msg of this.messages) {
      const timeNum = this.getMsgTime(msg);
      const msgDate = timeNum ? new Date(timeNum) : new Date();
      const dateStr = msgDate.toDateString();
      let label = dateStr;

      if (dateStr === todayStr) {
        label = 'Today';
      } else if (dateStr === yesterdayStr) {
        label = 'Yesterday';
      } else {
        label = msgDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: msgDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(msg);
    }

    return Object.keys(groups).map((label) => ({
      dateLabel: label,
      messages: groups[label]
    }));
  }

  onScroll(event: Event): void {
    const el = this.scrollContainer.nativeElement;
    const threshold = 100;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    this.showScrollBottomBtn = !isNearBottom;
  }

  scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  getMsgUserId(msg?: Message): string {
    if (!msg) return '';
    if (typeof msg.userId === 'object' && msg.userId !== null) {
      return (msg.userId as any)._id || (msg.userId as any).id || '';
    }
    return msg.user?._id || msg.user?.id || (msg.userId as string) || '';
  }

  getMsgTime(msg?: Message): number {
    if (!msg) return 0;
    if (msg.createdAt) {
      const d = new Date(msg.createdAt).getTime();
      if (!isNaN(d)) return d;
    }
    if (msg.updatedAt) {
      const d = new Date(msg.updatedAt).getTime();
      if (!isNaN(d)) return d;
    }
    if (msg._id && typeof msg._id === 'string' && msg._id.length === 24 && /^[0-9a-fA-F]{24}$/.test(msg._id)) {
      try {
        const sec = parseInt(msg._id.substring(0, 8), 16);
        const d = new Date(sec * 1000).getTime();
        if (!isNaN(d) && d > 1600000000000) return d;
      } catch {}
    }
    return 0;
  }

  checkIsFirstInGroup(messages: Message[], index: number): boolean {
    if (index === 0) return true;
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];

    const currentUserId = this.getMsgUserId(currentMsg);
    const prevUserId = this.getMsgUserId(prevMsg);

    if (currentUserId !== prevUserId) return true;

    // Check time gap: if sent >= 60 seconds apart, treat as separate moment
    const currentTime = this.getMsgTime(currentMsg);
    const prevTime = this.getMsgTime(prevMsg);

    if (currentTime && prevTime) {
      if (Math.abs(currentTime - prevTime) >= 60000) return true;
    } else if (currentTime !== prevTime) {
      return true;
    }

    return false;
  }

  checkIsLastInGroup(messages: Message[], index: number): boolean {
    if (index === messages.length - 1) return true;
    const currentMsg = messages[index];
    const nextMsg = messages[index + 1];

    const currentUserId = this.getMsgUserId(currentMsg);
    const nextUserId = this.getMsgUserId(nextMsg);

    if (currentUserId !== nextUserId) return true;

    // Check time gap: if next message is sent >= 60 seconds later, this is the last in this moment
    const currentTime = this.getMsgTime(currentMsg);
    const nextTime = this.getMsgTime(nextMsg);

    if (currentTime && nextTime) {
      if (Math.abs(nextTime - currentTime) >= 60000) return true;
    } else if (currentTime !== nextTime) {
      return true;
    }

    return false;
  }

  onEdit(msg: Message): void {
    this.editMessage.emit(msg);
  }

  onDelete(msg: Message): void {
    this.deleteMessage.emit(msg);
  }
}
