/**
 * Root App Component
 *
 * Tab-based UI with Main, History, and Settings panels
 * Includes AddKeywordModal for custom keyword addition
 */

import React, { useState } from 'react';
import { PromptProvider } from './contexts/PromptContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { CategoryColorProvider } from './contexts/CategoryColorContext';
import TabNavigation, { type TabType } from './components/TabNavigation';
import MainPanel from './components/MainPanel';
import HistoryPanel from './components/HistoryPanel';
import SettingsPanel from './components/SettingsPanel';
import AddKeywordModal from './components/AddKeywordModal';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleAddKeywordClick = (): void => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <CategoryColorProvider>
          <PromptProvider>
            <div className="app-container">
              <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onAddKeywordClick={handleAddKeywordClick}
              />

              <main className="app-main">
                {activeTab === 'main' && <MainPanel />}
                {activeTab === 'history' && <HistoryPanel />}
                {activeTab === 'settings' && <SettingsPanel />}
              </main>

              <AddKeywordModal isOpen={isModalOpen} onClose={handleCloseModal} />
            </div>
          </PromptProvider>
        </CategoryColorProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
};

export default App;
