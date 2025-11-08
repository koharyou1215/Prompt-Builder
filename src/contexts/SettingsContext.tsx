/**
 * Settings Context
 *
 * Manages application settings:
 * - Auto-translation toggle
 * - Gemini model selection
 * - Persists to Chrome Storage or localStorage (fallback)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '../services/storageService';
import { StorageKeys } from '../types';

// Approved Gemini models (from RULES.md)
export const APPROVED_MODELS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash-preview-09-2025',
  'gemini-2.5-flash-lite-preview-09-2025'
] as const;

export type ApprovedModel = typeof APPROVED_MODELS[number];

// Translator type (Gemini or Google Translate)
export type TranslatorType = 'gemini' | 'google-translate';

export interface SettingsState {
  autoTranslate: boolean;
  selectedModel: ApprovedModel;
  translatorType: TranslatorType;
}

export interface SettingsContextValue {
  settings: SettingsState;
  setAutoTranslate: (enabled: boolean) => void;
  setSelectedModel: (model: ApprovedModel) => void;
  setTranslatorType: (type: TranslatorType) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const DEFAULT_SETTINGS: SettingsState = {
  autoTranslate: true,
  selectedModel: 'gemini-2.5-pro',
  translatorType: 'gemini'
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from Chrome Storage or localStorage on mount
  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        const response = await loadFromStorage<SettingsState>(StorageKeys.SETTINGS);

        if (response.success && response.data) {
          const saved = response.data;

          // Validate model ID
          const isValidModel = APPROVED_MODELS.includes(saved.selectedModel);
          const isValidTranslatorType = saved.translatorType === 'gemini' || saved.translatorType === 'google-translate';

          setSettings({
            autoTranslate: saved.autoTranslate ?? DEFAULT_SETTINGS.autoTranslate,
            selectedModel: isValidModel ? saved.selectedModel : DEFAULT_SETTINGS.selectedModel,
            translatorType: isValidTranslatorType ? saved.translatorType : DEFAULT_SETTINGS.translatorType
          });
        }
      } catch (error: unknown) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, []);

  // Save settings to Chrome Storage or localStorage whenever they change
  useEffect(() => {
    if (isLoading) return;

    const saveSettings = async (): Promise<void> => {
      try {
        const response = await saveToStorage(StorageKeys.SETTINGS, settings);
        if (!response.success) {
          console.error('Failed to save settings:', response.error);
        }
      } catch (error: unknown) {
        console.error('Failed to save settings:', error);
      }
    };

    void saveSettings();
  }, [settings, isLoading]);

  const setAutoTranslate = useCallback((enabled: boolean): void => {
    setSettings(prev => ({ ...prev, autoTranslate: enabled }));
  }, []);

  const setSelectedModel = useCallback((model: ApprovedModel): void => {
    // Validate model
    if (!APPROVED_MODELS.includes(model)) {
      console.error(`Invalid model ID: ${model}`);
      return;
    }

    setSettings(prev => ({ ...prev, selectedModel: model }));
  }, []);

  const setTranslatorType = useCallback((type: TranslatorType): void => {
    // Validate translator type
    if (type !== 'gemini' && type !== 'google-translate') {
      console.error(`Invalid translator type: ${type}`);
      return;
    }

    setSettings(prev => ({ ...prev, translatorType: type }));
  }, []);

  const value: SettingsContextValue = {
    settings,
    setAutoTranslate,
    setSelectedModel,
    setTranslatorType,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
