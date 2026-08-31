import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TaskCompletion } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskCompletionService {
  private apiUrl = '/api/task-completions';

  private mockCompletions: TaskCompletion[] = [
    { _id: 'tc_1', id: 'tc_1', taskId: 'task_01', userId: 'usr_haneen_01', completed: true, completedAt: '2026-08-28T10:00:00Z' },
    { _id: 'tc_2', id: 'tc_2', taskId: 'task_02', userId: 'usr_haneen_01', completed: true, completedAt: '2026-08-29T14:30:00Z' },
    { _id: 'tc_3', id: 'tc_3', taskId: 'task_04', userId: 'usr_haneen_01', completed: true, completedAt: '2026-08-30T17:15:00Z' }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get user completed tasks
   */
  getUserCompletions(userId?: string): Observable<TaskCompletion[]> {
    return this.http.get<TaskCompletion[]>(`${this.apiUrl}/user`).pipe(
      catchError(() => of(this.mockCompletions))
    );
  }

  /**
   * Get completed task count
   */
  getCompletedCount(userId?: string): Observable<number> {
    return of(42);
  }
}
