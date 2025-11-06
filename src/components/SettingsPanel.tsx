/**
 * Settings Panel Component
 *
 * Settings for auto-translation toggle, model selection, and templates
 */

import React from 'react';
import { useSettings, APPROVED_MODELS, type ApprovedModel, type TranslatorType } from '../contexts/SettingsContext';
import { usePromptContext } from '../contexts/PromptContext';
import { qualityTemplates, negativeTemplates } from '../data/templates';
import { useNegativeTranslation } from '../hooks/useTranslation';
import { CategoryColorSettings } from './CategoryColorSettings';
import './SettingsPanel.css';

const SettingsPanel: React.FC = () => {
  const { settings, setAutoTranslate, setSelectedModel, setTranslatorType } = useSettings();
  const { setPositivePrompt, setNegativePrompt } = usePromptContext();
  const { translatedText: negTranslated, handleJapaneseChange, manualTranslate, isTranslating } = useNegativeTranslation();

  const handleQualityTemplateSelect = (prompt: string): void => {
    setPositivePrompt(prompt);
  };

  const handleNegativeTemplateSelect = (prompt: string): void => {
    setNegativePrompt(prompt);
  };

  return (
    <div className="settings-panel">
      <h2>設定</h2>

      {/* Auto-translation toggle */}
      <section className="settings-section">
        <h3>自動翻訳</h3>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={settings.autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
          />
          <span>自動翻訳を有効にする</span>
        </label>
        <p className="help-text">
          オフにすると、手動ボタンで翻訳を実行します
        </p>
      </section>

      {/* Translator selection */}
      <section className="settings-section">
        <h3>翻訳サービス</h3>
        <select
          value={settings.translatorType}
          onChange={(e) => setTranslatorType(e.target.value as TranslatorType)}
          className="model-select"
        >
          <option value="google-translate">Google翻訳（無料・高速）</option>
          <option value="gemini">Gemini API（高品質）</option>
        </select>
        <p className="help-text">
          使用する翻訳サービスを選択します
        </p>
      </section>

      {/* Model selection (only for Gemini) */}
      {settings.translatorType === 'gemini' && (
        <section className="settings-section">
          <h3>Gemini モデル選択</h3>
          <select
            value={settings.selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ApprovedModel)}
            className="model-select"
          >
            {APPROVED_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <p className="help-text">
            翻訳に使用するGeminiモデルを選択します
          </p>
        </section>
      )}

      {/* Quality templates */}
      <section className="settings-section">
        <h3>品質テンプレート</h3>
        <div className="template-buttons">
          {qualityTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleQualityTemplateSelect(template.prompt)}
              className="template-button"
              type="button"
            >
              {template.name}
            </button>
          ))}
        </div>
        <p className="help-text">
          クリックでポジティブプロンプトに適用されます
        </p>
      </section>

      {/* Negative prompt section */}
      <section className="settings-section">
        <h3>ネガティブプロンプト</h3>

        {/* Template selection */}
        <div className="subsection">
          <h4>テンプレート選択</h4>
          <div className="template-buttons">
            {negativeTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleNegativeTemplateSelect(template.prompt)}
                className="template-button"
                type="button"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        {/* Manual translation area */}
        <div className="subsection">
          <h4>日本語翻訳</h4>
          <textarea
            value={negTranslated}
            onChange={(e) => handleJapaneseChange(e.target.value)}
            placeholder="ネガティブプロンプトの日本語訳..."
            className="translation-textarea"
            rows={4}
          />
          {!settings.autoTranslate && (
            <button
              onClick={() => manualTranslate()}
              disabled={isTranslating}
              className="manual-translate-button"
              type="button"
            >
              {isTranslating ? '翻訳中...' : '翻訳実行'}
            </button>
          )}
        </div>
      </section>

      {/* Category Color Settings */}
      <section className="settings-section">
        <CategoryColorSettings />
      </section>
    </div>
  );
};

export default SettingsPanel;
