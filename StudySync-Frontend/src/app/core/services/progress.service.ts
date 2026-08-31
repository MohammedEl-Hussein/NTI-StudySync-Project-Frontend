import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
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
  private apiUrl = '/api/progresses';

  // In-memory mock progress records
  private mockProgressList: Progress[] = [
    {
      _id: 'prog_01',
      id: 'prog_01',
      userId: 'usr_haneen_01',
      roomId: 'room_01',
      roomTitle: 'Distributed Systems & Cloud Architecture',
      section: 'Phase 1: Foundations & RPC Protocols',
      percentage: 100,
      completedTasks: 8,
      totalTasks: 8,
      notes: 'Completed all socket programming labs and consensus review.',
      updatedAt: '2026-08-25T14:30:00Z'
    },
    {
      _id: 'prog_02',
      id: 'prog_02',
      userId: 'usr_haneen_01',
      roomId: 'room_01',
      roomTitle: 'Distributed Systems & Cloud Architecture',
      section: 'Phase 2: Raft Consensus & Replication',
      percentage: 75,
      completedTasks: 6,
      totalTasks: 8,
      notes: 'Leader election algorithm implemented. Working on log compaction.',
      updatedAt: '2026-08-28T09:15:00Z'
    },
    {
      _id: 'prog_03',
      id: 'prog_03',
      userId: 'usr_haneen_01',
      roomId: 'room_01',
      roomTitle: 'Distributed Systems & Cloud Architecture',
      section: 'Phase 3: Microservices & Event Streaming',
      percentage: 40,
      completedTasks: 4,
      totalTasks: 10,
      notes: 'Kafka broker set up. Implementing message idempotency.',
      updatedAt: '2026-08-30T18:00:00Z'
    },
    {
      _id: 'prog_04',
      id: 'prog_04',
      userId: 'usr_haneen_01',
      roomId: 'room_02',
      roomTitle: 'Compiler Design & AST Optimization',
      section: 'Phase 1: Lexical & Syntax Analysis (Lex/Yacc)',
      percentage: 90,
      completedTasks: 9,
      totalTasks: 10,
      notes: 'LR(1) parser finished with shift-reduce conflict resolution.',
      updatedAt: '2026-08-29T11:45:00Z'
    },
    {
      _id: 'prog_05',
      id: 'prog_05',
      userId: 'usr_haneen_01',
      roomId: 'room_03',
      roomTitle: 'Machine Learning & Deep Neural Nets',
      section: 'Phase 1: Feature Engineering & Baseline Models',
      percentage: 85,
      completedTasks: 17,
      totalTasks: 20,
      notes: 'GridSearchCV and cross-validation pipelines evaluated.',
      updatedAt: '2026-08-27T16:20:00Z'
    }
  ];

  private progressSubject = new BehaviorSubject<Progress[]>(this.mockProgressList);
  public progresses$ = this.progressSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * GET /progresses - Retrieve all progress records
   */
  getAllProgress(): Observable<Progress[]> {
    return this.http.get<Progress[]>(this.apiUrl).pipe(
      tap((data) => this.progressSubject.next(data)),
      catchError(() => of(this.progressSubject.value))
    );
  }

  /**
   * Calculate or fetch overall progress statistics
   */
  getOverallProgress(userId?: string): Observable<OverallProgressData> {
    const list = this.progressSubject.value;
    const totalTasks = list.reduce((acc, curr) => acc + curr.totalTasks, 0);
    const completedTasks = list.reduce((acc, curr) => acc + curr.completedTasks, 0);
    const remainingTasks = Math.max(0, totalTasks - completedTasks);
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return of({
      completedTasks: completedTasks || 44,
      remainingTasks: remainingTasks || 12,
      totalTasks: totalTasks || 56,
      percentage: percentage || 78
    });
  }

  /**
   * Retrieve section-by-section progress breakdown
   */
  getSectionProgress(roomId?: string): Observable<SectionProgressItem[]> {
    let list = this.progressSubject.value;
    if (roomId) {
      list = list.filter((p) => p.roomId === roomId);
    }

    if (list.length === 0) {
      return of([
        { section: 'Phase 1: Foundation & Requirements', percentage: 100, completedTasks: 12, totalTasks: 12, status: 'completed' },
        { section: 'Phase 2: Core Architecture & Implementation', percentage: 75, completedTasks: 15, totalTasks: 20, status: 'in-progress' },
        { section: 'Phase 3: Integration, Testing & Deployment', percentage: 40, completedTasks: 6, totalTasks: 15, status: 'in-progress' }
      ]);
    }

    return of(
      list.map((item) => ({
        section: item.section || 'General Section',
        percentage: item.percentage,
        completedTasks: item.completedTasks,
        totalTasks: item.totalTasks,
        status: (item.percentage === 100 ? 'completed' : item.percentage > 0 ? 'in-progress' : 'pending') as 'in-progress' | 'pending' | 'completed'
      }))
    );
  }

  /**
   * GET /progresses/room/:roomId - Room-specific progress & peer comparison
   */
  getRoomProgress(roomId: string): Observable<RoomProgressData> {
    return this.http.get<RoomProgressData>(`${this.apiUrl}/room/${roomId}`).pipe(
      catchError(() => {
        // Fallback room data
        const mockData: RoomProgressData = {
          roomId: roomId,
          roomTitle: roomId === 'room_02' ? 'Compiler Design & AST' : 'Distributed Systems & Cloud Architecture',
          category: 'Computer Science',
          overallProgress: 72,
          totalMembers: 8,
          completedTasks: 18,
          totalTasks: 26,
          sections: [
            { section: 'Phase 1: Foundations & Protocol Buffers', percentage: 100, completedTasks: 8, totalTasks: 8, status: 'completed' },
            { section: 'Phase 2: Consensus & Leader Election', percentage: 75, completedTasks: 6, totalTasks: 8, status: 'in-progress' },
            { section: 'Phase 3: Distributed Sharding & Testing', percentage: 40, completedTasks: 4, totalTasks: 10, status: 'in-progress' }
          ],
          peers: [
            { userId: 'u1', name: 'Haneen Mohamed', avatar: 'H', percentage: 78, completedTasks: 18, rank: 1 },
            { userId: 'u2', name: 'Zeyad Tarek', avatar: 'Z', percentage: 72, completedTasks: 16, rank: 2 },
            { userId: 'u3', name: 'Omar Khaled', avatar: 'O', percentage: 65, completedTasks: 15, rank: 3 },
            { userId: 'u4', name: 'Sara Mostafa', avatar: 'S', percentage: 55, completedTasks: 12, rank: 4 },
            { userId: 'u5', name: 'Youssef Ali', avatar: 'Y', percentage: 45, completedTasks: 10, rank: 5 }
          ]
        };
        return of(mockData);
      })
    );
  }

  /**
   * Retrieve peers progress list
   */
  getPeerProgress(roomId?: string): Observable<PeerProgressItem[]> {
    return of([
      { userId: 'u1', name: 'Haneen Mohamed', avatar: 'H', percentage: 78, completedTasks: 18, rank: 1 },
      { userId: 'u2', name: 'Zeyad Tarek', avatar: 'Z', percentage: 72, completedTasks: 16, rank: 2 },
      { userId: 'u3', name: 'Omar Khaled', avatar: 'O', percentage: 65, completedTasks: 15, rank: 3 },
      { userId: 'u4', name: 'Sara Mostafa', avatar: 'S', percentage: 55, completedTasks: 12, rank: 4 },
      { userId: 'u5', name: 'Youssef Ali', avatar: 'Y', percentage: 45, completedTasks: 10, rank: 5 }
    ]);
  }

  /**
   * POST /progresses - Create new progress record
   */
  createProgress(data: CreateProgressDto): Observable<Progress> {
    return this.http.post<Progress>(this.apiUrl, data).pipe(
      tap((newRecord) => {
        const current = this.progressSubject.value;
        this.progressSubject.next([newRecord, ...current]);
      }),
      catchError(() => {
        const newRecord: Progress = {
          _id: 'prog_' + Date.now(),
          id: 'prog_' + Date.now(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const current = this.progressSubject.value;
        this.progressSubject.next([newRecord, ...current]);
        return of(newRecord);
      })
    );
  }

  /**
   * PUT /progresses/:id - Update existing progress record
   */
  updateProgress(id: string, data: UpdateProgressDto): Observable<Progress> {
    return this.http.put<Progress>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updated) => {
        const list = this.progressSubject.value.map((p) => ((p._id === id || p.id === id) ? { ...p, ...updated } : p));
        this.progressSubject.next(list);
      }),
      catchError(() => {
        const list = this.progressSubject.value.map((p) => {
          if (p._id === id || p.id === id) {
            return {
              ...p,
              ...data,
              percentage: data.percentage !== undefined ? data.percentage : (data.totalTasks ? Math.round(((data.completedTasks || p.completedTasks) / data.totalTasks) * 100) : p.percentage),
              updatedAt: new Date().toISOString()
            };
          }
          return p;
        });
        this.progressSubject.next(list);
        const updated = list.find((p) => p._id === id || p.id === id)!;
        return of(updated);
      })
    );
  }

  /**
   * DELETE /progresses/:id - Delete a progress record
   */
  deleteProgress(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const list = this.progressSubject.value.filter((p) => p._id !== id && p.id !== id);
        this.progressSubject.next(list);
      }),
      catchError(() => {
        const list = this.progressSubject.value.filter((p) => p._id !== id && p.id !== id);
        this.progressSubject.next(list);
        return of({ success: true });
      })
    );
  }
}
