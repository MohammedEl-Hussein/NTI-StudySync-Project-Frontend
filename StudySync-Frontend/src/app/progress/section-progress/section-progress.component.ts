import { Component, Input } from '@angular/core';
import { SectionProgressItem } from '../../core/models/progress.model';

@Component({
  selector: 'app-section-progress',
  templateUrl: './section-progress.component.html',
  styleUrls: ['./section-progress.component.css']
})
export class SectionProgressComponent {
  @Input() sections: SectionProgressItem[] = [];
  @Input() title = 'Progress by Section & Phase';
  @Input() loading = false;

  public getProgressBarColor(percentage: number): 'success' | 'gradient' | 'warning' | 'primary' {
    if (percentage >= 100) return 'success';
    if (percentage >= 60) return 'gradient';
    if (percentage > 0) return 'primary';
    return 'warning';
  }
}
