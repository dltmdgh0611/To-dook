'use client';

import React, { useState } from 'react';
import styles from './TodoList.module.css';

interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
}

export default function TodoList() {
    const [todos, setTodos] = useState<TodoItem[]>([
        { id: 1, text: 'Research design trends', completed: true },
        { id: 2, text: 'Draft project proposal', completed: true },
        { id: 3, text: 'Review PRs', completed: false },
        { id: 4, text: 'Update documentation', completed: false },
    ]);

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>To-do</h2>
            <div className={styles.list}>
                {todos.map(todo => (
                    <div key={todo.id} className={styles.item} onClick={() => toggleTodo(todo.id)}>
                        <div className={`${styles.checkbox} ${todo.completed ? styles.checked : ''}`}>
                            {todo.completed && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        <span className={`${styles.text} ${todo.completed ? styles.completedText : ''}`}>
                            {todo.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
