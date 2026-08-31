import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AdminStats, Category, SupportMessage } from '../models/admin.model';
import { User } from '../models/user.model';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseApiUrl = 'http://localhost:3000/api'; // Or relative /api
  private usersUrl = `${this.baseApiUrl}/users`;
  private roomsUrl = `${this.baseApiUrl}/rooms`;
  private categoriesUrl = `${this.baseApiUrl}/categories`;
  private supportUrl = `${this.baseApiUrl}/support-messages`;

  // Mock initial data fallbacks
  private mockUsers: User[] = [
    {
      _id: 'u_1',
      id: 'u_1',
      name: 'Salma Ahmed',
      email: 'salma.ahmed@studysync.io',
      role: 'admin',
      studyLevel: 'Senior Year',
      organization: 'Faculty of Computer Science',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date('2025-01-15T10:00:00Z')
    },
    {
      _id: 'u_2',
      id: 'u_2',
      name: 'Omar Farooq',
      email: 'omar.farooq@studysync.io',
      role: 'user',
      studyLevel: 'Junior Year',
      organization: 'AI & Data Science Institute',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date('2025-02-10T14:30:00Z')
    },
    {
      _id: 'u_3',
      id: 'u_3',
      name: 'Nour El-Din',
      email: 'nour.eldin@studysync.io',
      role: 'user',
      studyLevel: 'Master Student',
      organization: 'Department of Software Systems',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      createdAt: new Date('2025-03-01T09:15:00Z')
    },
    {
      _id: 'u_4',
      id: 'u_4',
      name: 'Haneen Tarek',
      email: 'haneen.tarek@studysync.io',
      role: 'admin',
      studyLevel: 'Senior Year',
      organization: 'Information Technology Institute',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date('2025-01-05T08:00:00Z')
    }
  ];

  private mockRooms: Room[] = [
    {
      _id: 'room_01',
      id: 'room_01',
      title: 'Distributed Systems & Cloud Architecture',
      category: 'Computer Science',
      level: 'Senior Year',
      members: 8,
      maxMembers: 12,
      progress: 72,
      description: 'Study group focusing on consensus, RPCs, Raft, Kafka, and distributed fault tolerance.',
      startDate: '2026-03-01',
      endDate: '2026-06-30'
    },
    {
      _id: 'room_02',
      id: 'room_02',
      title: 'Compiler Design & AST Optimization',
      category: 'Software Engineering',
      level: 'Senior Year',
      members: 6,
      maxMembers: 10,
      progress: 88,
      description: 'Building an end-to-end compiler with LLVM backend and IR transformations.',
      startDate: '2026-02-15',
      endDate: '2026-05-30'
    },
    {
      _id: 'room_03',
      id: 'room_03',
      title: 'Machine Learning & Deep Neural Nets',
      category: 'AI / Data Science',
      level: 'Advanced',
      members: 10,
      maxMembers: 15,
      progress: 65,
      description: 'Hands-on exploration of PyTorch, Transformers, Attention mechanisms, and LLMs.',
      startDate: '2026-03-10',
      endDate: '2026-07-15'
    }
  ];

  private mockCategories: Category[] = [
    {
      _id: 'cat_01',
      name: 'Computer Science',
      description: 'Algorithms, data structures, operating systems, networking, and foundational computing topics.',
      createdAt: new Date('2025-01-01')
    },
    {
      _id: 'cat_02',
      name: 'Software Engineering',
      description: 'Software architecture, clean code, design patterns, testing, and modern frontend/backend frameworks.',
      createdAt: new Date('2025-01-02')
    },
    {
      _id: 'cat_03',
      name: 'AI / Data Science',
      description: 'Machine learning, deep learning, NLP, computer vision, data analysis, and mathematical modeling.',
      createdAt: new Date('2025-01-03')
    },
    {
      _id: 'cat_04',
      name: 'Information Security & DevOps',
      description: 'Application security, penetration testing, CI/CD pipelines, Docker, Kubernetes, and cloud infra.',
      createdAt: new Date('2025-01-04')
    }
  ];

  private mockSupport: SupportMessage[] = [
    {
      _id: 'sup_01',
      userId: { _id: 'u_2', name: 'Omar Farooq', email: 'omar.farooq@studysync.io' },
      userName: 'Omar Farooq',
      userEmail: 'omar.farooq@studysync.io',
      subject: 'Issue joining Compiler Design Room',
      type: 'Technical Bug',
      content: 'Hello, when I click "Join Room" for room #2, the button stays spinning and doesn\'t confirm my membership.',
      status: 'pending',
      createdAt: new Date('2026-08-30T10:15:00Z')
    },
    {
      _id: 'sup_02',
      userId: { _id: 'u_3', name: 'Nour El-Din', email: 'nour.eldin@studysync.io' },
      userName: 'Nour El-Din',
      userEmail: 'nour.eldin@studysync.io',
      subject: 'Request new category for Bioinformatics',
      type: 'Feature Request',
      content: 'Could we please add a category for Computational Biology & Bioinformatics? We have a 15-student study circle starting next month.',
      status: 'in_progress',
      createdAt: new Date('2026-08-29T16:40:00Z')
    },
    {
      _id: 'sup_03',
      userId: { _id: 'u_1', name: 'Salma Ahmed', email: 'salma.ahmed@studysync.io' },
      userName: 'Salma Ahmed',
      userEmail: 'salma.ahmed@studysync.io',
      subject: 'Password reset email took 10 minutes',
      type: 'Account Issue',
      content: 'The email delivery for verification token had a slight delay yesterday. Resolved on my end after re-requesting.',
      status: 'resolved',
      createdAt: new Date('2026-08-28T11:20:00Z')
    }
  ];

  constructor(private http: HttpClient) {}

  // ----------------------------------------------------
  // Dashboard & Aggregated Stats
  // ----------------------------------------------------
  getDashboardStats(): Observable<AdminStats> {
    return forkJoin({
      users: this.getUsers().pipe(catchError(() => of(this.mockUsers))),
      rooms: this.getRooms().pipe(catchError(() => of(this.mockRooms))),
      categories: this.getCategories().pipe(catchError(() => of(this.mockCategories))),
      support: this.getSupportMessages().pipe(catchError(() => of(this.mockSupport)))
    }).pipe(
      map((res) => {
        const usersCount = Array.isArray(res.users) ? res.users.length : (res.users as any)?.data?.length || 0;
        const roomsCount = Array.isArray(res.rooms) ? res.rooms.length : (res.rooms as any)?.data?.length || 0;
        const catsCount = Array.isArray(res.categories) ? res.categories.length : (res.categories as any)?.data?.length || 0;
        const supportList = Array.isArray(res.support) ? res.support : (res.support as any)?.data || [];
        const pendingSupport = supportList.filter((s: SupportMessage) => s.status === 'pending').length;

        return {
          totalUsers: usersCount,
          totalRooms: roomsCount,
          totalCategories: catsCount,
          pendingSupport: pendingSupport
        };
      }),
      catchError(() => of({
        totalUsers: this.mockUsers.length,
        totalRooms: this.mockRooms.length,
        totalCategories: this.mockCategories.length,
        pendingSupport: this.mockSupport.filter(s => s.status === 'pending').length
      }))
    );
  }

  // ----------------------------------------------------
  // Users APIs (GET /users, GET /users/:id, DELETE /users/:id, PATCH/PUT)
  // ----------------------------------------------------
  getUsers(): Observable<User[]> {
    return this.http.get<any>(this.usersUrl).pipe(
      map((res) => (Array.isArray(res) ? res : res?.data || this.mockUsers)),
      catchError(() => of(this.mockUsers))
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${this.usersUrl}/${id}`).pipe(
      map((res) => res?.data || res || this.mockUsers[0]),
      catchError(() => {
        const found = this.mockUsers.find(u => u._id === id || u.id === id) || this.mockUsers[0];
        return of(found);
      })
    );
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<any>(`${this.usersUrl}/${id}`, data).pipe(
      map((res) => res?.data || res),
      catchError(() => {
        const index = this.mockUsers.findIndex(u => u._id === id || u.id === id);
        if (index !== -1) {
          this.mockUsers[index] = { ...this.mockUsers[index], ...data };
          return of(this.mockUsers[index]);
        }
        return of(data as User);
      })
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.usersUrl}/${id}`).pipe(
      catchError(() => {
        this.mockUsers = this.mockUsers.filter(u => u._id !== id && u.id !== id);
        return of({ success: true, message: 'User deleted successfully' });
      })
    );
  }

  // ----------------------------------------------------
  // Rooms APIs (GET /rooms, GET /rooms/:id, DELETE /rooms/:id)
  // ----------------------------------------------------
  getRooms(): Observable<Room[]> {
    return this.http.get<any>(this.roomsUrl).pipe(
      map((res) => (Array.isArray(res) ? res : res?.data || this.mockRooms)),
      catchError(() => of(this.mockRooms))
    );
  }

  getRoomById(id: string): Observable<Room> {
    return this.http.get<any>(`${this.roomsUrl}/${id}`).pipe(
      map((res) => res?.data || res || this.mockRooms[0]),
      catchError(() => {
        const found = this.mockRooms.find(r => r._id === id || r.id === id) || this.mockRooms[0];
        return of(found);
      })
    );
  }

  deleteRoom(id: string): Observable<any> {
    return this.http.delete(`${this.roomsUrl}/${id}`).pipe(
      catchError(() => {
        this.mockRooms = this.mockRooms.filter(r => r._id !== id && r.id !== id);
        return of({ success: true, message: 'Room deleted' });
      })
    );
  }

  // ----------------------------------------------------
  // Categories APIs (GET, POST, PATCH /categories/:id, DELETE)
  // ----------------------------------------------------
  getCategories(): Observable<Category[]> {
    return this.http.get<any>(this.categoriesUrl).pipe(
      map((res) => (Array.isArray(res) ? res : res?.data || this.mockCategories)),
      catchError(() => of(this.mockCategories))
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<any>(`${this.categoriesUrl}/${id}`).pipe(
      map((res) => res?.data || res || this.mockCategories[0]),
      catchError(() => {
        const found = this.mockCategories.find(c => c._id === id || c.id === id) || this.mockCategories[0];
        return of(found);
      })
    );
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<any>(this.categoriesUrl, category).pipe(
      map((res) => res?.data || res),
      catchError(() => {
        const newCat: Category = {
          _id: 'cat_' + Date.now(),
          name: category.name || 'New Category',
          description: category.description || '',
          createdAt: new Date()
        };
        this.mockCategories.push(newCat);
        return of(newCat);
      })
    );
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.patch<any>(`${this.categoriesUrl}/${id}`, category).pipe(
      map((res) => res?.data || res),
      catchError(() => {
        const index = this.mockCategories.findIndex(c => c._id === id || c.id === id);
        if (index !== -1) {
          this.mockCategories[index] = { ...this.mockCategories[index], ...category, updatedAt: new Date() };
          return of(this.mockCategories[index]);
        }
        return of({ ...category, _id: id } as Category);
      })
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.categoriesUrl}/${id}`).pipe(
      catchError(() => {
        this.mockCategories = this.mockCategories.filter(c => c._id !== id && c.id !== id);
        return of({ success: true, message: 'Category deleted' });
      })
    );
  }

  // ----------------------------------------------------
  // Support Inbox APIs (GET /support-messages, PUT /support-messages/:id/status)
  // ----------------------------------------------------
  getSupportMessages(): Observable<SupportMessage[]> {
    return this.http.get<any>(this.supportUrl).pipe(
      map((res) => (Array.isArray(res) ? res : res?.data || this.mockSupport)),
      catchError(() => of(this.mockSupport))
    );
  }

  getSupportMessageById(id: string): Observable<SupportMessage> {
    return this.http.get<any>(`${this.supportUrl}/${id}`).pipe(
      map((res) => res?.data || res || this.mockSupport[0]),
      catchError(() => {
        const found = this.mockSupport.find(s => s._id === id || s.id === id) || this.mockSupport[0];
        return of(found);
      })
    );
  }

  updateSupportStatus(id: string, status: 'pending' | 'in_progress' | 'resolved'): Observable<SupportMessage> {
    return this.http.put<any>(`${this.supportUrl}/${id}/status`, { status }).pipe(
      map((res) => res?.data || res),
      catchError(() => {
        const found = this.mockSupport.find(s => s._id === id || s.id === id);
        if (found) {
          found.status = status;
          return of(found);
        }
        return of({ _id: id, status } as SupportMessage);
      })
    );
  }
}
