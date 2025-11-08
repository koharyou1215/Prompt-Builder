import { useState, useCallback } from 'react';

export interface CopyFeedback {
  readonly type: 'positive' | 'negative' | null;
  readonly message: string;
}

/**
 * クリップボードへのコピー機能とフィードバック表示を提供するカスタムフック
 * @returns copyToClipboard - クリップボードにコピーする関数
 * @returns copyFeedback - コピー操作のフィードバック状態
 */
export const useCopyToClipboard = () => {
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>({
    type: null,
    message: ''
  });

  const copyToClipboard = useCallback(async (
    text: string,
    type: 'positive' | 'negative'
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback({
        type,
        message: '✓ コピーしました'
      });

      // 2秒後にフィードバックをクリア
      setTimeout(() => {
        setCopyFeedback({ type: null, message: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setCopyFeedback({
        type,
        message: '⚠ コピーに失敗しました'
      });

      // 2秒後にフィードバックをクリア
      setTimeout(() => {
        setCopyFeedback({ type: null, message: '' });
      }, 2000);
    }
  }, []);

  return {
    copyToClipboard,
    copyFeedback
  };
};
