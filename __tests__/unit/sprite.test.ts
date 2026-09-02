import { describe, it, expect } from 'vitest';
import { calculateSpriteSheet } from '@/lib/sprite';

describe('Sprite Generator Engine (lib/sprite)', () => {
  it('calculates grid coordinates, canvas dimension and CSS mappings', () => {
    const iconNames = ['home', 'user', 'settings', 'search', 'mail'];
    const sheet = calculateSpriteSheet(iconNames, 32, 8, 3);

    // cell size = 32 + 8*2 = 48
    // cols = 3 -> width = 3 * 48 = 144
    // rows = ceil(5/3) = 2 -> height = 2 * 48 = 96
    expect(sheet.canvasWidth).toBe(144);
    expect(sheet.canvasHeight).toBe(96);
    expect(sheet.cols).toBe(3);
    expect(sheet.rows).toBe(2);

    expect(sheet.jsonMapping['home']).toEqual({ x: 8, y: 8, width: 32, height: 32 });
    expect(sheet.jsonMapping['search']).toEqual({ x: 8, y: 56, width: 32, height: 32 });
    expect(sheet.css).toContain('.icon-home');
    expect(sheet.css).toContain('.icon-search');
  });

  it('handles empty icon list', () => {
    const sheet = calculateSpriteSheet([], 32, 8, 4);
    expect(sheet.canvasWidth).toBe(0);
    expect(sheet.canvasHeight).toBe(0);
    expect(sheet.css).toBe('');
  });
});
