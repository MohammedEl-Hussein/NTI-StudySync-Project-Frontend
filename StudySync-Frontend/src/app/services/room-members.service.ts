import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomMember, InviteMemberDto } from '../models/room-member.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomMembersService {
  private apiUrl = `${environment.apiUrl}/room-members`;

  constructor(private http: HttpClient) {}

  private getAuthOptions() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  /**
   * Get all members of a room
   * GET /room-members/:roomId/members
   */
  getRoomMembers(roomId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${roomId}/members`, this.getAuthOptions());
  }

  /**
   * Join a room
   * POST /room-members/:roomId/join
   */
  joinRoom(roomId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${roomId}/join`, {}, this.getAuthOptions());
  }

  /**
   * Invite / add a member to a room
   * POST /room-members/:roomId/members
   */
  inviteMember(roomId: string, data: InviteMemberDto | { userId: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${roomId}/members`, data, this.getAuthOptions());
  }

  /**
   * Remove a member from a room
   * DELETE /room-members/:roomId/members/:userId
   */
  removeMember(roomId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${roomId}/members/${userId}`, this.getAuthOptions());
  }

  /**
   * Leave a room
   * DELETE /room-members/:roomId/leave
   */
  leaveRoom(roomId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${roomId}/leave`, this.getAuthOptions());
  }

  /**
   * Update member role (e.g. promote to admin or demote)
   * PUT /room-members/:roomId/members/:userId/role
   */
  updateMemberRole(roomId: string, userId: string, role: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${roomId}/members/${userId}/role`,
      { role },
      this.getAuthOptions()
    );
  }
}
