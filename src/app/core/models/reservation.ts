export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Reservation {
  id: number;
  date: string;           
  startTime: string;   
  endTime: string;        
  room: string;           
  seat?: string;
  userId: number;
  status: ReservationStatus;
}
