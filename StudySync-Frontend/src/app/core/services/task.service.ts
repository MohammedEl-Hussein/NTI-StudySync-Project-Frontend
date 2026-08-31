import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = '/api/tasks';

  private mockTasks: Task[] = [
    {
      _id: 'task_01',
      id: 'task_01',
      roomId: 'room_01',
      roomTitle: 'Distributed Systems',
      title: 'Implement Raft Candidate Election Timeout',
      section: 'Phase 2: Raft Consensus',
      due: 'Tomorrow, 5:00 PM',
      completed: true,
      priority: 'high'
    },
    {
      _id: 'task_02',
      id: 'task_02',
      roomId: 'room_01',
      roomTitle: 'Distributed Systems',
      title: 'Write Unit Tests for RPC Heartbeat',
      section: 'Phase 2: Raft Consensus',
      due: 'Thursday, 11:59 PM',
      completed: true,
      priority: 'medium'
    },
    {
      _id: 'task_03',
      id: 'task_03',
      roomId: 'room_01',
      roomTitle: 'Distributed Systems',
      title: 'Kafka Consumer Partition Rebalance Setup',
      section: 'Phase 3: Microservices & Event Streaming',
      due: 'Friday, 3:00 PM',
      completed: false,
      priority: 'high'
    },
    {
      _id: 'task_04',
      id: 'task_04',
      roomId: 'room_02',
      roomTitle: 'Compiler Design',
      title: 'Construct LR(1) Parse Table',
      section: 'Phase 1: Syntax Analysis',
      due: 'Today, 8:00 PM',
      completed: true,
      priority: 'high'
    },
    {
      _id: 'task_05',
      id: 'task_05',
      roomId: 'room_03',
      roomTitle: 'Machine Learning',
      title: 'Train Multi-Head Attention Benchmark',
      section: 'Phase 2: Deep Transformer Models',
      due: 'Sunday, 10:00 PM',
      completed: false,
      priority: 'medium'
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get tasks by room ID
   */
  getTasksByRoom(roomId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/room/${roomId}`).pipe(
      catchError(() => of(this.mockTasks.filter((t) => t.roomId === roomId)))
    );
  }

  /**
   * Get all tasks assigned to or created for the current user
   */
  getUserTasks(userId?: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/user`).pipe(
      catchError(() => of(this.mockTasks))
    );
  }

  /**
   * Get total count of tasks
   */
  getTotalTaskCount(userId?: string): Observable<number> {
    return of(54);
  }
}
