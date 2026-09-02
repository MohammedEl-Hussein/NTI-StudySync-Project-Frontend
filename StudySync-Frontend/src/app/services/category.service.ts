import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<{message: string, categories: Category[]}> {
    return this.http.get<{message: string, categories: Category[]}>(this.apiUrl);
  }

  createCategory(name: string): Observable<{message: string, category: Category}> {
    return this.http.post<{message: string, category: Category}>(this.apiUrl, { name });
  }

  updateCategory(id: string, name: string): Observable<{message: string, category: Category}> {
    return this.http.put<{message: string, category: Category}>(`${this.apiUrl}/${id}`, { name });
  }

  deleteCategory(id: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`);
  }
}
