/**
 * Main Panel Component
 *
 * Main editing view with prompt editors, translation areas, and keyword selector
 * Uses dedicated components for better separation of concerns
 */

import React from 'react';
import PromptEditor from './PromptEditor';
import TranslationArea from './TranslationArea';
import KeywordSelector from './KeywordSelector';
import styles from './MainPanel.module.css';

const MainPanel: React.FC = () => {
  return (
    <div className={styles.mainPanel}>
      {/* Prompt Editor Section with Copy Buttons */}
      <section className={styles.editorSection}>
        <PromptEditor />
      </section>

      {/* Translation Area Section with Copy Buttons */}
      <section className={`${styles.editorSection} ${styles.editorSectionWithMargin}`}>
        <TranslationArea />
      </section>

      {/* Keyword Selector Section with Custom Keywords */}
      <section className={`${styles.keywordSection} ${styles.keywordSectionWithMargin}`}>
        <KeywordSelector />
      </section>
    </div>
  );
};

export default MainPanel;
