import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent {
  @Input() percentage = 0;
  @Input() showLabel = true;
  @Input() label = '';
  @Input() color: 'gradient' | 'primary' | 'success' | 'warning' | 'purple' = 'gradient';
  @Input() height = '8px';
  @Input() animated = true;
  @Input() subtitle = '';

  get safePercentage(): number {
    if (isNaN(this.percentage) || this.percentage < 0) return 0;
    if (this.percentage > 100) return 100;
    return Math.round(this.percentage);
  }
}
