import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UsersComponent } from './components/users/users.component';
import { CategorySelectorComponent } from './components/rooms/category-selector/category-selector.component';
import { RoomCardComponent } from './components/rooms/room-card/room-card.component';
import { RoomFilterComponent } from './components/rooms/room-filter/room-filter.component';
import { RoomSearchComponent } from './components/rooms/room-search/room-search.component';
import { RoomListComponent } from './components/rooms/room-list/room-list.component';
import { CreateRoomComponent } from './components/rooms/create-room/create-room.component';
import { EditRoomComponent } from './components/rooms/edit-room/edit-room.component';
import { RoomDetailsComponent } from './components/rooms/room-details/room-details.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

// Profile Components
import { ProfileComponent } from './components/profile/profile.component';
import { EditProfileComponent } from './components/profile/edit-profile/edit-profile.component';
import { ProfileStatsComponent } from './components/profile/profile-stats/profile-stats.component';

// Room Members Components
import { RoomMembersComponent } from './components/room-members/room-members.component';
import { MemberCardComponent } from './components/room-members/member-card/member-card.component';
import { InviteMemberModalComponent } from './components/room-members/invite-member-modal/invite-member-modal.component';

// Support Components
import { SupportComponent } from './components/support/support.component';
import { SupportCreateComponent } from './components/support/support-create/support-create.component';
import { MySupportTicketsComponent } from './components/support/my-support-tickets/my-support-tickets.component';
import { SupportTicketDetailsComponent } from './components/support/support-ticket-details/support-ticket-details.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { EmptyStateComponent } from './components/shared/empty-state/empty-state.component';
import { SkeletonCardComponent } from './components/shared/skeleton-card/skeleton-card.component';

// Task & Study Plan Components
import { StudyPlanComponent } from './components/tasks/study-plan/study-plan.component';
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { TaskCreateComponent } from './components/tasks/task-create/task-create.component';
import { TaskEditComponent } from './components/tasks/task-edit/task-edit.component';
import { TaskDetailsComponent } from './components/tasks/task-details/task-details.component';

// Modules
import { SharedModule } from './shared/shared.module';

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

// Chat & Messages Components
import { ChatRoomComponent } from './components/chat/chat-room/chat-room.component';
import { ChatHeaderComponent } from './components/chat/chat-header/chat-header.component';
import { ChatMembersComponent } from './components/chat/chat-members/chat-members.component';
import { MessageListComponent } from './components/chat/message-list/message-list.component';
import { MessageItemComponent } from './components/chat/message-item/message-item.component';
import { MessageInputComponent } from './components/chat/message-input/message-input.component';
import { EditMessageComponent } from './components/chat/edit-message/edit-message.component';
import { DeleteMessageComponent } from './components/chat/delete-message/delete-message.component';
import { MessagesPageComponent } from './components/chat/messages/messages.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ToastComponent } from './components/shared/toast/toast.component';

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
    LandingPageComponent,
    ProfileComponent,
    EditProfileComponent,
    ProfileStatsComponent,
    CreateCategoryComponent,
    EditCategoryComponent,
    SupportInboxComponent,
    AdminSupportDetailsComponent,
    CategorySelectorComponent,
    RoomCardComponent,
    RoomFilterComponent,
    RoomSearchComponent,
    RoomListComponent,
    CreateRoomComponent,
    EditRoomComponent,
    RoomDetailsComponent,
    CategoriesComponent,
    RoomMembersComponent,
    MemberCardComponent,
    InviteMemberModalComponent,
    SupportComponent,
    SupportCreateComponent,
    MySupportTicketsComponent,
    SupportTicketDetailsComponent,
    SidebarComponent,
    NavbarComponent,
    MainLayoutComponent,
    EmptyStateComponent,
    SkeletonCardComponent,
    ChatRoomComponent,
    ChatHeaderComponent,
    ChatMembersComponent,
    MessageListComponent,
    MessageItemComponent,
    MessageInputComponent,
    EditMessageComponent,
    DeleteMessageComponent,
    MessagesPageComponent,
    StudyPlanComponent,
    TaskListComponent,
    TaskCreateComponent,
    TaskEditComponent,
    TaskDetailsComponent,
    DashboardComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    UsersComponent,
    SharedModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
