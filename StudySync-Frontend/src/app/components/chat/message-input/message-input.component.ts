import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent {
  @Input() disabled: boolean = false;
  @Input() placeholder: string = 'Type your message...';

  @Output() sendMessage = new EventEmitter<string>();

  messageText: string = '';
  showEmojiBar: boolean = false;

  quickEmojis: string[] = ['👍', '👏', '🔥', '💡', '🚀', '❤️', '🙌', '✨', '📚', '✅'];

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    const trimmed = this.messageText.trim();
    if (trimmed && !this.disabled) {
      this.sendMessage.emit(trimmed);
      this.messageText = '';
      this.showEmojiBar = false;
    }
  }

  insertEmoji(emoji: string): void {
    this.messageText += emoji;
  }

  toggleEmojiBar(): void {
    this.showEmojiBar = !this.showEmojiBar;
  }
}
