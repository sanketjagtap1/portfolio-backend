import { generateSlug } from './slug';

describe('generateSlug', () => {
  it('lowercases and hyphenates a title', () => {
    expect(generateSlug('My First Post')).toBe('my-first-post');
  });

  it('strips punctuation and special characters', () => {
    expect(generateSlug('Hello, World! (2026)')).toBe('hello-world-2026');
  });

  it('collapses repeated spaces and hyphens', () => {
    expect(generateSlug('a   b---c')).toBe('a-b-c');
  });

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('  --Edge Case--  ')).toBe('edge-case');
  });

  it('handles titles that reduce to empty', () => {
    expect(generateSlug('!!!')).toBe('');
  });

  it('keeps existing numbers and single hyphens', () => {
    expect(generateSlug('Node 20 vs Node-22')).toBe('node-20-vs-node-22');
  });
});
