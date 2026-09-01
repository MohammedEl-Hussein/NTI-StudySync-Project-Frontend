import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Message } from '../../../models/message.model';

@Component({
  selector: 'app-delete-message',
  templateUrl: './delete-message.component.html',
  styleUrls: ['./delete-message.component.css']
})
export class DeleteMessageComponent {
  @Input() message: Message | null = null;
  @Input() isOpen: boolean = false;
  @Input() isDeleting: boolean = false;

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    if (this.message && !this.isDeleting) {
      this.confirm.emit(this.message._id);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
