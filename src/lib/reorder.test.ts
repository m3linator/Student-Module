import { describe, expect, it } from 'vitest';
import { insertIndex, moveItem } from './reorder';

describe('moveItem', () => {
  it('moves an item to a new index', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
  });

  it('clamps the target and returns a copy', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 0, 9)).toEqual(['b', 'a']);
    expect(moveItem(items, 1, -3)).toEqual(['b', 'a']);
    expect(moveItem(items, 0, 0)).not.toBe(items);
  });
});

describe('insertIndex', () => {
  const midpoints = [20, 60, 100, 140];

  it('counts the other items above the pointer', () => {
    expect(insertIndex(midpoints, 0, 5)).toBe(0);
    expect(insertIndex(midpoints, 0, 70)).toBe(1);
    expect(insertIndex(midpoints, 0, 200)).toBe(3);
    expect(insertIndex(midpoints, 3, 10)).toBe(0);
    expect(insertIndex(midpoints, 2, 90)).toBe(2);
  });
});
