/**
 * Example usage of Prompt Syntax Protector
 *
 * This file demonstrates how the masking/unmasking works
 * Run this in browser console or Node.js to see the output
 */

import {
  maskPromptSyntax,
  unmaskPromptSyntax,
  hasPromptSyntax,
  extractPromptSyntax
} from '../src/utils/promptSyntaxProtector';

console.log('=== Prompt Syntax Protector Examples ===\n');

// Example 1: Basic masking
const example1 = 'a beautiful girl, (blue eyes:1.2), long hair';
console.log('Example 1: Basic masking');
console.log('Input:', example1);
const masked1 = maskPromptSyntax(example1);
console.log('Masked:', masked1.maskedText);
console.log('Mappings:', masked1.mappings);
console.log('Restored:', unmaskPromptSyntax(masked1.maskedText, masked1.mappings));
console.log('');

// Example 2: Multiple syntax types
const example2 = 'masterpiece, (detailed:1.3), ((best quality)), {bad anatomy}, [slight emphasis]';
console.log('Example 2: Multiple syntax types');
console.log('Input:', example2);
const masked2 = maskPromptSyntax(example2);
console.log('Masked:', masked2.maskedText);
console.log('Mappings:', masked2.mappings);
console.log('');

// Example 3: Check if text has special syntax
const example3a = 'normal text without syntax';
const example3b = 'text with (syntax:1.2)';
console.log('Example 3: Checking for special syntax');
console.log(`"${example3a}" has syntax:`, hasPromptSyntax(example3a)); // false
console.log(`"${example3b}" has syntax:`, hasPromptSyntax(example3b)); // true
console.log('');

// Example 4: Extract all special syntax
const example4 = 'girl, (eyes:1.2), ((quality)), {bad}, normal text';
console.log('Example 4: Extract special syntax');
console.log('Input:', example4);
console.log('Extracted:', extractPromptSyntax(example4));
console.log('');

// Example 5: Simulating translation workflow
const example5 = '美しい少女, (青い目:1.2), ((傑作)), 長い髪';
console.log('Example 5: Translation workflow simulation');
console.log('Original:', example5);

// Step 1: Mask
const masked5 = maskPromptSyntax(example5);
console.log('Masked:', masked5.maskedText);

// Step 2: Simulate translation (just replacing Japanese with English)
const translated5 = masked5.maskedText
  .replace('美しい少女', 'beautiful girl')
  .replace('長い髪', 'long hair');
console.log('Translated:', translated5);

// Step 3: Unmask
const restored5 = unmaskPromptSyntax(translated5, masked5.mappings);
console.log('Restored:', restored5);
console.log('Expected: beautiful girl, (青い目:1.2), ((傑作)), long hair');
console.log('Match:', restored5 === 'beautiful girl, (青い目:1.2), ((傑作)), long hair');
console.log('');

console.log('=== All examples completed ===');
