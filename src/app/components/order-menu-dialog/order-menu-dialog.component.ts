import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface OrderMenuDialogData {
  orderId: string;
  customerName: string;
  orderType: string;
}

@Component({
  selector: 'app-order-menu-dialog',
  templateUrl: './order-menu-dialog.component.html',
  styleUrls: ['./order-menu-dialog.component.css']
})
export class OrderMenuDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderMenuDialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}