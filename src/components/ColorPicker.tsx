/**
 * ColorPicker Component
 *
 * Provides color selection UI with preset palette and custom color picker.
 * iOS Safari compatible with touch-friendly interface.
 */

import React from 'react';
import { DEFAULT_CATEGORY_COLORS } from '../constants';
import styles from './ColorPicker.module.css';

/**
 * ColorPicker Props
 */
interface ColorPickerProps {
  readonly value: string;
  readonly onChange: (color: string) => void;
  readonly presetColors?: ReadonlyArray<string>;
}

/**
 * ColorPicker Component
 * Displays preset color palette and custom color input
 * Memoized to prevent unnecessary re-renders
 */
export const ColorPicker: React.FC<ColorPickerProps> = React.memo(({
  value,
  onChange,
  presetColors = DEFAULT_CATEGORY_COLORS,
}) => {
  const handlePresetClick = (color: string): void => {
    onChange(color);
  };

  const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <div className={styles.container}>
      {/* Preset color palette */}
      <div className={styles.presetPalette}>
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            className={`${styles.colorButton} ${value === color ? styles.selected : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handlePresetClick(color)}
            aria-label={`カラー ${color}`}
            title={color}
          >
            {value === color && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Custom color input */}
      <div className={styles.customColorSection}>
        <label htmlFor="custom-color-input" className={styles.customLabel}>
          カスタムカラー:
        </label>
        <input
          id="custom-color-input"
          type="color"
          value={value}
          onChange={handleCustomColorChange}
          className={styles.customColorInput}
          aria-label="カスタムカラー選択"
        />
        <span className={styles.colorValue}>{value}</span>
      </div>
    </div>
  );
});

// Set display name for React DevTools
ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
