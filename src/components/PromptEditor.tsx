/**
 * PromptEditor component
 * Provides text areas for editing positive and negative prompts in English
 * with copy functionality and colored preview
 */

import React, { useState, useCallback } from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { ColoredPromptPreview } from './ColoredPromptPreview';

/**
 * Copy feedback state type
 */
interface CopyFeedback {
  readonly type: 'positive' | null;
  readonly message: string;
}

const PromptEditor: React.FC = () => {
  const { promptState, setPositivePrompt, resetPrompt } = usePromptContext();
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>({
    type: null,
    message: ''
  });

  const handlePositiveChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setPositivePrompt(event.target.value);
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = useCallback(async (
    text: string,
    type: 'positive'
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);

      setCopyFeedback({
        type,
        message: '✓ コピーしました'
      });

      setTimeout(() => {
        setCopyFeedback({ type: null, message: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);

      setCopyFeedback({
        type,
        message: '⚠ コピーに失敗しました'
      });

      setTimeout(() => {
        setCopyFeedback({ type: null, message: '' });
      }, 2000);
    }
  }, []);

  /**
   * Copy positive prompt
   */
  const handleCopyPositive = useCallback((): void => {
    void copyToClipboard(promptState.positive, 'positive');
  }, [promptState.positive, copyToClipboard]);

  /**
   * Clear all prompts
   */
  const handleClear = useCallback((): void => {
    if (window.confirm('すべてのプロンプトをクリアしますか？')) {
      resetPrompt();
    }
  }, [resetPrompt]);

  return (
    <div className="prompt-editor">
      <div className="prompt-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label htmlFor="positive-prompt">
            <strong>Positive Prompt (English)</strong>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {copyFeedback.type === 'positive' && (
              <span style={{ fontSize: '12px', color: '#059669' }}>
                {copyFeedback.message}
              </span>
            )}
            <button
              onClick={handleClear}
              disabled={!promptState.positive.trim() && !promptState.negative.trim()}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: (promptState.positive.trim() || promptState.negative.trim()) ? '#ef4444' : '#d1d5db',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: (promptState.positive.trim() || promptState.negative.trim()) ? 'pointer' : 'not-allowed',
              }}
              title="すべてのプロンプトをクリア"
            >
              🗑️ クリア
            </button>
            <button
              onClick={handleCopyPositive}
              disabled={!promptState.positive.trim()}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: promptState.positive.trim() ? '#3b82f6' : '#d1d5db',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: promptState.positive.trim() ? 'pointer' : 'not-allowed',
              }}
              title="英語プロンプトをコピー"
            >
              📋 コピー
            </button>
          </div>
        </div>
        <textarea
          id="positive-prompt"
          value={promptState.positive}
          onChange={handlePositiveChange}
          placeholder="Enter positive prompt keywords (e.g., masterpiece, 1girl, smile)"
          rows={20}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            fontFamily: 'monospace',
            resize: 'vertical',
          }}
        />

        {/* Colored Preview */}
        <ColoredPromptPreview promptText={promptState.positive} />
      </div>
    </div>
  );
};

export default PromptEditor;
