export enum MealType {
  VEG = 'Veg',
  NON_VEG = 'Non_Veg',
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
}