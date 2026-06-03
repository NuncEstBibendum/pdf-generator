export const formatVatRate = (number: number) => {
  const percentage = Math.round(number * 1000) / 10;

  return Number.isInteger(percentage)
    ? percentage.toFixed(0)
    : percentage.toFixed(1);
};
