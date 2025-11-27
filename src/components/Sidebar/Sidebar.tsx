'use client';

import React, { useState } from 'react';
import TodoList from './TodoList';
import styles from './Sidebar.module.css';

type ViewMode = 'todo' | 'card';

export default function Sidebar() {
    const [viewMode, setViewMode] = useState<ViewMode>('todo');

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.toggleContainer}>
                    <button
                        className={`${styles.toggleButton} ${viewMode === 'todo' ? styles.active : ''}`}
                        onClick={() => setViewMode('todo')}
                    >
                        To-do
                    </button>
                    <button
                        className={`${styles.toggleButton} ${viewMode === 'card' ? styles.active : ''}`}
                        onClick={() => setViewMode('card')}
                    >
                        Card
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                {viewMode === 'todo' ? (
                    <TodoList />
                ) : (
                    <div className={styles.placeholder}>
                        Card View (Coming Soon)
                    </div>
                )}
            </div>
        </div>
    );
}
