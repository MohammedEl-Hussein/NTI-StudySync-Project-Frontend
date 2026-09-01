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
      const msgDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
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

  onEdit(msg: Message): void {
    this.editMessage.emit(msg);
  }

  onDelete(msg: Message): void {
    this.deleteMessage.emit(msg);
  }
}
