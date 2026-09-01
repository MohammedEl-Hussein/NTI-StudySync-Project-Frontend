import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, of, throwError } from 'rxjs';
import { Message, SendMessageDto, UpdateMessageDto, MessageResponse, MessageListResponse } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:3001/messages';

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

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
   * Fetch all messages for a specific chat ID
   * API: GET /messages/chat/:chatId
   */
  getMessagesByChatId(chatId: string): Observable<Message[]> {
    this.loadingSubject.next(true);

    return this.http.get<any>(`${this.apiUrl}/chat/${chatId}`, this.getAuthHeaders()).pipe(
      map((res) => {
        let list: Message[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        } else if (res && Array.isArray(res.messages)) {
          list = res.messages;
        }
        return list;
      }),
      catchError((err) => {
        // Attempt fallback endpoint GET /messages/:chatId or GET /messages?chatId=...
        return this.http.get<any>(`${this.apiUrl}/${chatId}`, this.getAuthHeaders()).pipe(
          map((res) => {
            if (Array.isArray(res)) return res;
            if (res && Array.isArray(res.data)) return res.data;
            return [];
          }),
          catchError(() => of([]))
        );
      }),
      tap((messages) => {
        this.messagesSubject.next(messages);
        this.loadingSubject.next(false);
      })
    );
  }

  /**
   * Send a new message
   * API: POST /messages
   */
  sendMessage(data: SendMessageDto): Observable<Message> {
    return this.http.post<any>(this.apiUrl, data, this.getAuthHeaders()).pipe(
      map((res) => (res && res.data ? res.data : res)),
      tap((newMsg: Message) => {
        const current = this.messagesSubject.getValue();
        // Check if message already exists in list
        const exists = current.some((m) => m._id === newMsg._id);
        if (!exists) {
          this.messagesSubject.next([...current, newMsg]);
        }
      })
    );
  }

  /**
   * Edit an existing message
   * API: PUT /messages/:id
   */
  updateMessage(id: string, updateDto: UpdateMessageDto): Observable<Message> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updateDto, this.getAuthHeaders()).pipe(
      map((res) => (res && res.data ? res.data : res)),
      tap((updated: Message) => {
        const current = this.messagesSubject.getValue();
        const nextList = current.map((m) => (m._id === id ? { ...m, ...updated, isEdited: true } : m));
        this.messagesSubject.next(nextList);
      })
    );
  }

  /**
   * Delete a message
   * API: DELETE /messages/:id
   */
  deleteMessage(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      tap(() => {
        const current = this.messagesSubject.getValue();
        this.messagesSubject.next(current.filter((m) => m._id !== id));
      })
    );
  }

  /**
   * Set local messages in subject (e.g. for optimistic updates or resets)
   */
  setMessages(messages: Message[]): void {
    this.messagesSubject.next(messages);
  }

  /**
   * Clear active messages
   */
  clearMessages(): void {
    this.messagesSubject.next([]);
  }
}
