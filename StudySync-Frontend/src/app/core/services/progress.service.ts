import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Progress,
  CreateProgressDto,
  UpdateProgressDto,
  OverallProgressData,
  SectionProgressItem,
  PeerProgressItem,
  RoomProgressData
} from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:3001/progresses'; // Backend URL for progresses

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
   * GET /progresses - Retrieve all progress records
   */
  getAllProgress(): Observable<Progress[]> {
    return this.http.get<any>(this.apiUrl, this.getAuthOptions()).pipe(
      map((res) => (Array.isArray(res) ? res : res?.data || []))
    );
  }

  /**
   * Calculate or fetch overall progress statistics
   */
  getOverallProgress(userId?: string): Observable<OverallProgressData> {
    return this.getAllProgress().pipe(
      map(list => {
        const totalTasks = list.reduce((acc, curr) => acc + (curr.totalTasks || 0), 0);
        const completedTasks = list.reduce((acc, curr) => acc + (curr.completedTasks || 0), 0);
        const remainingTasks = Math.max(0, totalTasks - completedTasks);
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          completedTasks,
          remainingTasks,
          totalTasks,
          percentage
        };
      })
    );
  }

  /**
   * Retrieve section-by-section progress breakdown
   */
  getSectionProgress(roomId?: string): Observable<SectionProgressItem[]> {
    return this.getAllProgress().pipe(
      map(list => {
        let filtered = list;
        if (roomId) {
          filtered = filtered.filter((p) => p.roomId === roomId);
        }
        return filtered.map((item) => ({
          section: item.section || 'General Section',
          percentage: item.percentage || 0,
          completedTasks: item.completedTasks || 0,
          totalTasks: item.totalTasks || 0,
          status: (item.percentage === 100 ? 'completed' : (item.percentage || 0) > 0 ? 'in-progress' : 'pending') as 'in-progress' | 'pending' | 'completed'
        }));
      })
    );
  }

  /**
   * GET /progresses/room/:roomId - Room-specific progress & peer comparison
   */
  getRoomProgress(roomId: string): Observable<RoomProgressData> {
    return this.http.get<any>(`${this.apiUrl}/room/${roomId}`, this.getAuthOptions()).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Retrieve peers progress list
   */
  getPeerProgress(roomId?: string): Observable<PeerProgressItem[]> {
    if (!roomId) {
      return of([]); // If no room specified, we can't fetch peers easily without an endpoint.
    }
    return this.getRoomProgress(roomId).pipe(
      map(res => res.peers || [])
    );
  }

  /**
   * POST /progresses - Create new progress record
   */
  createProgress(data: CreateProgressDto): Observable<Progress> {
    return this.http.post<any>(this.apiUrl, data, this.getAuthOptions()).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * PUT /progresses/:id - Update existing progress record
   */
  updateProgress(id: string, data: UpdateProgressDto): Observable<Progress> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, this.getAuthOptions()).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * DELETE /progresses/:id - Delete a progress record
   */
  deleteProgress(id: string): Observable<{ success: boolean }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getAuthOptions()).pipe(
      map(res => res?.data || res || { success: true })
    );
  }
}
