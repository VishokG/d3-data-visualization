export type Group = 'customer_type' | 'industry' | 'acv_range' | 'team';

export const groupFileMap: Record<Group, { file: string; key: string }> = {
  customer_type: { file: 'Customer Type.json', key: 'Cust_Type' },
  industry: { file: 'Account Industry.json', key: 'Acct_Industry' },
  acv_range: { file: 'ACV Range.json', key: 'ACV_Range' },
  team: { file: 'Team.json', key: 'Team' },
};
