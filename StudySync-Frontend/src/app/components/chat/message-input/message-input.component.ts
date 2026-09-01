import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from '@angular/core';

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent implements AfterViewInit, OnChanges {
  @Input() disabled: boolean = false;
  @Input() placeholder: string = 'Type your message...';

  @Output() sendMessage = new EventEmitter<string>();

  @ViewChild('inputField') inputField!: ElementRef<HTMLInputElement>;

  messageText: string = '';
  showEmojiBar: boolean = false;
  activeCategory: string = 'smileys';
  searchQuery: string = '';

  quickEmojis: string[] = ['👍', '❤️', '🔥', '👏', '🎉', '💡', '📚', '😂', '🚀', '✅'];

  emojiCategories: EmojiCategory[] = [
    {
      id: 'smileys',
      name: 'Smileys',
      icon: '😀',
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '😉', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😎',
        '🤓', '🧐', '🥳', '🤩', '😏', '😌', '😴', '🤐', '🤫', '🤔',
        '🤯', '😱', '😭', '🥺', '😤', '😡', '🤬', '💀', '🤡', '🤖',
        '👻', '👽', '🤠', '🤝', '🙌', '👏', '🙏'
      ]
    },
    {
      id: 'gestures',
      name: 'Gestures',
      icon: '👍',
      emojis: [
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
        '👆', '👇', '☝️', '🖐️', '✋', '👊', '🤛', '🤜', '💪', '🤳',
        '✍️', '🙋', '🙆', '🤷', '🧑‍💻', '🧑‍🎓', '👩‍🏫', '👨‍🏫', '🕵️'
      ]
    },
    {
      id: 'reactions',
      name: 'Hearts & Fire',
      icon: '❤️',
      emojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '💥',
        '✨', '🌟', '⭐', '💯', '💢', '⚡', '💫', '☀️', '🌈'
      ]
    },
    {
      id: 'study',
      name: 'Study & Tech',
      icon: '📚',
      emojis: [
        '📚', '📖', '📕', '📗', '📘', '📙', '📝', '✏️', '✒️', '🖋️',
        '📌', '📎', '🧠', '💡', '🔬', '🔭', '📐', '📏', '💻', '🖥️',
        '📱', '⌨️', '🖱️', '📊', '📈', '📉', '🎒', '🎓', '🏫', '🔍'
      ]
    },
    {
      id: 'fun',
      name: 'Fun & Food',
      icon: '🎉',
      emojis: [
        '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🎯', '🚀',
        '⏳', '⏰', '⏱️', '☕', '🍵', '🍕', '🍔', '🍟', '🍩', '🍫',
        '🍿', '🎧', '🎵', '🎶', '🎮', '🕹️', '🎨', '🎭', '✅', '❌', '⚠️'
      ]
    }
  ];

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.focusInput();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] && !this.disabled) {
      this.focusInput();
    }
  }

  get currentCategoryEmojis(): string[] {
    const cat = this.emojiCategories.find((c) => c.id === this.activeCategory);
    return cat ? cat.emojis : this.quickEmojis;
  }

  focusInput(): void {
    setTimeout(() => {
      try {
        if (this.inputField?.nativeElement) {
          this.inputField.nativeElement.focus();
        }
      } catch {}
    }, 50);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    } else if (event.key === 'Escape' && this.showEmojiBar) {
      this.showEmojiBar = false;
    }
  }

  submit(): void {
    const trimmed = this.messageText.trim();
    if (trimmed && !this.disabled) {
      this.sendMessage.emit(trimmed);
      this.messageText = '';
      this.showEmojiBar = false;
      this.focusInput();
    }
  }

  insertEmoji(emoji: string): void {
    this.messageText += emoji;
    this.focusInput();
  }

  setCategory(categoryId: string): void {
    this.activeCategory = categoryId;
  }

  toggleEmojiBar(): void {
    this.showEmojiBar = !this.showEmojiBar;
    if (this.showEmojiBar) {
      // Keep input focused or focus category
    } else {
      this.focusInput();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showEmojiBar = false;
    }
  }
}
