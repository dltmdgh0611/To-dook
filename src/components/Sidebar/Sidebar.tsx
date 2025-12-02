'use client';

import React, { useState } from 'react';
import TodoList from './TodoList';
import styles from './Sidebar.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type ViewMode = 'todo' | 'card';

export default function Sidebar() {
    const { language } = useLanguage();
    const [viewMode, setViewMode] = useState<ViewMode>('todo');

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.toggleContainer}>
                    <button
                        className={`${styles.toggleButton} ${viewMode === 'todo' ? styles.active : ''}`}
                        onClick={() => setViewMode('todo')}
                    >
                        {getTranslation(language, 'todo')}
                    </button>
                    <button
                        className={`${styles.toggleButton} ${viewMode === 'card' ? styles.active : ''}`}
                        onClick={() => setViewMode('card')}
                    >
                        {getTranslation(language, 'card')}
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                {viewMode === 'todo' ? (
                    <TodoList />
                ) : (
                    <div className={styles.placeholder}>
                        {getTranslation(language, 'cardViewComingSoon')}
                    </div>
                )}
            </div>
        </div>
    );
}
