export interface Order {
  id?: string;
  fullName: string;
  phone: string;
  anotherPhone: string;
  price: number;
  minGuests: number;
  maxGuests: number;
  date: string;  // Expected format: YYYY-MM-DDTHH:mm:ss.sssZ
  startTime: string;
  endTime: string;
  orderAmount: number;
  paidAmount: number;
  orderType: string;
  comments?: string;
}

// Helper type for calendar view
export interface OrderEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    fullName: string;
    phone: string;
    anotherPhone: string;
    price: number;
    minGuests: number;
    maxGuests: number;
    orderType: string;
    orderAmount: number;
    paidAmount: number;
    comments?: string;
  };
}

// Order types enumeration
export enum OrderType {
  WEDDING = 'חתונה',
  ENGAGMENT = 'אירוסין ',
  BIRTHDAY = 'יום הולדת',
  CORPORATE = 'אירוע עסקי',
  OTHER = 'אחר'
}

// Order status helper
export const getOrderStatus = (paidAmount: number, orderAmount: number): { text: string; color: string } => {
  if (paidAmount >= orderAmount) {
    return { text: 'שולם במלואו', color: '#4CAF50' };
  } else if (paidAmount > 0) {
    return { text: 'שולם חלקית', color: '#FF9800' };
  } else {
    return { text: 'לא שולם', color: '#F44336' };
  }
};