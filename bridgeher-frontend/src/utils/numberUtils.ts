export const toArabicNumerals = (num: number | string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => {
    const parsed = parseInt(digit);
    return isNaN(parsed) ? digit : arabicNumerals[parsed];
  }).join('');
};
