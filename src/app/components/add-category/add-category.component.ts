import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {
  categoryName: string = '';
  categories: Category[] = [];
  loading: boolean = false;
  error: string = '';
  message: string = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.error = '';
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.categories || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'שגיאה בטעינת הקטגוריות';
        this.loading = false;
      }
    });
  }

  addCategory() {
    if (this.categoryName.trim()) {
      this.loading = true;
      this.error = '';
      this.message = '';

      const categoryData = { name: this.categoryName.trim() };

      this.categoryService.addCategory(categoryData).subscribe({
        next: (response) => {
          this.message = response.message || 'הקטגוריה נוספה בהצלחה';
          this.categoryName = '';
          this.loadCategories(); // Reload the categories list
        },
        error: (error) => {
          if (error.status === 409) {
            this.error = 'קטגוריה זו כבר קיימת במערכת';
          } else {
            this.error = error.error?.error || 'שגיאה בהוספת הקטגוריה';
          }
          this.loading = false;
        }
      });
    }
  }
}