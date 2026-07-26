import { describe, it, expect } from 'vitest';
import {
  clamp,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hslToHex,
} from '@/lib/colors';

describe('lib/colors.ts - Color Conversion Utilities', () => {
  describe('clamp', () => {
    it('should clamp numbers within specified range', () => {
      expect(clamp(150, 0, 255)).toBe(150);
      expect(clamp(-10, 0, 255)).toBe(0);
      expect(clamp(300, 0, 255)).toBe(255);
    });
  });

  describe('hexToRgb & rgbToHex', () => {
    it('should convert hex to RGB object accurately', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert RGB to hex string accurately', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    });
  });

  describe('rgbToHsl & hslToRgb', () => {
    it('should convert RGB to HSL accurately', () => {
      const hslRed = rgbToHsl(255, 0, 0);
      expect(Math.round(hslRed.h)).toBe(0);
      expect(Math.round(hslRed.s)).toBe(100);
      expect(Math.round(hslRed.l)).toBe(50);
    });

    it('should convert HSL to RGB accurately', () => {
      const rgb = hslToRgb(120, 100, 50);
      expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert HSL to Hex accurately', () => {
      expect(hslToHex(240, 100, 50)).toBe('#0000ff');
    });
  });
});
