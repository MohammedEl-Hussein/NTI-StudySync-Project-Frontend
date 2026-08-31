import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { ProgressRoutingModule } from './progress-routing.module';
import { ProgressComponent } from './progress.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { OverallProgressComponent } from './overall-progress/overall-progress.component';
import { SectionProgressComponent } from './section-progress/section-progress.component';
import { RoomProgressComponent } from './room-progress/room-progress.component';
import { ProgressManagementComponent } from './progress-management/progress-management.component';
import { ProgressViewComponent } from './progress-view/progress-view.component';

@NgModule({
  declarations: [
    ProgressComponent,
    ProgressBarComponent,
    OverallProgressComponent,
    SectionProgressComponent,
    RoomProgressComponent,
    ProgressManagementComponent,
    ProgressViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ProgressRoutingModule
  ],
  exports: [
    ProgressComponent,
    ProgressBarComponent,
    OverallProgressComponent,
    SectionProgressComponent,
    RoomProgressComponent,
    ProgressManagementComponent,
    ProgressViewComponent
  ]
})
export class ProgressModule {}
