import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ProgressService } from '../../core/services/progress.service';
import { SectionProgressItem } from '../../core/models/progress.model';

@Component({
  selector: 'app-section-progress',
  templateUrl: './section-progress.component.html',
  styleUrls: ['./section-progress.component.css']
})
export class SectionProgressComponent implements OnInit, OnChanges {
  @Input() roomId?: string;
  @Input() sections: SectionProgressItem[] = [];
  @Input() title = 'Progress by Section & Phase';

  public loading = false;

  constructor(private progressService: ProgressService) {}

  ngOnInit(): void {
    if (!this.sections || this.sections.length === 0) {
      this.loadSections();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomId'] && !changes['roomId'].firstChange) {
      this.loadSections();
    }
  }

  public loadSections(): void {
    this.loading = true;
    this.progressService.getSectionProgress(this.roomId).subscribe({
      next: (items: SectionProgressItem[]) => {
        this.sections = items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading section progress:', err);
        this.loading = false;
      }
    });
  }

  public getProgressBarColor(percentage: number): 'success' | 'gradient' | 'warning' | 'primary' {
    if (percentage >= 100) return 'success';
    if (percentage >= 60) return 'gradient';
    if (percentage > 0) return 'primary';
    return 'warning';
  }
}
