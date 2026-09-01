import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Message } from '../../../models/message.model';

@Component({
  selector: 'app-edit-message',
  templateUrl: './edit-message.component.html',
  styleUrls: ['./edit-message.component.css']
})
export class EditMessageComponent implements OnChanges {
  @Input() message: Message | null = null;
  @Input() isOpen: boolean = false;
  @Input() isSaving: boolean = false;

  @Output() save = new EventEmitter<{ id: string; content: string }>();
  @Output() cancel = new EventEmitter<void>();

  editedContent: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && this.message) {
      this.editedContent = this.message.content || '';
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSave();
    }
  }

  onSave(): void {
    const trimmed = this.editedContent.trim();
    if (this.message && trimmed && !this.isSaving) {
      this.save.emit({
        id: this.message._id,
        content: trimmed
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
