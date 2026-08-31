import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UsersComponent } from './components/users/users.component';

// Modules
import { SharedModule } from './shared/shared.module';
import { ProfileModule } from './profile/profile.module';
import { ProgressModule } from './progress/progress.module';

// Admin Components
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';
import { AdminUserDetailsComponent } from './components/admin/admin-user-details/admin-user-details.component';
import { AdminRoomsComponent } from './components/admin/admin-rooms/admin-rooms.component';
import { AdminRoomDetailsComponent } from './components/admin/admin-room-details/admin-room-details.component';
import { AdminCategoriesComponent } from './components/admin/admin-categories/admin-categories.component';
import { CreateCategoryComponent } from './components/admin/create-category/create-category.component';
import { EditCategoryComponent } from './components/admin/edit-category/edit-category.component';
import { SupportInboxComponent } from './components/admin/support-inbox/support-inbox.component';
import { AdminSupportDetailsComponent } from './components/admin/admin-support-details/admin-support-details.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminUserDetailsComponent,
    AdminRoomsComponent,
    AdminRoomDetailsComponent,
    AdminCategoriesComponent,
    CreateCategoryComponent,
    EditCategoryComponent,
    SupportInboxComponent,
    AdminSupportDetailsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    UsersComponent,
    SharedModule,
    ProfileModule,
    ProgressModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
