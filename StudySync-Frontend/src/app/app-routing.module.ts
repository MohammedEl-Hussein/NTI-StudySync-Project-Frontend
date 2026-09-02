import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UsersComponent } from './components/users/users.component';

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

// Room Components
import { RoomListComponent } from './components/rooms/room-list/room-list.component';
import { CreateRoomComponent } from './components/rooms/create-room/create-room.component';
import { RoomDetailsComponent } from './components/rooms/room-details/room-details.component';
import { EditRoomComponent } from './components/rooms/edit-room/edit-room.component';
import { RoomMembersComponent } from './components/room-members/room-members.component';

// Support Components
import { SupportComponent } from './components/support/support.component';
import { SupportCreateComponent } from './components/support/support-create/support-create.component';
import { SupportTicketDetailsComponent } from './components/support/support-ticket-details/support-ticket-details.component';

import { CategoriesComponent } from './components/categories/categories.component';
// Profile Components
import { ProfileComponent } from './components/profile/profile.component';
import { EditProfileComponent } from './components/profile/edit-profile/edit-profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { PreventLogoutGuard } from './core/guards/prevent-logout.guard';

import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { ChatRoomComponent } from './components/chat/chat-room/chat-room.component';
import { MessagesPageComponent } from './components/chat/messages/messages.component';

// Task & Study Plan Components
import { StudyPlanComponent } from './components/tasks/study-plan/study-plan.component';
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { TaskCreateComponent } from './components/tasks/task-create/task-create.component';
import { TaskEditComponent } from './components/tasks/task-edit/task-edit.component';
import { TaskDetailsComponent } from './components/tasks/task-details/task-details.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
  { path: 'home', component: LandingPageComponent },
  { path: 'landing', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Admin Portal Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canDeactivate: [PreventLogoutGuard],
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

  // Main User Portal Routes
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    canDeactivate: [PreventLogoutGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'rooms', component: RoomListComponent },
      { path: 'my-rooms', component: RoomListComponent, data: { myRoomsOnly: true } },
      { path: 'rooms/create', component: CreateRoomComponent },
      { path: 'rooms/:id/edit', component: EditRoomComponent },
      { path: 'rooms/:id/chat', component: ChatRoomComponent },
      { path: 'rooms/:id/study-plan', component: StudyPlanComponent },
      { path: 'rooms/:id', component: RoomDetailsComponent },
      { path: 'messages', component: MessagesPageComponent },
      { path: 'rooms/:id/members', component: RoomMembersComponent },
      { path: 'rooms/:roomId/tasks', component: TaskListComponent },
      { path: 'rooms/:roomId/tasks/create', component: TaskCreateComponent },
      { path: 'tasks/:id', component: TaskDetailsComponent },
      { path: 'tasks/:id/edit', component: TaskEditComponent },
      { path: 'support', component: SupportComponent },
      { path: 'support/create', component: SupportCreateComponent },
      { path: 'support/:id', component: SupportTicketDetailsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/edit', component: EditProfileComponent },
      {
        path: 'progress',
        loadChildren: () => import('./progress/progress.module').then((m) => m.ProgressModule)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
