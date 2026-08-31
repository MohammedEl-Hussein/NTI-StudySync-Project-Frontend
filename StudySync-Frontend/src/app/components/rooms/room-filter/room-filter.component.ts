import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-room-filter',
  templateUrl: './room-filter.component.html',
  styleUrls: ['./room-filter.component.css']
})
export class RoomFilterComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();
  categories: Category[] = [];
  filterForm: FormGroup;

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      categoryId: [''],
      level: ['']
    });
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories = res.categories,
      error: (err) => console.error('Failed to load categories', err)
    });

    this.filterForm.valueChanges.subscribe(val => {
      this.filtersChanged.emit(val);
    });
  }

  resetFilters(): void {
    this.filterForm.reset({ categoryId: '', level: '' });
  }
}
