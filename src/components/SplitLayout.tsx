import React from 'react';
import styles from './SplitLayout.module.css';

interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export default function SplitLayout({ leftPanel, rightPanel }: SplitLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        {leftPanel}
      </div>
      <div className={styles.divider} />
      <div className={styles.rightPanel}>
        {rightPanel}
      </div>
    </div>
  );
}
