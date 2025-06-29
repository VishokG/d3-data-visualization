export type Grouping = 'customer_type' | 'industry' | 'acv_range' | 'team';

export interface DataSet {
    closed_fiscal_quarter: string;
    count: number;
    acv: number;
    category: string
}