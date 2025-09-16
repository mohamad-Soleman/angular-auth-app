import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubCategoryService, SubCategory, Category } from '../../services/sub-category.service';
import { CategoryService } from '../../services/category.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-sub-category',
  templateUrl: './add-sub-category.component.html',
  styleUrls: ['./add-sub-category.component.css']
})
export class AddSubCategoryComponent implements OnInit, OnDestroy {
  subCategoryForm: FormGroup;
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private subCategoryService: SubCategoryService,
    private categoryService: CategoryService
  ) {
    this.subCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      parentCategoryId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubCategories();
    
    // Subscribe to sub-categories updates
    this.subCategoryService.subCategories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(subCategories => {
        this.subCategories = subCategories;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.categories || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showMessage('שגיאה בטעינת הקטגוריות', 'error');
      }
    });
  }

  loadSubCategories(): void {
    this.subCategoryService.loadSubCategories();
  }

  onSubmit(): void {
    if (this.subCategoryForm.valid) {
      this.isLoading = true;
      const { name, parentCategoryId } = this.subCategoryForm.value;

      this.subCategoryService.addSubCategory(name, parentCategoryId).subscribe({
        next: (response) => {
          this.showMessage('תת-קטגוריה נוספה בהצלחה!', 'success');
          this.resetForm();
          this.loadSubCategories(); // Reload the list
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error adding sub-category:', error);
          let errorMessage = 'שגיאה בהוספת התת-קטגוריה';
          
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.errors) {
            errorMessage = Object.values(error.error.errors).join(', ');
          }
          
          this.showMessage(errorMessage, 'error');
          this.isLoading = false;
        }
      });
    }
  }

  deleteSubCategory(subCategoryId: string): void {
    if (confirm('האם אתה בטוח שברצונך למחוק תת-קטגוריה זו?')) {
      this.subCategoryService.deleteSubCategory(subCategoryId).subscribe({
        next: (response) => {
          this.showMessage('תת-קטגוריה נמחקה בהצלחה!', 'success');
          this.loadSubCategories(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting sub-category:', error);
          this.showMessage('שגיאה במחיקת התת-קטגוריה', 'error');
        }
      });
    }
  }

  resetForm(): void {
    this.subCategoryForm.reset();
    this.message = '';
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    // Clear message after 5 seconds
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
