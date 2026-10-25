export const colors = {
  rosé50: '#FBF0F2',
  rosé100: '#F4E4E8',
  rosé400: '#C98798',
  rosé700: '#713E4B',
  rosé900: '#43252D',
  gray50: '#F7F6F6',
  white: '#FFFFFF',
} as const;

export type BrandColor = keyof typeof colors;
