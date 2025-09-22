import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  OrderMenuService,
  Category,
  OrderMenuItem,
  SimpleOrderMenuItemRequest,
  OrderMenuUpdateRequest
} from '../../services/order-menu.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-menu',
  templateUrl: './order-menu.component.html',
  styleUrls: ['./order-menu.component.css']
})
export class OrderMenuComponent implements OnInit {
  orderId: string = '';
  order: Order | null = null;
  categories: Category[] = [];
  selectedItems: Map<string, {categoryId: string}> = new Map();
  generalNotes: string = '';
  menuForm: FormGroup;
  isLoading = true;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private orderMenuService: OrderMenuService,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {
    this.menuForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || '';
    if (this.orderId) {
      this.loadOrderDetails();
      this.loadCategoriesAndMenu();
    } else {
      this.router.navigate(['/search-orders']);
    }
  }

  loadOrderDetails(): void {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.order = response.data!;
        } else {
          this.snackBar.open('Failed to load order details', 'Close', { duration: 3000 });
          this.router.navigate(['/search-orders']);
        }
      },
      error: (error) => {
        this.snackBar.open('Error loading order details', 'Close', { duration: 3000 });
        this.router.navigate(['/search-orders']);
      }
    });
  }

  loadCategoriesAndMenu(): void {
    // Load categories with sub-categories
    this.orderMenuService.getCategoriesWithSubCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data || [];
          this.loadExistingMenu();
        } else {
          this.snackBar.open('Failed to load menu categories', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.snackBar.open('Error loading menu categories', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadExistingMenu(): void {
    // Load existing menu items for this order
    this.orderMenuService.getOrderMenu(this.orderId).subscribe({
      next: (response) => {
        if (response.success) {
          if (Array.isArray(response.data)) {
            // Old format - just array of items
            this.initializeSelectedItems(response.data);
            this.generalNotes = '';
          } else if (response.data && typeof response.data === 'object') {
            // New format - object with items and general_notes
            const data = response.data as { items: OrderMenuItem[], general_notes?: string };
            this.initializeSelectedItems(data.items || []);
            this.generalNotes = data.general_notes || '';
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  initializeSelectedItems(existingItems: OrderMenuItem[]): void {
    // Pre-populate selected items from existing menu
    existingItems.forEach(item => {
      const categoryId = this.findCategoryIdBySubCategory(item.sub_category_id);
      this.selectedItems.set(item.sub_category_id, {
        categoryId: categoryId
      });
    });
  }

  findCategoryIdBySubCategory(subCategoryId: string): string {
    for (const category of this.categories) {
      if (category.sub_categories.some(sub => sub.id === subCategoryId)) {
        return category.id;
      }
    }
    return '';
  }

  // Category-based UI methods
  toggleSubCategory(subCategoryId: string, categoryId: string, checked: boolean): void {
    if (checked) {
      this.selectedItems.set(subCategoryId, {
        categoryId: categoryId
      });
    } else {
      this.selectedItems.delete(subCategoryId);
    }
  }

  isSubCategorySelected(subCategoryId: string): boolean {
    return this.selectedItems.has(subCategoryId);
  }

  // Category validation methods
  isCategoryComplete(categoryId: string): boolean {
    const category = this.categories.find(c => c.id === categoryId);
    if (!category) return false;
    
    return category.sub_categories.some(sub => this.selectedItems.has(sub.id));
  }

  getSelectedCountForCategory(categoryId: string): number {
    const category = this.categories.find(c => c.id === categoryId);
    if (!category) return 0;
    
    return category.sub_categories.filter(sub => this.selectedItems.has(sub.id)).length;
  }

  getSelectedItemsCount(): number {
    return this.selectedItems.size;
  }

  getCompleteCategoriesCount(): number {
    return this.categories.filter(category => this.isCategoryComplete(category.id)).length;
  }

  isMenuComplete(): boolean {
    return this.categories.every(category => this.isCategoryComplete(category.id));
  }

  onSubmit(): void {
    if (!this.isMenuComplete()) {
      this.snackBar.open('יש להשלים את כל הקטגוריות', 'Close', { duration: 3000 });
      return;
    }

    if (this.isSubmitting) return;
    
    this.isSubmitting = true;

    const menuItems: SimpleOrderMenuItemRequest[] = Array.from(this.selectedItems.entries()).map(([subCategoryId, item]) => ({
      order_id: this.orderId,
      sub_category_id: subCategoryId
    }));

    const requestData: OrderMenuUpdateRequest = {
      items: menuItems,
      general_notes: this.generalNotes
    };

    this.orderMenuService.updateOrderMenu(requestData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.snackBar.open('תפריט נשמר בהצלחה!', 'Close', { duration: 3000 });
          this.router.navigate(['/search-orders']);
        } else {
          this.snackBar.open('שגיאה בשמירת התפריט', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open('שגיאה בשמירת התפריט', 'Close', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/search-orders']);
  }
}