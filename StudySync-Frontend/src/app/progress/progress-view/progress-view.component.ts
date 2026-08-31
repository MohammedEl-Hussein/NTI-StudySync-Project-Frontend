import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../../core/services/progress.service';
import { SectionProgressItem, PeerProgressItem, OverallProgressData } from '../../core/models/progress.model';

@Component({
  selector: 'app-progress-view',
  templateUrl: './progress-view.component.html',
  styleUrls: ['./progress-view.component.css']
})
export class ProgressViewComponent implements OnInit {
  public overallPercentage = 78;
  public completedTasks = 44;
  public remainingTasks = 12;
  public totalTasks = 56;

  public sectionProgress: SectionProgressItem[] = [];
  public peers: PeerProgressItem[] = [];

  constructor(private progressService: ProgressService) {}

  ngOnInit(): void {
    this.progressService.getOverallProgress().subscribe((data: OverallProgressData) => {
      this.overallPercentage = data.percentage;
      this.completedTasks = data.completedTasks;
      this.remainingTasks = data.remainingTasks;
      this.totalTasks = data.totalTasks;
    });

    this.progressService.getSectionProgress().subscribe((sections) => {
      this.sectionProgress = sections;
    });

    this.progressService.getPeerProgress().subscribe((peers) => {
      this.peers = peers;
    });
  }
}
