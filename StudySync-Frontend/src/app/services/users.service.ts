import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiURL = 'http://localhost:3001/users';

  constructor(private http: HttpClient) { }

  private getAuthOptions() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  getUsers(): Observable<any> {
    return this.http.get(this.apiURL, this.getAuthOptions());
  }

  addUser(user: any): Observable<any> {
    return this.http.post(this.apiURL, user);
  }

  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.apiURL}/login`, credentials);
  }

  update(user: any): Observable<any> {
    const userId = user._id || user.id;
    const url = `${this.apiURL}/${userId}`;
    return this.http.put(url, user, this.getAuthOptions());
  }

  deleteUser(id: any): Observable<any> {
    const url = `${this.apiURL}/${id}`;
    return this.http.delete(url, this.getAuthOptions());
  }
}