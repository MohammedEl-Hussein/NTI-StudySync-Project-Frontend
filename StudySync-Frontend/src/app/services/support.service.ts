import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupportTicket, CreateSupportTicketDto } from '../models/support.model';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private apiUrl = 'http://localhost:3001/support-messages';

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
   * Submit a new support ticket
   * POST /support-messages
   */
  createTicket(data: CreateSupportTicketDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, this.getAuthOptions()).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Get all tickets submitted by the current user
   * GET /support-messages/my
   */
  getMyTickets(): Observable<SupportTicket[]> {
    return this.http.get<any>(`${this.apiUrl}/my`, this.getAuthOptions()).pipe(
      map(res => (Array.isArray(res) ? res : res?.data || []))
    );
  }

  /**
   * Get single ticket by ID
   * GET /support-messages/:id
   */
  getTicketById(id: string): Observable<SupportTicket> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getAuthOptions()).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Get all support tickets (Admin)
   * GET /support-messages
   */
  getAllTickets(): Observable<SupportTicket[]> {
    return this.http.get<any>(this.apiUrl, this.getAuthOptions()).pipe(
      map(res => (Array.isArray(res) ? res : res?.data || []))
    );
  }

  /**
   * Update support ticket status (Admin/Staff)
   * PUT /support-messages/:id/status
   */
  updateTicketStatus(id: string, status: 'pending' | 'in_progress' | 'resolved'): Observable<SupportTicket> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}/status`,
      { status },
      this.getAuthOptions()
    ).pipe(
      map(res => res?.data || res)
    );
  }
}
