import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TaskCompletion } from '../models/task.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskCompletionService {
  private baseApiUrl = `${environment.apiUrl}`;
  private apiUrl = `${this.baseApiUrl}/task-completion`;

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
   * Complete task in database: POST /task-completion/complete
   */
  completeTask(taskId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/complete`, { taskId }, this.getAuthOptions()).pipe(
      map(res => res.data || res)
    );
  }

  /**
   * Uncomplete task in database: DELETE /task-completion/uncomplete
   */
  uncompleteTask(taskId: string): Observable<any> {
    const authOptions = this.getAuthOptions();
    const options = {
      headers: authOptions.headers,
      body: { taskId }
    };
    return this.http.delete<any>(`${this.apiUrl}/uncomplete`, options);
  }

  /**
   * Get all completed tasks for current user from database: GET /task-completion/allcompleted
   */
  getMyCompletions(): Observable<TaskCompletion[]> {
    return this.http.get<any>(`${this.apiUrl}/allcompleted`, this.getAuthOptions()).pipe(
      map(res => {
        console.log('HTTP response /task-completion/allcompleted:', res);
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        return [];
      }),
      catchError(err => {
        console.warn('Could not load completed tasks:', err);
        return of([]);
      })
    );
  }

  /**
   * Alias for backward compatibility
   */
  getCompletedTasksByUser(userId?: string): Observable<TaskCompletion[]> {
    return this.getMyCompletions();
  }
}
