import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AdminStats, Category, SupportMessage } from '../models/admin.model';
import { User } from '../models/user.model';
import { Room } from '../models/room.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseApiUrl = `${environment.apiUrl}`;
  private usersUrl = `${this.baseApiUrl}/users`;
  private roomsUrl = `${this.baseApiUrl}/rooms`;
  private categoriesUrl = `${this.baseApiUrl}/categories`;
  private supportUrl = `${this.baseApiUrl}/support-messages`;

  constructor(private http: HttpClient) {}

  private getAuthOptions() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  // ----------------------------------------------------
  // Dashboard & Aggregated Stats
  // ----------------------------------------------------
  getDashboardStats(): Observable<AdminStats> {
    return forkJoin({
      users: this.getUsers(),
      rooms: this.getRooms(),
      categories: this.getCategories(),
      support: this.getSupportMessages()
    }).pipe(
      map((res: any) => {
        const usersCount = Array.isArray(res.users) ? res.users.length : (res.users as any)?.data?.length || 0;
        const roomsCount = Array.isArray(res.rooms) ? res.rooms.length : (res.rooms as any)?.data?.length || 0;
        const catsCount = Array.isArray(res.categories) ? res.categories.length : (res.categories as any)?.data?.length || 0;
        const supportList = Array.isArray(res.support) ? res.support : (res.support as any)?.data || [];
        const pendingSupport = supportList.filter((s: SupportMessage) => s.status === 'pending').length;

        return {
          totalUsers: usersCount,
          totalRooms: roomsCount,
          totalCategories: catsCount,
          pendingSupport: pendingSupport
        };
      })
    );
  }

  // ----------------------------------------------------
  // Users APIs
  // ----------------------------------------------------
  getUsers(): Observable<User[]> {
    return this.http.get<any>(this.usersUrl, this.getAuthOptions()).pipe(
      map((res) => (Array.isArray(res) ? res : res?.data || []))
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${this.usersUrl}/${id}`, this.getAuthOptions()).pipe(
      map((res) => res?.data || res)
    );
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<any>(`${this.usersUrl}/${id}`, data, this.getAuthOptions()).pipe(
      map((res) => res?.data || res)
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.usersUrl}/${id}`, this.getAuthOptions());
  }

  // ----------------------------------------------------
  // Rooms APIs
  // ----------------------------------------------------
  getRooms(): Observable<Room[]> {
    return this.http.get<any>(`${this.roomsUrl}/rooms`, this.getAuthOptions()).pipe(
      map((res) => (Array.isArray(res) ? res : res?.data || []))
    );
  }

  getRoomById(id: string): Observable<Room> {
    return this.http.get<any>(`${this.roomsUrl}/get/${id}`, this.getAuthOptions()).pipe(
      map((res) => res?.data || res)
    );
  }

  updateRoom(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.roomsUrl}/update/${id}`, data, this.getAuthOptions()).pipe(
      map((res) => res?.data || res)
    );
  }

  deleteRoom(id: string): Observable<any> {
    return this.http.delete(`${this.roomsUrl}/delete/${id}`, this.getAuthOptions());
  }

  getRoomTasks(roomId: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseApiUrl}/tasks/getalltasks/${roomId}`, this.getAuthOptions()).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.foundTasks)) return res.foundTasks;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.tasks)) return res.tasks;
        return [];
      }),
      catchError(() => of([]))
    );
  }

  // ----------------------------------------------------
  // Categories APIs
  // ----------------------------------------------------
  getCategories(): Observable<Category[]> {
    return this.http.get<any>(this.categoriesUrl, this.getAuthOptions()).pipe(
      map((res) => res?.categories || res?.data || (Array.isArray(res) ? res : []))
    );
  }

  getCategoryById(id: string): Observable<Category> {
    // Backend doesn't have GET /:id for categories, fallback to fetching all and filtering
    return this.getCategories().pipe(
      map(cats => cats.find(c => c._id === id || c.id === id) as Category)
    );
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<any>(this.categoriesUrl, category, this.getAuthOptions()).pipe(
      map((res) => res?.category || res?.data || res)
    );
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.patch<any>(`${this.categoriesUrl}/${id}`, category, this.getAuthOptions()).pipe(
      map((res) => res?.category || res?.data || res)
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.categoriesUrl}/${id}`, this.getAuthOptions());
  }

  getRoomMembers(roomId: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/room-members/${roomId}/members`, this.getAuthOptions());
  }

  // ----------------------------------------------------
  // Support Inbox APIs
  // ----------------------------------------------------
  getSupportMessages(): Observable<SupportMessage[]> {
    return this.http.get<any>(this.supportUrl, this.getAuthOptions()).pipe(
      map((res) => (Array.isArray(res) ? res : res?.data || []))
    );
  }

  getSupportMessageById(id: string): Observable<SupportMessage> {
    return this.http.get<any>(`${this.supportUrl}/${id}`, this.getAuthOptions()).pipe(
      map((res) => res?.data || res)
    );
  }

  updateSupportStatus(id: string, status: 'pending' | 'in_progress' | 'resolved'): Observable<SupportMessage> {
    return this.http.put<any>(`${this.supportUrl}/${id}/status`, { status }, this.getAuthOptions()).pipe(
      map((res) => res?.data || res)
    );
  }
}
