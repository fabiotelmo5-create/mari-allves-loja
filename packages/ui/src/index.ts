export const colors = {
  rosé50: '#FFF9FA',
  rosé100: '#FDF0F3',
  rosé400: '#E3A7B5',
  rosé600: '#C98798',
  rosé700: '#A85F70',
  gray50: '#F7F6F6',
  white: '#FFFFFF',
} as const;

export type BrandColor = keyof typeof colors;
