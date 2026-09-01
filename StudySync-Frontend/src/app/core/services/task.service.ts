import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseApiUrl = 'http://localhost:3001';
  private apiUrl = `${this.baseApiUrl}/tasks`;

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
   * Get all tasks for a room from database: GET /tasks/getalltasks/:roomId
   */
  getTasksByRoom(roomId: string): Observable<Task[]> {
    return this.http.get<any>(`${this.apiUrl}/getalltasks/${roomId}`, this.getAuthOptions()).pipe(
      map(res => {
        console.log('Backend response for GET /tasks/getalltasks/' + roomId, res);
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.foundTasks)) return res.foundTasks;
        if (Array.isArray(res?.tasks)) return res.tasks;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching tasks by room:', err);
        return of([]);
      })
    );
  }

  /**
   * Get tasks by section from database: GET /tasks/gettaskbysection/:roomId/:section
   */
  getTasksBySection(roomId: string, section: string): Observable<Task[]> {
    return this.http.get<any>(`${this.apiUrl}/gettaskbysection/${roomId}/${encodeURIComponent(section)}`, this.getAuthOptions()).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        return [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Search tasks by title in database: GET /tasks/gettaskbytitle/:roomId/:title
   */
  getTasksByTitle(roomId: string, title: string): Observable<Task[]> {
    return this.http.get<any>(`${this.apiUrl}/gettaskbytitle/${roomId}/${encodeURIComponent(title)}`, this.getAuthOptions()).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        return [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Get single task by ID from database: GET /tasks/gettaskbyid/:id
   */
  getTaskById(id: string): Observable<Task> {
    return this.http.get<any>(`${this.apiUrl}/gettaskbyid/${id}`, this.getAuthOptions()).pipe(
      map(res => res.data || res)
    );
  }

  /**
   * Create task in database: POST /tasks/createtask
   */
  createTask(taskData: Partial<Task>): Observable<Task> {
    return this.http.post<any>(`${this.apiUrl}/createtask`, taskData, this.getAuthOptions()).pipe(
      map(res => res.data || res)
    );
  }

  /**
   * Update task in database: PUT /tasks/updatetask/:id
   */
  updateTask(id: string, taskData: Partial<Task>): Observable<Task> {
    return this.http.put<any>(`${this.apiUrl}/updatetask/${id}`, taskData, this.getAuthOptions()).pipe(
      map(res => res.data || res)
    );
  }

  /**
   * Delete task from database: DELETE /tasks/deletetask/:id
   */
  deleteTask(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deletetask/${id}`, this.getAuthOptions());
  }
}
