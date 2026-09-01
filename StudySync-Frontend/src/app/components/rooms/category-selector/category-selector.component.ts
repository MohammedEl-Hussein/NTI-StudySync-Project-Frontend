import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectorComponent),
      multi: true
    }
  ]
})
export class CategorySelectorComponent implements OnInit, ControlValueAccessor {
  categories: Category[] = [];
  selectedCategories: string[] = [];
  isDisabled = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories = res.categories,
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  writeValue(value: string[]): void {
    if (value) {
      this.selectedCategories = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onCategoryToggle(categoryId: string, event: any): void {
    if (event.target.checked) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
    this.onChange(this.selectedCategories);
    this.onTouched();
  }

  isChecked(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }
}
