import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, UpdateUserDto, ProfileStats } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users'; // Base API endpoint

  // Mock initial current user
  private currentUserSubject = new BehaviorSubject<User>({
    _id: 'usr_haneen_01',
    id: 'usr_haneen_01',
    name: 'Haneen Al-Sayed',
    email: 'haneen@studysync.edu',
    role: 'student',
    age: 21,
    studyLevel: 'Undergraduate (Senior Year)',
    organization: 'Faculty of Computer & Artificial Intelligence',
    department: 'Computer Science & Software Engineering',
    gender: 'Female',
    phone: '+20 100 123 4567',
    avatar: 'H',
    bio: 'Passionate about algorithms, system design, and building scalable full-stack applications.',
    createdAt: '2025-09-01T10:00:00Z'
  });

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get the currently authenticated user
   */
  getCurrentUser(): Observable<User> {
    return of(this.currentUserSubject.value);
  }

  /**
   * Get user by ID (GET /users/:id)
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        // Fallback to current mock user if API is offline
        return of(this.currentUserSubject.value);
      })
    );
  }

  /**
   * Update user profile information (PUT /users/:id)
   */
  updateProfile(id: string, data: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updatedUser) => {
        const currentUser = this.currentUserSubject.value;
        const merged = { ...currentUser, ...updatedUser };
        this.currentUserSubject.next(merged);
      }),
      catchError(() => {
        // Fallback update in local state
        const current = this.currentUserSubject.value;
        const updated: User = {
          ...current,
          ...data,
          updatedAt: new Date().toISOString()
        };
        this.currentUserSubject.next(updated);
        return of(updated);
      })
    );
  }

  /**
   * Get user profile summary stats
   */
  getUserStats(userId?: string): Observable<ProfileStats> {
    return of({
      joinedRooms: 5,
      completedTasks: 42,
      overallProgress: 78,
      totalTasks: 54,
      activeStreakDays: 12
    });
  }

  /**
   * Update cached current user directly (e.g. after login)
   */
  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
}
