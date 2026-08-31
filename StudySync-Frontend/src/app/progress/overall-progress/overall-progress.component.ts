import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ProgressService } from '../../core/services/progress.service';
import { OverallProgressData } from '../../core/models/progress.model';

@Component({
  selector: 'app-overall-progress',
  templateUrl: './overall-progress.component.html',
  styleUrls: ['./overall-progress.component.css']
})
export class OverallProgressComponent implements OnInit, OnChanges {
  @Input() completedTasks?: number;
  @Input() remainingTasks?: number;
  @Input() totalTasks?: number;
  @Input() percentage?: number;

  public data: OverallProgressData = {
    completedTasks: 44,
    remainingTasks: 12,
    totalTasks: 56,
    percentage: 78
  };

  public loading = false;

  constructor(private progressService: ProgressService) {}

  ngOnInit(): void {
    if (this.percentage === undefined && this.totalTasks === undefined) {
      this.loadOverallData();
    } else {
      this.updateLocalData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateLocalData();
  }

  private updateLocalData(): void {
    const total = this.totalTasks !== undefined ? this.totalTasks : (this.data.totalTasks || 56);
    const completed = this.completedTasks !== undefined ? this.completedTasks : (this.data.completedTasks || 44);
    const remaining = this.remainingTasks !== undefined ? this.remainingTasks : Math.max(0, total - completed);
    const pct = this.percentage !== undefined ? this.percentage : (total > 0 ? Math.round((completed / total) * 100) : 0);

    this.data = {
      completedTasks: completed,
      remainingTasks: remaining,
      totalTasks: total,
      percentage: pct
    };
  }

  private loadOverallData(): void {
    this.loading = true;
    this.progressService.getOverallProgress().subscribe({
      next: (res: OverallProgressData) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching overall progress:', err);
        this.loading = false;
      }
    });
  }
}
