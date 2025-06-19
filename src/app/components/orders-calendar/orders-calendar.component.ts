import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Order, OrderEvent, OrderType, getOrderStatus } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders-calendar',
  templateUrl: './orders-calendar.component.html',
  styleUrls: ['./orders-calendar.component.css']
})
export class OrdersCalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    timeZone: 'Asia/Jerusalem',
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    buttonText: {
      today: 'היום',
      month: 'חודש',
      prev: 'הקודם',
      next: 'הבא'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    height: 'auto',
    locale: 'he',
    direction: 'rtl',
    eventDisplay: 'block',
    eventTextColor: '#ffffff',
    firstDay: 0  // Sunday is first day in Israel
  };

  dummyOrdersNew: OrderEvent[] = [];

  selectedEvent: OrderEvent | null = null;
  showEventDetails = false;

  // Order type colors
  private orderTypeColors = {
    [OrderType.WEDDING]: { background: '#4CAF50', border: '#388E3C' },
    [OrderType.ENGAGMENT]: { background: '#2196F3', border: '#1976D2' },
    [OrderType.BIRTHDAY]: { background: '#FF9800', border: '#F57C00' },
    [OrderType.CORPORATE]: { background: '#9C27B0', border: '#7B1FA2' },
    [OrderType.OTHER]: { background: '#607D8B', border: '#455A64' }
  };

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.calendarOptions.eventContent = (arg: any) => {
      const eventType = arg.event.extendedProps.orderType;
      const colors = this.orderTypeColors[eventType];
      arg.backgroundColor = colors.background;
      arg.borderColor = colors.border;
      return { html: arg.event.title };
    };

    this.orderService.getAllOrders().subscribe(orders => {
      this.dummyOrdersNew = orders.map(order => ({
        id: order.id || '',
        title: `${order.orderType} - ${order.fullName}`,
        start: `${order.date}T${order.startTime}:00`,
        end: `${order.date}T${order.endTime}:00`,
        extendedProps: {
          fullName: order.fullName,
          phone: order.phone,
          anotherPhone: order.anotherPhone,
          price: order.price,
          minGuests: order.minGuests,
          maxGuests: order.maxGuests,
          orderType: order.orderType,
          orderAmount: order.orderAmount,
          paidAmount: order.paidAmount,
          comments: order.comments
        }
      }));
      this.calendarOptions.events = this.dummyOrdersNew;
    });
  }

  handleEventClick(clickInfo: any) {
    this.selectedEvent = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      extendedProps: clickInfo.event.extendedProps
    };
    this.showEventDetails = true;
  }

  closeEventDetails() {
    this.showEventDetails = false;
    this.selectedEvent = null;
  }

  getStatusText(order: OrderEvent): string {
    return getOrderStatus(order.extendedProps.paidAmount, order.extendedProps.orderAmount).text;
  }

  getStatusColor(order: OrderEvent): string {
    return getOrderStatus(order.extendedProps.paidAmount, order.extendedProps.orderAmount).color;
  }

  getRemainingAmount(order: OrderEvent): number {
    if (order.extendedProps.orderAmount === undefined || order.extendedProps.paidAmount === undefined) {
      return 0;
    }
    return order.extendedProps.orderAmount - order.extendedProps.paidAmount;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}