import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3001/categories';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<{message: string, categories: Category[]}> {
    return this.http.get<{message: string, categories: Category[]}>(this.apiUrl);
  }
}
