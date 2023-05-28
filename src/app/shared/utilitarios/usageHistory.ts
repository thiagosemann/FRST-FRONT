export interface UsageHistory {
    id?: number,
    user_id: number;
    machine_id: number;
    start_time?: string;
    end_time?: Date;
    total_cost?: number;
  }