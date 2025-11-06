/**
 * HistoryPanel component
 * Displays and manages prompt history with Japanese translations
 *
 * Features:
 * - Save current prompt with translations
 * - View history list
 * - Apply history to current prompt
 * - Delete history entries
 */

import React, { useState, useCallback } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useTranslation, useNegativeTranslation } from '../hooks/useTranslation';
import type { HistoryEntry } from '../types';

const HistoryPanel: React.FC = () => {
  const {
    history,
    saveToHistory,
    loadFromHistory,
    deleteFromHistory,
    isLoading,
    error
  } = useHistory();

  const {
    translatedText: positiveJa
  } = useTranslation();

  const {
    translatedText: negativeJa
  } = useNegativeTranslation();

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState<boolean>(false);

  /**
   * Save current prompt to history
   */
  const handleSave = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    try {
      await saveToHistory(positiveJa, negativeJa, saveName || undefined);
      setSaveName('');
      setShowNameInput(false);
      alert('✓ 履歴に保存しました');
    } catch (err) {
      alert('⚠ 保存に失敗しました');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [saveToHistory, positiveJa, negativeJa, saveName]);

  /**
   * Apply history entry
   */
  const handleApply = useCallback((entry: HistoryEntry): void => {
    loadFromHistory(entry.id);
    alert('✓ 履歴を適用しました');
  }, [loadFromHistory]);

  /**
   * Delete history entry with confirmation
   */
  const handleDelete = useCallback(async (entry: HistoryEntry): Promise<void> => {
    const confirmed = window.confirm(
      `履歴を削除しますか？\n\n${entry.name || formatDate(entry.timestamp)}`
    );

    if (!confirmed) return;

    try {
      await deleteFromHistory(entry.id);
    } catch (err) {
      alert('⚠ 削除に失敗しました');
      console.error(err);
    }
  }, [deleteFromHistory]);

  /**
   * Format timestamp to readable date
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Truncate text for preview
   */
  const truncate = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        読み込み中...
      </div>
    );
  }

  return (
    <div className="history-panel" style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
          プロンプト履歴
        </h2>

        {/* Save Section */}
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <button
              onClick={() => setShowNameInput(!showNameInput)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              💾 現在のプロンプトを保存
            </button>
          </div>

          {showNameInput && (
            <div style={{ marginTop: '8px' }}>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="名前を入力（省略可）"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '13px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => {
                    setShowNameInput(false);
                    setSaveName('');
                  }}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '13px',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            padding: '8px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* History List */}
      <div>
        {history.length === 0 ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <p>まだ履歴がありません</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              「現在のプロンプトを保存」から保存できます
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: '12px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              >
                {/* Entry Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div>
                    {entry.name && (
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        {entry.name}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Prompt Preview */}
                <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                  <div style={{ color: '#374151', marginBottom: '4px' }}>
                    <strong>英語:</strong> {truncate(entry.positive)}
                  </div>
                  <div style={{ color: '#059669' }}>
                    <strong>日本語:</strong> {truncate(entry.positiveJa)}
                  </div>
                  {entry.negative && (
                    <div style={{ color: '#dc2626', marginTop: '4px' }}>
                      <strong>ネガティブ:</strong> {truncate(entry.negative)}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleApply(entry)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      fontSize: '12px',
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    📝 適用
                  </button>
                  <button
                    onClick={() => handleDelete(entry)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
