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

import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'rooms', component: RoomListComponent },
      { path: 'rooms/create', component: CreateRoomComponent },
      { path: 'rooms/:id/edit', component: EditRoomComponent },
      { path: 'rooms/:id', component: RoomDetailsComponent },
    ]
  },
  
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
