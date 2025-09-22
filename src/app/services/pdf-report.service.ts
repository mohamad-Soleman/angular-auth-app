import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../models/order.model';
import { OrderMenuService, OrderMenuItem } from './order-menu.service';

@Injectable({
  providedIn: 'root'
})
export class PdfReportService {

  constructor(private orderMenuService: OrderMenuService) {}

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768) ||
           ('ontouchstart' in window);
  }

  private generateHTMLReport(order: Order, menuItems: OrderMenuItem[], generalNotes: string, categories: any[]): string {
    const groupedItems = this.groupMenuItemsByCategory(menuItems, categories);
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>דוח הזמנה</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', 'Arial', 'Helvetica', sans-serif;
            direction: rtl;
            text-align: right;
            margin: 0;
            padding: 0;
            background: white;
            color: #333;
            line-height: 1.5;
            font-size: 14px;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm 15mm 30mm 15mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
            margin-bottom: 20px;
            page-break-after: always;
          }
          .content-wrapper {
            padding-bottom: 50mm;
            min-height: calc(100% - 50mm);
            page-break-inside: avoid;
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 3px solid #3f51b5;
            padding-bottom: 15px;
          }
          .header h1 {
            color: #3f51b5;
            font-size: 24px;
            margin: 0;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
            padding-bottom: 10px;
            orphans: 4;
            widows: 4;
            break-inside: avoid;
            page-break-before: auto;
            page-break-after: auto;
          }
          .section h2 {
            color: #3f51b5;
            font-size: 18px;
            margin-bottom: 12px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 8px;
            font-weight: bold;
          }
          .order-details {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-radius: 10px;
            border-right: 5px solid #3f51b5;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            page-break-inside: avoid;
            orphans: 2;
            widows: 2;
          }
          .detail-row {
            display: flex;
            margin-bottom: 8px;
            align-items: flex-start;
            padding: 5px 0;
          }
          .detail-label {
            font-weight: bold;
            color: #495057;
            min-width: 130px;
            margin-left: 15px;
            font-size: 14px;
          }
          .detail-value {
            color: #212529;
            flex: 1;
            font-size: 14px;
            word-break: break-word;
          }
          .menu-section {
            margin-top: 25px;
            page-break-inside: avoid;
            break-inside: avoid;
            orphans: 4;
            widows: 4;
          }
          .category-section {
            margin-bottom: 25px;
            background: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            page-break-inside: avoid;
            break-inside: avoid;
            orphans: 3;
            widows: 3;
            page-break-before: auto;
            page-break-after: auto;
          }
          .category-title {
            background: linear-gradient(135deg, #3f51b5 0%, #2c3e50 100%);
            color: white;
            padding: 12px 18px;
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          }
          .subcategories-list {
            padding: 0;
            margin: 0;
          }
          .subcategory-item {
            padding: 10px 18px;
            border-bottom: 1px solid #f1f3f4;
            background: #fafbfc;
            transition: background-color 0.2s;
            page-break-inside: avoid;
            orphans: 2;
            widows: 2;
          }
          .subcategory-item:last-child {
            border-bottom: none;
          }
          .subcategory-item:nth-child(even) {
            background: #ffffff;
          }
          .subcategory-name {
            font-weight: 600;
            color: #2c3e50;
            font-size: 15px;
            margin-bottom: 3px;
          }
          .subcategory-notes {
            color: #6c757d;
            font-style: italic;
            font-size: 13px;
            margin-right: 10px;
            padding-right: 8px;
            border-right: 2px solid #3f51b5;
            background: rgba(63, 81, 181, 0.05);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 5px;
          }
          .general-notes {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            padding: 15px;
            border-radius: 8px;
            border-right: 4px solid #ffc107;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            page-break-inside: avoid;
            orphans: 2;
            widows: 2;
          }
          .general-notes h3 {
            color: #856404;
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            font-weight: bold;
          }
          .general-notes p {
            margin: 0;
            color: #6c757d;
            font-size: 14px;
            line-height: 1.6;
          }
          .page-break {
            page-break-before: always;
          }
          .force-page-break {
            page-break-before: always;
            break-before: page;
          }
          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
            orphans: 4;
            widows: 4;
          }
          .category-break {
            height: 20px;
            page-break-before: always;
            break-before: page;
          }
          .footer {
            position: absolute;
            bottom: 20mm;
            left: 15mm;
            right: 15mm;
            text-align: center;
            color: #6c757d;
            font-size: 11px;
            border-top: 1px solid #dee2e6;
            padding-top: 8px;
          }
          .page-number {
            position: absolute;
            bottom: 15mm;
            left: 50%;
            transform: translateX(-50%);
            color: #6c757d;
            font-size: 10px;
          }
          @media print {
            .page {
              box-shadow: none;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>דוח הזמנה מפורט</h1>
        </div>

        <div class="page">
          <div class="content-wrapper">
            <div class="section">
              <h2>פרטי ההזמנה</h2>
            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">שם הלקוח:</span>
                <span class="detail-value">${order.fullName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">מספר טלפון:</span>
                <span class="detail-value">${order.phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">טלפון נוסף:</span>
                <span class="detail-value">${order.anotherPhone || 'לא צוין'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">סוג האירוע:</span>
                <span class="detail-value">${order.orderType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">תאריך האירוע:</span>
                <span class="detail-value">${order.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">שעת התחלה:</span>
                <span class="detail-value">${order.startTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">שעת סיום:</span>
                <span class="detail-value">${order.endTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">מספר אורחים:</span>
                <span class="detail-value">${order.minGuests} - ${order.maxGuests}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">הערות:</span>
                <span class="detail-value">${order.comments || 'אין הערות'}</span>
              </div>
              ${order.price !== undefined ? `
              <div class="detail-row">
                <span class="detail-label">מחיר בסיס:</span>
                <span class="detail-value">₪${order.price}</span>
              </div>
              ` : ''}
              ${order.orderAmount !== undefined ? `
              <div class="detail-row">
                <span class="detail-label">סכום כולל:</span>
                <span class="detail-value">₪${order.orderAmount}</span>
              </div>
              ` : ''}
              ${order.paidAmount !== undefined ? `
              <div class="detail-row">
                <span class="detail-label">סכום ששולם:</span>
                <span class="detail-value">₪${order.paidAmount}</span>
              </div>
              ` : ''}
              ${order.orderAmount !== undefined && order.paidAmount !== undefined ? `
              <div class="detail-row">
                <span class="detail-label">יתרה לתשלום:</span>
                <span class="detail-value">₪${order.orderAmount - order.paidAmount}</span>
              </div>
              ` : ''}
            </div>
          </div>
          </div>
        </div>

        ${menuItems.length > 0 ? `
        <div class="page-break"></div>
        <div class="page">
          <div class="content-wrapper">
            <div class="section menu-section">
            <h2>פרטי התפריט</h2>
            ${Object.keys(groupedItems).map((categoryName, index) => `
              <div class="category-section">
                <h3 class="category-title">${categoryName}</h3>
                <div class="subcategories-list">
                  ${groupedItems[categoryName].map(item => `
                    <div class="subcategory-item">
                      <div class="subcategory-name">${item.sub_category_name}</div>
                      ${item.notes ? `<div class="subcategory-notes">${item.notes}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
              ${index < Object.keys(groupedItems).length - 1 ? '<div class="category-break"></div>' : ''}
            `).join('')}
            
            ${generalNotes ? `
            <div class="general-notes">
              <h3>הערות כלליות לתפריט:</h3>
              <p>${generalNotes}</p>
            </div>
            ` : ''}
          </div>
          <div class="page-number">עמוד 2</div>
        </div>
        ` : ''}

        <div class="footer">
          <p>דוח נוצר בתאריך: ${new Date().toLocaleDateString('he-IL')} | מערכת ניהול הזמנות</p>
        </div>
        <div class="page-number">עמוד 1</div>
      </body>
      </html>
    `;
  }

  async generateOrderReport(order: Order): Promise<void> {
    try {
      // Check if device is mobile
      const isMobile = this.isMobileDevice();
      
      if (isMobile) {
        // Use mobile-friendly PDF generation
        await this.generateMobilePDF(order);
        return;
      }

      // Get order menu data
      const menuResponse = await this.orderMenuService.getOrderMenu(order.id!).toPromise();
      
      let menuItems: OrderMenuItem[] = [];
      let generalNotes = '';
      
      if (menuResponse?.data) {
        if (Array.isArray(menuResponse.data)) {
          // Old format - just array of items
          menuItems = menuResponse.data;
        } else if (typeof menuResponse.data === 'object' && 'items' in menuResponse.data) {
          // New format - object with items and general_notes
          menuItems = menuResponse.data.items || [];
          generalNotes = menuResponse.data.general_notes || '';
        }
      }

      // Get categories to properly group menu items
      const categoriesResponse = await this.orderMenuService.getCategoriesWithSubCategories().toPromise();
      const categories = categoriesResponse?.data || [];

      // Group menu items by category
      const groupedItems = this.groupMenuItemsByCategory(menuItems, categories);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Page 1: Order Details
      const orderDetailsHtml = this.generateOrderDetailsHTML(order);
      await this.addHTMLPageToPDF(pdf, orderDetailsHtml, 1);

      // Pages 2+: Menu Details (multiple categories per page)
      if (Object.keys(groupedItems).length > 0) {
        const categoriesPerPage = 2; // Show 2 categories per page
        
        // Maintain the same order as the order-menu page by using the original categories array
        const orderedCategoryEntries: [string, OrderMenuItem[]][] = [];
        for (const category of categories) {
          if (groupedItems[category.name]) {
            orderedCategoryEntries.push([category.name, groupedItems[category.name]]);
          }
        }
        
        let pageNumber = 2;
        
        // Group categories into pages
        for (let i = 0; i < orderedCategoryEntries.length; i += categoriesPerPage) {
          const pageCategories = orderedCategoryEntries.slice(i, i + categoriesPerPage);
          const menuPageHtml = this.generateAggregatedMenuPageHTML(pageCategories, pageNumber, categories);
          await this.addHTMLPageToPDF(pdf, menuPageHtml, pageNumber);
          pageNumber++;
        }

        // Add general notes page if exists
        if (generalNotes) {
          const notesPageHtml = this.generateGeneralNotesHTML(generalNotes, pageNumber);
          await this.addHTMLPageToPDF(pdf, notesPageHtml, pageNumber);
        }
      }

      // Save the PDF
      const fileName = `order-report-${order.fullName}-${order.date}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error('Error generating report');
    }
  }

  private async addHTMLPageToPDF(pdf: jsPDF, htmlContent: string, pageNumber: number): Promise<void> {
    // Create a temporary div to render the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.direction = 'rtl';
    tempDiv.style.textAlign = 'right';
    tempDiv.style.paddingTop = '10mm'; // Top spacing
    tempDiv.style.paddingBottom = '10mm'; // Bottom spacing
    document.body.appendChild(tempDiv);

    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove temporary div
    document.body.removeChild(tempDiv);

    // Add page to PDF
    if (pageNumber > 1) {
      pdf.addPage();
    }

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 285; // Reduced height to account for spacing (295 - 10mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add top margin for spacing
    const topMargin = 5; // 5mm top margin
    
    // If the content fits on one page, add it directly with margins
    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, topMargin, imgWidth, imgHeight);
    } else {
      // If content is too tall, split it across pages
      let heightLeft = imgHeight;
      let position = topMargin;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + topMargin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }
  }

  private generateOrderDetailsHTML(order: Order): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>דוח הזמנה</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3f51b5;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #3f51b5;
            font-size: 24px;
            margin: 0;
          }
          .order-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-right: 4px solid #3f51b5;
          }
          .detail-row {
            display: flex;
            margin-bottom: 10px;
          }
          .detail-label {
            font-weight: bold;
            min-width: 120px;
            margin-left: 15px;
          }
          .detail-value {
            flex: 1;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>דוח הזמנה מפורט</h1>
        </div>
        <div class="order-details">
          <div class="detail-row">
            <span class="detail-label">שם הלקוח:</span>
            <span class="detail-value">${order.fullName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">טלפון:</span>
            <span class="detail-value">${order.phone}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">טלפון נוסף:</span>
            <span class="detail-value">${order.anotherPhone || 'לא צוין'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">שם נוסף:</span>
            <span class="detail-value">${order.anotherName || 'לא צוין'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">סוג האירוע:</span>
            <span class="detail-value">${order.orderType}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">תאריך האירוע:</span>
            <span class="detail-value">${order.date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">שעת התחלה:</span>
            <span class="detail-value">${order.startTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">שעת סיום:</span>
            <span class="detail-value">${order.endTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">מספר אורחים:</span>
            <span class="detail-value">${order.minGuests ? (order.maxGuests ? `${order.minGuests} - ${order.maxGuests}` : order.minGuests.toString()) : 'לא צוין'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">הערות:</span>
            <span class="detail-value">${order.comments || 'אין הערות'}</span>
          </div>
          ${order.extras && order.extras.length > 0 ? `
          <div class="detail-row">
            <span class="detail-label">תוספות:</span>
            <span class="detail-value">${order.extras.join(', ')}</span>
          </div>
          ` : ''}
          <div class="detail-row">
            <span class="detail-label">מחיר בסיס:</span>
            <span class="detail-value">₪${order.price || 'לא צוין'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">סכום כולל:</span>
            <span class="detail-value">₪${order.orderAmount}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">סכום ששולם:</span>
            <span class="detail-value">₪${order.paidAmount}</span>
          </div>
          ${order.orderAmount > order.paidAmount ? `
          <div class="detail-row">
            <span class="detail-label">יתרה לתשלום:</span>
            <span class="detail-value">₪${order.orderAmount - order.paidAmount}</span>
          </div>
          ` : ''}
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          עמוד 1
        </div>
      </body>
      </html>
    `;
  }

  private generateAggregatedMenuPageHTML(pageCategories: [string, OrderMenuItem[]][], pageNumber: number, allCategories: any[]): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>דוח תפריט - עמוד ${pageNumber}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
            margin: 0;
            padding: 15px;
            background: white;
            color: #333;
            min-height: 100vh;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #3f51b5;
            padding-bottom: 15px;
          }
          .header h1 {
            color: #3f51b5;
            font-size: 22px;
            margin: 0;
          }
          .categories-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 20px;
          }
          .category-section {
            background: #ffffff;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            flex: 1;
          }
          .category-title {
            background: linear-gradient(135deg, #3f51b5 0%, #2c3e50 100%);
            color: white;
            padding: 12px 16px;
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .category-icon {
            font-size: 18px;
          }
          .selection-summary {
            background: #f8f9fa;
            padding: 8px 16px;
            border-bottom: 1px solid #dee2e6;
            font-size: 13px;
            color: #666;
          }
          .subcategories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 6px;
            padding: 12px;
          }
          .subcategory-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
            background-color: #fafafa;
            transition: all 0.2s ease;
            min-height: 36px;
            font-size: 12px;
          }
          .subcategory-item.selected {
            border-color: #1976d2;
            background-color: #e3f2fd;
            box-shadow: 0 1px 3px rgba(25, 118, 210, 0.2);
          }
          .subcategory-checkbox {
            width: 14px;
            height: 14px;
            border: 2px solid #ccc;
            border-radius: 2px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .subcategory-checkbox.checked {
            background: #1976d2;
            border-color: #1976d2;
          }
          .subcategory-checkbox.checked::after {
            content: '✓';
            color: white;
            font-size: 10px;
            font-weight: bold;
          }
          .subcategory-name {
            font-weight: 500;
            color: #424242;
            line-height: 1.2;
            flex: 1;
            font-size: 11px;
          }
          .subcategory-item.selected .subcategory-name {
            color: #1976d2;
            font-weight: 600;
          }
          .subcategory-notes {
            color: #6c757d;
            font-style: italic;
            font-size: 10px;
            margin-top: 2px;
            padding: 2px 6px;
            background: rgba(63, 81, 181, 0.05);
            border-radius: 3px;
            border-right: 1px solid #3f51b5;
          }
          .page-number {
            text-align: center;
            margin-top: 15px;
            color: #666;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>תפריט האוכל</h1>
        </div>
        <div class="categories-container">
          ${pageCategories.map(([categoryName, items]) => {
            const categoryData = allCategories.find(cat => cat.name === categoryName);
            const allSubcategories = categoryData?.sub_categories || [];
            const selectedSubcategoryIds = new Set(items.map(item => item.sub_category_id));
            
            return `
              <div class="category-section">
                <div class="category-title">
                  <span class="category-icon">🍽️</span>
                  <span>${categoryName}</span>
                </div>
                <div class="selection-summary">
                  נבחרו ${items.length} מתוך ${allSubcategories.length} מנות בקטגוריה זו
                </div>
                <div class="subcategories-grid">
                  ${allSubcategories.map(subCategory => {
                    const isSelected = selectedSubcategoryIds.has(subCategory.id);
                    const selectedItem = items.find(item => item.sub_category_id === subCategory.id);
                    return `
                      <div class="subcategory-item ${isSelected ? 'selected' : ''}">
                        <div class="subcategory-checkbox ${isSelected ? 'checked' : ''}"></div>
                        <div class="subcategory-name">${subCategory.name}</div>
                        ${selectedItem && selectedItem.notes ? `
                          <div class="subcategory-notes">${selectedItem.notes}</div>
                        ` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="page-number">עמוד ${pageNumber}</div>
      </body>
      </html>
    `;
  }

  private generateMenuPageHTML(categoryName: string, items: OrderMenuItem[], pageNumber: number, allCategories: any[]): string {
    // Find the category data to get all subcategories
    const categoryData = allCategories.find(cat => cat.name === categoryName);
    const allSubcategories = categoryData?.sub_categories || [];
    
    // Create a set of selected subcategory IDs for quick lookup
    const selectedSubcategoryIds = new Set(items.map(item => item.sub_category_id));
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>דוח תפריט - ${categoryName}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3f51b5;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #3f51b5;
            font-size: 24px;
            margin: 0;
          }
          .category-section {
            background: #ffffff;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .category-title {
            background: linear-gradient(135deg, #3f51b5 0%, #2c3e50 100%);
            color: white;
            padding: 15px 20px;
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .category-icon {
            font-size: 20px;
          }
          .selection-summary {
            background: #f8f9fa;
            padding: 10px 20px;
            border-bottom: 1px solid #dee2e6;
            font-size: 14px;
            color: #666;
          }
          .subcategories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 8px;
            padding: 16px;
          }
          .subcategory-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
            background-color: #fafafa;
            transition: all 0.2s ease;
            min-height: 40px;
            font-size: 13px;
          }
          .subcategory-item.selected {
            border-color: #1976d2;
            background-color: #e3f2fd;
            box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
          }
          .subcategory-checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid #ccc;
            border-radius: 3px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .subcategory-checkbox.checked {
            background: #1976d2;
            border-color: #1976d2;
          }
          .subcategory-checkbox.checked::after {
            content: '✓';
            color: white;
            font-size: 12px;
            font-weight: bold;
          }
          .subcategory-name {
            font-weight: 500;
            color: #424242;
            line-height: 1.2;
            flex: 1;
          }
          .subcategory-item.selected .subcategory-name {
            color: #1976d2;
            font-weight: 600;
          }
          .subcategory-notes {
            color: #6c757d;
            font-style: italic;
            font-size: 12px;
            margin-top: 4px;
            padding: 4px 8px;
            background: rgba(63, 81, 181, 0.05);
            border-radius: 4px;
            border-right: 2px solid #3f51b5;
          }
          .page-number {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>תפריט האוכל - ${categoryName}</h1>
        </div>
        <div class="category-section">
          <div class="category-title">
            <span class="category-icon">🍽️</span>
            <span>${categoryName}</span>
          </div>
          <div class="selection-summary">
            נבחרו ${items.length} מתוך ${allSubcategories.length} מנות בקטגוריה זו
          </div>
          <div class="subcategories-grid">
            ${allSubcategories.map(subCategory => {
              const isSelected = selectedSubcategoryIds.has(subCategory.id);
              const selectedItem = items.find(item => item.sub_category_id === subCategory.id);
              return `
                <div class="subcategory-item ${isSelected ? 'selected' : ''}">
                  <div class="subcategory-checkbox ${isSelected ? 'checked' : ''}"></div>
                  <div class="subcategory-name">${subCategory.name}</div>
                  ${selectedItem && selectedItem.notes ? `
                    <div class="subcategory-notes">${selectedItem.notes}</div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="page-number">עמוד ${pageNumber}</div>
      </body>
      </html>
    `;
  }

  private generateGeneralNotesHTML(generalNotes: string, pageNumber: number): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>הערות כלליות</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3f51b5;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #3f51b5;
            font-size: 24px;
            margin: 0;
          }
          .general-notes {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            padding: 20px;
            border-radius: 8px;
            border-right: 4px solid #ffc107;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .general-notes h3 {
            color: #856404;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: bold;
          }
          .general-notes p {
            margin: 0;
            color: #6c757d;
            font-size: 16px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>הערות כלליות לתפריט</h1>
        </div>
        <div class="general-notes">
          <h3>הערות כלליות לתפריט:</h3>
          <p>${generalNotes}</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          עמוד ${pageNumber}
        </div>
      </body>
      </html>
    `;
  }

  private groupMenuItemsByCategory(menuItems: OrderMenuItem[], categories: any[]): { [categoryName: string]: OrderMenuItem[] } {
    const grouped: { [categoryName: string]: OrderMenuItem[] } = {};
    
    // Debug: Log the data we have
    console.log('Menu items for grouping:', menuItems);
    console.log('Categories for grouping:', categories);
    
    menuItems.forEach(item => {
      // Find the category for this subcategory
      let categoryName = 'קטגוריה לא ידועה';
      
      for (const category of categories) {
        if (category.sub_categories && category.sub_categories.some((sub: any) => sub.id === item.sub_category_id)) {
          categoryName = category.name;
          break;
        }
      }
      
      // Debug: Log each item mapping
      console.log('Mapping menu item:', {
        sub_category_id: item.sub_category_id,
        sub_category_name: item.sub_category_name,
        mapped_to_category: categoryName
      });
      
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(item);
    });
    
    console.log('Grouped menu items:', grouped);
    return grouped;
  }

  private async generateMobilePDF(order: Order): Promise<void> {
    try {
      // Get order menu data
      const menuResponse = await this.orderMenuService.getOrderMenu(order.id!).toPromise();
      
      let menuItems: OrderMenuItem[] = [];
      let generalNotes = '';
      
      if (menuResponse?.data) {
        if (Array.isArray(menuResponse.data)) {
          menuItems = menuResponse.data;
        } else if (typeof menuResponse.data === 'object' && 'items' in menuResponse.data) {
          menuItems = menuResponse.data.items || [];
          generalNotes = menuResponse.data.general_notes || '';
        }
      }

      // Get categories
      const categoriesResponse = await this.orderMenuService.getCategoriesWithSubCategories().toPromise();
      const categories = categoriesResponse?.data || [];

      // Create a simple text-based report for mobile
      const reportContent = this.generateMobileReportContent(order, menuItems, generalNotes, categories);
      
      // Create a new window with the report content
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(reportContent);
        newWindow.document.close();
        
        // Add print functionality
        newWindow.focus();
        setTimeout(() => {
          newWindow.print();
        }, 500);
      } else {
        // Fallback: show alert with instructions
        alert('דוח הוכן! אנא השתמש בפונקציית הדפסה של הדפדפן כדי לשמור את הדוח כ-PDF.');
      }
      
    } catch (error) {
      console.error('Error generating mobile PDF report:', error);
      throw new Error('Error generating mobile report');
    }
  }

  private generateMobileReportContent(order: Order, menuItems: OrderMenuItem[], generalNotes: string, categories: any[]): string {
    const groupedItems = this.groupMenuItemsByCategory(menuItems, categories);
    
    let menuContent = '';
    for (const [categoryName, items] of Object.entries(groupedItems)) {
      menuContent += `<h3>${categoryName}</h3><ul>`;
      for (const item of items) {
        menuContent += `<li>${item.sub_category_name}`;
        if (item.notes) {
          menuContent += ` - ${item.notes}`;
        }
        menuContent += `</li>`;
      }
      menuContent += `</ul>`;
    }

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>דוח הזמנה - ${order.fullName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            text-align: right;
            margin: 20px;
            line-height: 1.6;
          }
          h1, h2, h3 {
            color: #333;
            border-bottom: 2px solid #3f51b5;
            padding-bottom: 10px;
          }
          .order-details {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .menu-section {
            margin-bottom: 20px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>דוח הזמנה</h1>
        
        <div class="order-details">
          <h2>פרטי ההזמנה</h2>
          <p><strong>שם הלקוח:</strong> ${order.fullName}</p>
          <p><strong>טלפון:</strong> ${order.phone}</p>
          ${order.anotherPhone ? `<p><strong>טלפון נוסף:</strong> ${order.anotherPhone}</p>` : ''}
          ${order.anotherName ? `<p><strong>שם נוסף:</strong> ${order.anotherName}</p>` : ''}
          <p><strong>סוג האירוע:</strong> ${order.orderType}</p>
          <p><strong>תאריך האירוע:</strong> ${order.date}</p>
          <p><strong>שעת התחלה:</strong> ${order.startTime}</p>
          <p><strong>שעת סיום:</strong> ${order.endTime}</p>
          ${order.minGuests && order.maxGuests ? `<p><strong>מספר אורחים:</strong> ${order.minGuests} - ${order.maxGuests}</p>` : ''}
          ${order.comments ? `<p><strong>הערות:</strong> ${order.comments}</p>` : ''}
          ${order.extras && order.extras.length > 0 ? `
            <p><strong>תוספות:</strong></p>
            <ul>
              ${order.extras.map(extra => `<li>${extra}</li>`).join('')}
            </ul>
          ` : ''}
          ${order.price ? `<p><strong>מחיר בסיס:</strong> ₪${order.price}</p>` : ''}
        </div>

        <div class="menu-section">
          <h2>פרטי התפריט</h2>
          ${menuContent}
        </div>

        ${generalNotes ? `
        <div class="menu-section">
          <h2>הערות כלליות לתפריט</h2>
          <p>${generalNotes}</p>
        </div>
        ` : ''}

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #3f51b5; color: white; border: none; border-radius: 5px; cursor: pointer;">
            הדפס דוח
          </button>
        </div>
      </body>
      </html>
    `;
  }
}
