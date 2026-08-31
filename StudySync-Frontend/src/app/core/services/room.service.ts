import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = '/api/rooms';

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
      description: 'Study group focusing on consensus, RPCs, Raft, Kafka, and distributed fault tolerance.'
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
      description: 'Building an end-to-end compiler with LLVM backend and IR transformations.'
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
      description: 'Hands-on exploration of PyTorch, Transformers, Attention mechanisms, and LLMs.'
    },
    {
      _id: 'room_04',
      id: 'room_04',
      title: 'Database Internals & Storage Engines',
      category: 'Systems',
      level: 'Senior Year',
      members: 5,
      maxMembers: 8,
      progress: 50,
      description: 'LSM-Trees, B+ Trees, WAL, transaction isolation and ACID implementation.'
    },
    {
      _id: 'room_05',
      id: 'room_05',
      title: 'Computer Networks & Socket Programming',
      category: 'Networking',
      level: 'Undergraduate',
      members: 7,
      maxMembers: 10,
      progress: 92,
      description: 'TCP/IP stack, congestion control, HTTP/3, and low-level packet crafting.'
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get all rooms joined by current user
   */
  getJoinedRooms(userId?: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/my-rooms`).pipe(
      catchError(() => of(this.mockRooms))
    );
  }

  /**
   * Get room by ID
   */
  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${roomId}`).pipe(
      catchError(() => {
        const found = this.mockRooms.find((r) => r._id === roomId || r.id === roomId) || this.mockRooms[0];
        return of(found);
      })
    );
  }

  /**
   * Get count of joined rooms
   */
  getJoinedRoomsCount(userId?: string): Observable<number> {
    return of(this.mockRooms.length);
  }
}
