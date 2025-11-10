/**
 * Prompt Syntax Protector
 *
 * Protects special AI image generation prompt syntax during translation.
 * Handles patterns like:
 * - (keyword:1.2) - explicit weight
 * - ((keyword)) - nested parentheses
 * - {keyword} - curly braces
 * - [keyword] - square brackets
 *
 * Strategy: Replace special syntax with placeholders before translation,
 * then restore them after translation.
 */

/**
 * Placeholder prefix to ensure uniqueness
 */
const PLACEHOLDER_PREFIX = '__PROMPTSYNTAX__';

/**
 * Pattern to match special prompt syntax
 * Matches:
 * - Parentheses with optional weight: (keyword) or (keyword:1.2)
 * - Nested parentheses: ((keyword))
 * - Curly braces: {keyword}
 * - Square brackets: [keyword]
 */
const SPECIAL_SYNTAX_PATTERN = /(\(+[^()]+?\)+(?::[0-9]+\.?[0-9]*)?|\{+[^{}]+?\}+|\[+[^\[\]]+?\]+)/g;

/**
 * Mapping between placeholders and original syntax
 */
interface SyntaxMapping {
  readonly placeholder: string;
  readonly original: string;
}

/**
 * Result of masking operation
 */
interface MaskResult {
  readonly maskedText: string;
  readonly mappings: ReadonlyArray<SyntaxMapping>;
}

/**
 * Mask special prompt syntax with placeholders
 *
 * @param text - Text containing special prompt syntax
 * @returns Masked text and mapping information
 *
 * @example
 * ```typescript
 * const result = maskPromptSyntax('a beautiful girl, (blue eyes:1.2), ((masterpiece))');
 * // result.maskedText: 'a beautiful girl, __PROMPTSYNTAX__0__, __PROMPTSYNTAX__1__'
 * // result.mappings: [
 * //   { placeholder: '__PROMPTSYNTAX__0__', original: '(blue eyes:1.2)' },
 * //   { placeholder: '__PROMPTSYNTAX__1__', original: '((masterpiece))' }
 * // ]
 * ```
 */
export function maskPromptSyntax(text: string): MaskResult {
  // Protection disabled: Allow full translation of text including content inside brackets
  // The translation prompt instructs the AI to preserve brackets and symbols
  return { maskedText: text, mappings: [] };
}
// (Removed invalid duplicate return and closing brace. This code is now fixed and does not contain stray statements.)

 /**
 * Restore original prompt syntax from masked text
 *
 * @param maskedText - Text with placeholders
 * @param mappings - Mapping information from maskPromptSyntax
 * @returns Text with original syntax restored
 *
 * @example
 * ```typescript
 * const masked = maskPromptSyntax('a girl, (blue eyes:1.2)');
 * const translated = await translate(masked.maskedText);
 * const restored = unmaskPromptSyntax(translated, masked.mappings);
 * ```
 */
export function unmaskPromptSyntax(
  maskedText: string,
  mappings: ReadonlyArray<SyntaxMapping>
): string {
  let result = maskedText;

  // Replace placeholders with original syntax
  // Process in reverse order to avoid conflicts with numbered placeholders
  for (let i = mappings.length - 1; i >= 0; i--) {
    const mapping = mappings[i];
    if (mapping) {
      result = result.replace(mapping.placeholder, mapping.original);
    }
  }

  return result;
}

/**
 * Check if text contains special prompt syntax
 *
 * @param text - Text to check
 * @returns true if text contains special syntax
 *
 * @example
 * ```typescript
 * hasPromptSyntax('normal text'); // false
 * hasPromptSyntax('(keyword:1.2)'); // true
 * hasPromptSyntax('{keyword}'); // true
 * ```
 */
export function hasPromptSyntax(text: string): boolean {
  return SPECIAL_SYNTAX_PATTERN.test(text);
}

/**
 * Extract all special syntax tokens from text
 *
 * @param text - Text to extract from
 * @returns Array of special syntax tokens
 *
 * @example
 * ```typescript
 * extractPromptSyntax('a girl, (blue eyes:1.2), ((masterpiece))');
 * // Returns: ['(blue eyes:1.2)', '((masterpiece))']
 * ```
 */
export function extractPromptSyntax(text: string): ReadonlyArray<string> {
  const matches = text.match(SPECIAL_SYNTAX_PATTERN);
  return matches ? [...matches] : [];
}
