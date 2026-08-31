import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, CreateRoomDto, UpdateRoomDto } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:3001/rooms';
  private roomMembersUrl = 'http://localhost:3001/room-members';

  constructor(private http: HttpClient) { }

  getRooms(): Observable<{message: string, data: Room[]}> {
    return this.http.get<{message: string, data: Room[]}>(`${this.apiUrl}/rooms`);
  }

  getRoomById(id: string): Observable<{message: string, data: Room}> {
    return this.http.get<{message: string, data: Room}>(`${this.apiUrl}/get/${id}`);
  }

  createRoom(data: CreateRoomDto): Observable<{message: string, data: Room}> {
    return this.http.post<{message: string, data: Room}>(`${this.apiUrl}/create`, data);
  }

  updateRoom(id: string, data: UpdateRoomDto): Observable<{message: string, data: Room}> {
    return this.http.put<{message: string, data: Room}>(`${this.apiUrl}/update/${id}`, data);
  }

  deleteRoom(id: string): Observable<{message: string, data: Room}> {
    return this.http.delete<{message: string, data: Room}>(`${this.apiUrl}/delete/${id}`);
  }

  joinRoom(roomId: string): Observable<any> {
    return this.http.post(`${this.roomMembersUrl}/${roomId}/join`, {});
  }
}
