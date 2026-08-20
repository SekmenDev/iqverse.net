import { describe, it, expect } from 'vitest';
import { generateMockDataset, generateLorem } from '@/lib/fake-data';

describe('Fake Data Generator Engine (lib/fake-data)', () => {
  it('generates mock users dataset', () => {
    const users = generateMockDataset('users', 10);
    expect(users).toHaveLength(10);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
  });

  it('generates mock products dataset', () => {
    const products = generateMockDataset('products', 5);
    expect(products).toHaveLength(5);
    expect(products[0]).toHaveProperty('title');
    expect(products[0]).toHaveProperty('price');
  });

  it('generates lorem ipsum paragraphs', () => {
    const lorem = generateLorem('paragraphs', 3);
    const paragraphs = lorem.split('\n\n');
    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0].length).toBeGreaterThan(20);
  });
});
