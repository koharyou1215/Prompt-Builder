/**
 * Settings Context
 *
 * Manages application settings:
 * - Auto-translation toggle
 * - Gemini model selection
 * - Persists to Chrome Storage or localStorage (fallback)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isChromeExtension } from '../services/storageService';

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
  organizeTagsByCategory: boolean; // Organize translated tags by category with line breaks
}

export interface SettingsContextValue {
  settings: SettingsState;
  setAutoTranslate: (enabled: boolean) => void;
  setSelectedModel: (model: ApprovedModel) => void;
  setTranslatorType: (type: TranslatorType) => void;
  setOrganizeTagsByCategory: (enabled: boolean) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEY = 'app-settings';

const DEFAULT_SETTINGS: SettingsState = {
  autoTranslate: true,
  selectedModel: 'gemini-2.5-pro',
  translatorType: 'gemini',
  organizeTagsByCategory: true // Enable tag organization by default
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from Chrome Storage or localStorage on mount
  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        let saved: SettingsState | undefined;

        if (isChromeExtension()) {
          const result = await chrome.storage.local.get(STORAGE_KEY);
          saved = result[STORAGE_KEY] as SettingsState | undefined;
        } else {
          const storedValue = localStorage.getItem(STORAGE_KEY);
          if (storedValue) {
            saved = JSON.parse(storedValue) as SettingsState;
          }
        }

        if (saved) {
          // Validate model ID
          const isValidModel = APPROVED_MODELS.includes(saved.selectedModel);
          const isValidTranslatorType = saved.translatorType === 'gemini' || saved.translatorType === 'google-translate';

          setSettings({
            autoTranslate: saved.autoTranslate ?? DEFAULT_SETTINGS.autoTranslate,
            selectedModel: isValidModel ? saved.selectedModel : DEFAULT_SETTINGS.selectedModel,
            translatorType: isValidTranslatorType ? saved.translatorType : DEFAULT_SETTINGS.translatorType,
            organizeTagsByCategory: saved.organizeTagsByCategory ?? DEFAULT_SETTINGS.organizeTagsByCategory
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
        if (isChromeExtension()) {
          await chrome.storage.local.set({ [STORAGE_KEY]: settings });
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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

  const setOrganizeTagsByCategory = useCallback((enabled: boolean): void => {
    setSettings(prev => ({ ...prev, organizeTagsByCategory: enabled }));
  }, []);

  const value: SettingsContextValue = {
    settings,
    setAutoTranslate,
    setSelectedModel,
    setTranslatorType,
    setOrganizeTagsByCategory,
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
