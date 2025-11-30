
export enum MealType {
  VEG = 'Veg',
  NON_VEG = 'Non-Veg',
}

export interface MealEntry {
  id: string; // Unique ID for each entry, useful for cancellation
  date: string; // YYYY-MM-DD format
  employeeId: string;
  employeeName: string;
  vertical: string;
  reportingManager: string;
  location: string;
  shiftTimings: string;
  mealType: MealType;
  paymentMethod?: string;
  isRedeemed?: boolean;
    redeemedAt?: string; // ISO Date string
}

export interface Payment {
  id: number;
  date: string;
  employeeId: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  amount: number; // in paise
  createdAt: string;
}

export interface Feedback {
  id: number;
  category: string;
  rating?: number;
  message: string;
  createdAt: string;
}