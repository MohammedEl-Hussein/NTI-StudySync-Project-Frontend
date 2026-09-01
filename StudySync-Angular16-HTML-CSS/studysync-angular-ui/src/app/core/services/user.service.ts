import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User, UpdateUserDto, ProfileStats } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3001/users';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.reloadCurrentUser();
  }

  private getAuthOptions() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  public reloadCurrentUser(): void {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('currentUser') || localStorage.getItem('user');

    if (!token || !stored) {
      this.currentUserSubject.next(null);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      this.currentUserSubject.next(parsed);
      const userId = parsed._id || parsed.id || parsed.userId;
      if (userId) {
        this.fetchUserFromBackend(userId).subscribe();
      }
    } catch (e) {
      this.currentUserSubject.next(null);
    }
  }

  public fetchUserFromBackend(userId: string): Observable<User | null> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`, this.getAuthOptions()).pipe(
      map(res => {
        const u = res?.data || res?.user || res;
        if (u) {
          const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const merged = { ...stored, ...u };
          localStorage.setItem('currentUser', JSON.stringify(merged));
          localStorage.setItem('user', JSON.stringify(merged));
          this.currentUserSubject.next(merged);
          return merged;
        }
        return this.currentUserSubject.value;
      }),
      catchError(() => of(this.currentUserSubject.value))
    );
  }

  getCurrentUser(): Observable<User | null> {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('currentUser') || localStorage.getItem('user');
    
    if (!token || !stored) {
      this.currentUserSubject.next(null);
      return of(null);
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(stored);
    } catch (e) {
      return of(null);
    }

    const userId = parsed._id || parsed.id || parsed.userId;
    if (userId) {
      return this.fetchUserFromBackend(userId);
    }

    return of(parsed);
  }

  getUserById(id: string): Observable<User | null> {
    return this.fetchUserFromBackend(id);
  }

  updateProfile(id: string, data: UpdateUserDto): Observable<User> {
    const stored = localStorage.getItem('currentUser') || localStorage.getItem('user');
    let realUserId = id;
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u._id || u.id || u.userId) {
          realUserId = u._id || u.id || u.userId;
        }
      } catch (e) {}
    }

    const payload: any = {
      name: data.name?.trim(),
      age: data.age ? Number(data.age) : undefined,
      studyLevel: data.studyLevel,
      organization: data.organization?.trim(),
      department: data.department?.trim(),
      gender: data.gender,
      phone: data.phone?.trim()
    };

    console.log('Sending PUT /users/' + realUserId, payload);

    return this.http.put<any>(`${this.apiUrl}/${realUserId}`, payload, this.getAuthOptions()).pipe(
      map((res) => {
        const backendUser = res?.data || res?.user || res;
        const current = this.currentUserSubject.value || {};
        const merged: User = { ...current, ...backendUser, ...payload, _id: realUserId, id: realUserId };
        localStorage.setItem('currentUser', JSON.stringify(merged));
        localStorage.setItem('user', JSON.stringify(merged));
        this.currentUserSubject.next(merged);
        return merged;
      }),
      catchError((err) => {
        console.error('Error updating user in MongoDB:', err);
        const current = this.currentUserSubject.value || {};
        const localMerged: User = { ...current, ...payload, _id: realUserId, id: realUserId };
        localStorage.setItem('currentUser', JSON.stringify(localMerged));
        localStorage.setItem('user', JSON.stringify(localMerged));
        this.currentUserSubject.next(localMerged);
        return of(localMerged);
      })
    );
  }

  getUserStats(userId?: string): Observable<ProfileStats> {
    return of({
      joinedRooms: 0,
      completedTasks: 0,
      overallProgress: 0,
      totalTasks: 0,
      activeStreakDays: 1
    });
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(user);
  }
}
