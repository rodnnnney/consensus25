export const shortenString = (str: string, startChars: number = 6, endChars: number = 6): string => {
  if (!str) return '';
  if (str.length <= startChars + endChars) return str;
  
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};
