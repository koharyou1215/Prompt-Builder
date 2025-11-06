/**
 * Test for Prompt Syntax Protector
 *
 * Tests the masking and unmasking of special AI image generation prompt syntax
 */

import { describe, it, expect } from 'vitest';
import {
  maskPromptSyntax,
  unmaskPromptSyntax,
  hasPromptSyntax,
  extractPromptSyntax
} from '../src/utils/promptSyntaxProtector';

describe('Prompt Syntax Protector', () => {
  describe('maskPromptSyntax', () => {
    it('should mask single parentheses with weight', () => {
      const input = 'a beautiful girl, (blue eyes:1.2), long hair';
      const result = maskPromptSyntax(input);

      expect(result.maskedText).toContain('__PROMPTSYNTAX__0__');
      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0].original).toBe('(blue eyes:1.2)');
    });

    it('should mask nested parentheses', () => {
      const input = 'masterpiece, ((best quality)), high resolution';
      const result = maskPromptSyntax(input);

      expect(result.maskedText).toContain('__PROMPTSYNTAX__0__');
      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0].original).toBe('((best quality))');
    });

    it('should mask curly braces', () => {
      const input = 'a girl, {bad anatomy}, portrait';
      const result = maskPromptSyntax(input);

      expect(result.maskedText).toContain('__PROMPTSYNTAX__0__');
      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0].original).toBe('{bad anatomy}');
    });

    it('should mask square brackets', () => {
      const input = 'a girl, [slight emphasis], portrait';
      const result = maskPromptSyntax(input);

      expect(result.maskedText).toContain('__PROMPTSYNTAX__0__');
      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0].original).toBe('[slight emphasis]');
    });

    it('should mask multiple special syntax in one text', () => {
      const input = 'a girl, (blue eyes:1.2), ((masterpiece)), {bad quality}';
      const result = maskPromptSyntax(input);

      expect(result.mappings).toHaveLength(3);
      expect(result.mappings[0].original).toBe('(blue eyes:1.2)');
      expect(result.mappings[1].original).toBe('((masterpiece))');
      expect(result.mappings[2].original).toBe('{bad quality}');
    });

    it('should return empty mappings for text without special syntax', () => {
      const input = 'a beautiful girl, long hair, portrait';
      const result = maskPromptSyntax(input);

      expect(result.maskedText).toBe(input);
      expect(result.mappings).toHaveLength(0);
    });
  });

  describe('unmaskPromptSyntax', () => {
    it('should restore masked syntax correctly', () => {
      const input = 'a beautiful girl, (blue eyes:1.2), long hair';
      const masked = maskPromptSyntax(input);

      // Simulate translation (just uppercase for testing)
      const translated = masked.maskedText.toUpperCase();

      const restored = unmaskPromptSyntax(translated, masked.mappings);

      // Should contain the original syntax
      expect(restored).toContain('(blue eyes:1.2)');
    });

    it('should handle multiple placeholders correctly', () => {
      const input = 'girl, (eyes:1.2), ((quality)), {bad}';
      const masked = maskPromptSyntax(input);
      const restored = unmaskPromptSyntax(masked.maskedText, masked.mappings);

      expect(restored).toBe(input);
    });

    it('should not modify text without placeholders', () => {
      const input = 'normal text without special syntax';
      const result = unmaskPromptSyntax(input, []);

      expect(result).toBe(input);
    });
  });

  describe('hasPromptSyntax', () => {
    it('should return true for text with parentheses and weight', () => {
      expect(hasPromptSyntax('(keyword:1.2)')).toBe(true);
    });

    it('should return true for text with nested parentheses', () => {
      expect(hasPromptSyntax('((keyword))')).toBe(true);
    });

    it('should return true for text with curly braces', () => {
      expect(hasPromptSyntax('{keyword}')).toBe(true);
    });

    it('should return true for text with square brackets', () => {
      expect(hasPromptSyntax('[keyword]')).toBe(true);
    });

    it('should return false for normal text', () => {
      expect(hasPromptSyntax('normal text')).toBe(false);
    });
  });

  describe('extractPromptSyntax', () => {
    it('should extract all special syntax tokens', () => {
      const input = 'girl, (eyes:1.2), ((quality)), {bad}, normal';
      const result = extractPromptSyntax(input);

      expect(result).toHaveLength(3);
      expect(result).toContain('(eyes:1.2)');
      expect(result).toContain('((quality))');
      expect(result).toContain('{bad}');
    });

    it('should return empty array for text without special syntax', () => {
      const input = 'normal text';
      const result = extractPromptSyntax(input);

      expect(result).toHaveLength(0);
    });
  });

  describe('Round-trip test (mask → translate → unmask)', () => {
    it('should preserve special syntax through translation', () => {
      const input = '美しい少女, (青い目:1.2), ((傑作)), {低品質}, 長い髪';
      const masked = maskPromptSyntax(input);

      // Simulate translation
      const translated = masked.maskedText.replace('美しい少女', 'beautiful girl');

      const restored = unmaskPromptSyntax(translated, masked.mappings);

      // Should preserve all special syntax
      expect(restored).toContain('(青い目:1.2)');
      expect(restored).toContain('((傑作))');
      expect(restored).toContain('{低品質}');
    });
  });
});
