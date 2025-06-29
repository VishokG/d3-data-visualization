export type Grouping = 'customer_type' | 'industry' | 'acv_range' | 'team';

export interface Data {
    closed_fiscal_quarter: string;
    count: number;
    acv: number;
    category: string
}