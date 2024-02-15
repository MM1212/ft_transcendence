export const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 3,
});
export const numberExtentFormatter = new Intl.NumberFormat('en-US', {
  useGrouping: true,
});
