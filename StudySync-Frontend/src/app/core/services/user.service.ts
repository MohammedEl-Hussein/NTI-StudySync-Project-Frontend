import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, UpdateUserDto, ProfileStats } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  private initialUser: User = {
    _id: 'usr_haneen_01',
    id: 'usr_haneen_01',
    name: 'Haneen Mohamed',
    email: 'haneen@studysync.edu',
    role: 'student',
    age: 22,
    studyLevel: 'Undergraduate (Senior Year)',
    organization: 'Faculty of Computer & Artificial Intelligence',
    department: 'Computer Science & Software Engineering',
    gender: 'Female',
    phone: '+20 100 123 4567',
    avatar: 'H',
    bio: 'Passionate about algorithms, system design, and building scalable full-stack applications.',
    createdAt: '2025-09-01T10:00:00Z'
  };

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser$: Observable<User>;

  constructor(private http: HttpClient) {
    let savedUser = null;
    try {
      const stored = localStorage.getItem('currentUser') || localStorage.getItem('user');
      if (stored) {
        savedUser = JSON.parse(stored);
      }
    } catch (e) {}

    const startingUser = savedUser ? { ...this.initialUser, ...savedUser } : this.initialUser;
    this.currentUserSubject = new BehaviorSubject<User>(startingUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  getCurrentUser(): Observable<User> {
    return of(this.currentUserSubject.value);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(this.currentUserSubject.value))
    );
  }

  updateProfile(id: string, data: UpdateUserDto): Observable<User> {
    const current = this.currentUserSubject.value;
    const updated: User = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('currentUser', JSON.stringify(updated));
    } catch (e) {}

    this.currentUserSubject.next(updated);

    return this.http.put<User>(`${this.apiUrl}/${id}`, data).pipe(
      tap((backendUser) => {
        const merged = { ...updated, ...backendUser };
        try {
          localStorage.setItem('currentUser', JSON.stringify(merged));
        } catch (e) {}
        this.currentUserSubject.next(merged);
      }),
      catchError(() => of(updated))
    );
  }

  getUserStats(userId?: string): Observable<ProfileStats> {
    return of({
      joinedRooms: 5,
      completedTasks: 42,
      overallProgress: 78,
      totalTasks: 54,
      activeStreakDays: 12
    });
  }

  setCurrentUser(user: User): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (e) {}
    this.currentUserSubject.next(user);
  }
}
