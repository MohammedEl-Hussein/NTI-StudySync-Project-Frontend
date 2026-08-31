import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UsersComponent } from './components/users/users.component';

import { RoomListComponent } from './components/rooms/room-list/room-list.component';
import { CreateRoomComponent } from './components/rooms/create-room/create-room.component';
import { RoomDetailsComponent } from './components/rooms/room-details/room-details.component';
import { EditRoomComponent } from './components/rooms/edit-room/edit-room.component';
import { CategoriesComponent } from './components/categories/categories.component';

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

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'users', component: UsersComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'rooms', component: RoomListComponent },
  { path: 'rooms/create', component: CreateRoomComponent },
  { path: 'rooms/:id/edit', component: EditRoomComponent },
  { path: 'rooms/:id', component: RoomDetailsComponent },

  // Admin Portal Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'users/:id', component: AdminUserDetailsComponent },
      { path: 'rooms', component: AdminRoomsComponent },
      { path: 'rooms/:id', component: AdminRoomDetailsComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'categories/create', component: CreateCategoryComponent },
      { path: 'categories/edit/:id', component: EditCategoryComponent },
      { path: 'support', component: SupportInboxComponent },
      { path: 'support/:id', component: AdminSupportDetailsComponent }
    ]
  },

  // Student Modules
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule)
  },
  {
    path: 'progress',
    loadChildren: () => import('./progress/progress.module').then((m) => m.ProgressModule)
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
