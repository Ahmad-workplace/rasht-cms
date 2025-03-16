const farsiNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const convertToFarsiNumber = (n: number): string => {
  return n.toString().replace(/\d/g, (d) => farsiNumbers[parseInt(d)]);
};