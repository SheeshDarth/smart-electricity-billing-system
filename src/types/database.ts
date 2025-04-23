
// Custom type definitions for database entities
export interface Profile {
  id: string;
  role?: string;
}

export interface Socket {
  id: string;
  number: string;
  user_id: string;
}

export interface EnergyUsage {
  id: string;
  socket_id: string;
  amount: number;
  timestamp: string;
}

export interface Billing {
  id: string;
  socket_id: string;
  amount: number;
  period: string;
  paid: boolean;
}
