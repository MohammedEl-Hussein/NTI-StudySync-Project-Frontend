import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgressComponent } from './progress.component';
import { RoomProgressComponent } from './room-progress/room-progress.component';
import { ProgressManagementComponent } from './progress-management/progress-management.component';

const routes: Routes = [
  { path: '', component: ProgressComponent },
  { path: 'room/:roomId', component: RoomProgressComponent },
  { path: 'manage', component: ProgressManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgressRoutingModule {}
