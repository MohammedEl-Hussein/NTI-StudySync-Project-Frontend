import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of, switchMap } from 'rxjs';
import { Chat, ChatResponse, ChatListResponse, CreateChatDto } from '../models/chat.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chats`;
  private roomsUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  /**
   * Get all chats
   */
  getChats(): Observable<Chat[]> {
    return this.http.get<any>(this.apiUrl, this.getAuthHeaders()).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        if (res && Array.isArray(res.chats)) return res.chats;
        return [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Get chat by chat ID
   */
  getChatById(chatId: string): Observable<Chat> {
    return this.http.get<any>(`${this.apiUrl}/${chatId}`, this.getAuthHeaders()).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  /**
   * Get chat by room ID or create one if not yet initialized
   */
  getChatByRoomId(roomId: string): Observable<Chat> {
    return this.http.get<any>(`${this.apiUrl}/room/${roomId}`, this.getAuthHeaders()).pipe(
      map((res) => (res && res.data ? res.data : res)),
      catchError(() => {
        // If room chat doesn't exist yet, attempt to create/initialize it or provide fallback
        return this.createChat({ roomId }).pipe(
          map((createdRes) => (createdRes && (createdRes as any).data ? (createdRes as any).data : createdRes)),
          catchError(() => {
            // Return virtual fallback chat object with roomId
            const fallbackChat: Chat = {
              _id: roomId,
              roomId: roomId,
              createdAt: new Date().toISOString()
            };
            return of(fallbackChat);
          })
        );
      })
    );
  }

  /**
   * Create a new chat session for a room
   */
  createChat(data: CreateChatDto): Observable<Chat> {
    return this.http.post<any>(this.apiUrl, data, this.getAuthHeaders()).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }
}
