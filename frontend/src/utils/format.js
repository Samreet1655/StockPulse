const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const money = (n) => f.format(n || 0);
export const date = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const unitPrice = (p, qty) => [...(p.bulkTiers || [])].sort((a, b) => b.minQty - a.minQty).find((t) => qty >= t.minQty)?.price ?? p.basePrice;
