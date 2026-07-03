// Planka Mobile — Typography Tokens
// Using Inter font family from Google Fonts

import { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const fontSize = {
  /** 11px - tiny labels */
  xs: 11,
  /** 12px - captions, badges */
  sm: 12,
  /** 14px - body small, secondary text */
  md: 14,
  /** 16px - body, primary text */
  lg: 16,
  /** 18px - subtitles */
  xl: 18,
  /** 20px - section headers */
  '2xl': 20,
  /** 24px - page titles */
  '3xl': 24,
  /** 28px - large titles */
  '4xl': 28,
  /** 32px - hero titles */
  '5xl': 32,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 26,
  '2xl': 28,
  '3xl': 32,
  '4xl': 36,
  '5xl': 40,
} as const;

export const typography = {
  // Display
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['5xl'],
    lineHeight: lineHeight['5xl'],
  } as TextStyle,

  displayMedium: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['4xl'],
    lineHeight: lineHeight['4xl'],
  } as TextStyle,

  // Headings
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
  } as TextStyle,

  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
  } as TextStyle,

  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  } as TextStyle,

  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  } as TextStyle,

  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  } as TextStyle,

  bodySemiBold: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  } as TextStyle,

  // Small
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  } as TextStyle,

  captionMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  } as TextStyle,

  // Tiny
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  } as TextStyle,

  // Button
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  } as TextStyle,
} as const;
