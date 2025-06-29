export const shortenCurrency = (val: number) => {
    if (val >= 1_000) return ("$" + (val / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "K");
    return "$" + val.toLocaleString();
  }
  
export const formatCurrency = (num: number) =>
    num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const formatPercent = (num: number) => `${num}%`;