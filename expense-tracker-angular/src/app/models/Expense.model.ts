export interface Expense {
    id: string;
    user_id: string;
    cycle_id: string;
    title: string;
    amount: number;
    recorded_date: Date;
}