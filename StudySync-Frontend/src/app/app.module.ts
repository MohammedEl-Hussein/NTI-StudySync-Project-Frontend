import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    CategorySelectorComponent,
    RoomCardComponent,
    RoomFilterComponent,
    RoomSearchComponent,
    RoomListComponent,
    CreateRoomComponent,
    EditRoomComponent,
    RoomDetailsComponent,
    CategoriesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    UsersComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
