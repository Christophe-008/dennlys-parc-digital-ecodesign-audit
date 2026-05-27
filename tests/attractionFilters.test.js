import { describe, expect, it } from 'vitest';
import { filterByCategory, filterByMinSize } from '../src/utils/attractionFilters.js';

const fixtures = [
  { categorie: 'famille', sous_categorie: 'eau', taille: { min: 120 } },
  { categorie: 'enfant', sous_categorie: 'terre', taille: { min: 80 } },
  { categorie: 'restaurant', sous_categorie: null, taille: { min: null } },
  { categorie: 'sensation', sous_categorie: 'terre', taille: { min: 140 } },
];

describe('filterByCategory', () => {
  it('excludes restaurant for all category', () => {
    const result = filterByCategory(fixtures, 'all');
    expect(result).toHaveLength(3);
    expect(result.some((item) => item.categorie === 'restaurant')).toBe(false);
  });

  it('returns eau attractions when category is eau', () => {
    const result = filterByCategory(fixtures, 'eau');
    expect(result).toHaveLength(1);
    expect(result[0].sous_categorie).toBe('eau');
  });

  it('returns matching category', () => {
    const result = filterByCategory(fixtures, 'enfant');
    expect(result).toHaveLength(1);
    expect(result[0].categorie).toBe('enfant');
  });
});

describe('filterByMinSize', () => {
  it('filters by size and excludes restaurant', () => {
    const result = filterByMinSize(fixtures, 100);
    expect(result).toHaveLength(1);
    expect(result[0].categorie).toBe('enfant');
  });

  it('supports string values', () => {
    const result = filterByMinSize(fixtures, '130');
    expect(result.map((item) => item.categorie)).toEqual(['famille', 'enfant']);
  });
});
