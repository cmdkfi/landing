export const DEMO_PRICE = 3210;
export const validDeposit = (amount: number) => Number.isFinite(amount) && amount >= .001 && amount <= 9.99;
export function openDemo(amount: number) {
  return { collateral: amount, debt: amount * DEMO_PRICE * .5, price: DEMO_PRICE };
}
export function crashDemo(position: ReturnType<typeof openDemo>, active: boolean) {
  const price = position.price * .55;
  const actionPrice = position.debt / (.7 * position.collateral);
  if (!active || price >= actionPrice) return { ...position, price };
  // Sell at the action line, repay the proceeds and restore 50% LTV.
  const saleValue = (position.debt - .5 * position.collateral * actionPrice) / .5;
  return { price, debt: position.debt - saleValue, collateral: position.collateral - saleValue / actionPrice };
}
export const positionLtv = (p: ReturnType<typeof openDemo>) => p.debt / (p.collateral * p.price) * 100;
