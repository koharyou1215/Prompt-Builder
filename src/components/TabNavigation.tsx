/**
 * Tab Navigation Component
 *
 * Provides tab switching between Main, History, and Settings views
 * with keyword addition modal trigger
 */

import React from 'react';
import './TabNavigation.css';

export type TabType = 'main' | 'history' | 'settings';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddKeywordClick?: () => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  onAddKeywordClick
}) => {
  return (
    <nav className="tab-navigation">
      <button
        className={`tab-button ${activeTab === 'main' ? 'active' : ''}`}
        onClick={() => onTabChange('main')}
        type="button"
      >
        ビルダー
      </button>
      <button
        className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onTabChange('history')}
        type="button"
      >
        履歴
      </button>
      <button
        className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
        type="button"
      >
        設定
      </button>
      {onAddKeywordClick && (
        <button
          className="tab-button add-keyword-button"
          onClick={onAddKeywordClick}
          type="button"
          title="キーワードを追加"
        >
          ＋
        </button>
      )}
    </nav>
  );
};

export default TabNavigation;
