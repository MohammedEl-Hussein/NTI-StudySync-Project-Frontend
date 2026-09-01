import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css']
})
export class EmptyStateComponent {
  @Input() icon: string = '?';
  @Input() title: string = 'Nothing here';
  @Input() message: string = 'We could not find any data.';
  @Input() actionText?: string;
  @Input() actionLink?: string;
}
