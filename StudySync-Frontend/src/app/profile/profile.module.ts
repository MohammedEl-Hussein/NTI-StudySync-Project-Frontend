import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ProfileStatsComponent } from './profile-stats/profile-stats.component';

@NgModule({
  declarations: [
    ProfileComponent,
    EditProfileComponent,
    ProfileStatsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ProfileRoutingModule
  ],
  exports: [
    ProfileComponent,
    EditProfileComponent,
    ProfileStatsComponent
  ]
})
export class ProfileModule {}
