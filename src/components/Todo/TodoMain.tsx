'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CardMain from '@/components/Card/CardMain';
import AgentFeedback, { AgentStep } from '@/components/Todo/AgentFeedback';
import TodoSkeleton from '@/components/Todo/TodoSkeleton';
import DatePicker from '@/components/Todo/DatePicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import { track } from '@/amplitude';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TodoMainProps {
    onToggleChat: () => void;
    isChatOpen: boolean;
    currentView: 'todo' | 'card';
    onViewChange: (view: 'todo' | 'card') => void;
    generateTrigger?: number;
    addTodoTrigger?: number;
    displayName?: string;
    onOpenSettings?: (tab?: 'integrations' | 'permissions' | 'account') => void;
    isMobile?: boolean;
}

type SourceInfo = {
    type: 'slack' | 'notion' | 'email';
    id: string;
    link: string;
    title?: string;
};

type TodoItem = {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
    priority?: 'high' | 'medium' | 'low';
    emoji?: string;
    tag?: string;
    tagColor?: string;
    sources?: SourceInfo[];
    order?: number;
};

// SortableTodoItem 컴포넌트의 Props
interface SortableTodoItemProps {
    todo: TodoItem;
    isCompleted: boolean;
    isEditing: boolean;
    editingTitle: string;
    editingDueDate: string;
    showDatePicker: boolean;
    datePickerPosition?: { top: number; left: number };
    onToggleComplete: (id: string) => void;
    onStartEdit: (todo: TodoItem) => void;
    onDelete: (id: string) => void;
    onTitleChange: (value: string) => void;
    onDueDateChange: (value: string) => void;
    onSave: (id: string) => void;
    onCancel: () => void;
    onOpenDatePicker: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onCloseDatePicker: () => void;
    titleInputRef: React.RefObject<HTMLInputElement | null>;
    getSourceIcon: (type: string) => React.ReactNode;
}

// Sortable Todo Item 컴포넌트
function SortableTodoItem({
    todo,
    isCompleted,
    isEditing,
    editingTitle,
    editingDueDate,
    showDatePicker,
    datePickerPosition,
    onToggleComplete,
    onStartEdit,
    onDelete,
    onTitleChange,
    onDueDateChange,
    onSave,
    onCancel,
    onOpenDatePicker,
    onCloseDatePicker,
    titleInputRef,
    getSourceIcon,
}: SortableTodoItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-start gap-3 border-b border-gray-200 bg-white py-3 transition-all hover:bg-gray-50 ${isCompleted ? 'opacity-60' : ''} ${isDragging ? 'shadow-lg rounded-lg' : ''}`}
        >
            {/* 드래그 핸들 */}
            <button
                {...attributes}
                {...listeners}
                className="mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="드래그하여 순서 변경"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
            </button>

            <button
                onClick={() => !isEditing && onToggleComplete(todo.id)}
                className="mt-0.5 flex-shrink-0"
                disabled={isEditing}
            >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                        : 'border-gray-300 hover:border-[var(--color-primary)]'
                }`}>
                    {todo.completed && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    )}
                </div>
            </button>
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <div className="space-y-2">
                        <input
                            ref={titleInputRef}
                            type="text"
                            value={editingTitle}
                            onChange={(e) => onTitleChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onSave(todo.id);
                                } else if (e.key === 'Escape') {
                                    onCancel();
                                }
                            }}
                            className="w-full px-2 py-1 text-[15px] font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            placeholder="할 일을 입력하세요"
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onOpenDatePicker}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                {editingDueDate || '날짜 선택'}
                            </button>
                            <button
                                type="button"
                                onClick={() => onSave(todo.id)}
                                className="px-3 py-1 text-xs text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)] transition-colors"
                            >
                                저장
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-3 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                취소
                            </button>
                        </div>
                        {showDatePicker && (
                            <DatePicker
                                value={editingDueDate}
                                onChange={(date) => {
                                    onDueDateChange(date);
                                    onCloseDatePicker();
                                }}
                                onClose={onCloseDatePicker}
                                position={datePickerPosition}
                            />
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className={`text-[15px] font-medium transition-all ${
                                    todo.completed
                                        ? 'text-gray-400 line-through'
                                        : 'text-gray-900'
                                }`}>
                                    {todo.emoji && <span className="mr-1.5">{todo.emoji}</span>}
                                    {todo.title || '(제목 없음)'}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {todo.sources && todo.sources.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        {todo.sources.slice(0, 3).map((source, idx) => (
                                            <a
                                                key={idx}
                                                href={source.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-xs text-gray-600"
                                                onClick={(e) => e.stopPropagation()}
                                                title={source.title || `${source.type}에서 열기`}
                                            >
                                                {getSourceIcon(source.type)}
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                                </svg>
                                            </a>
                                        ))}
                                        {todo.sources.length > 3 && (
                                            <span className="text-xs text-gray-400">+{todo.sources.length - 3}</span>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onStartEdit(todo)}
                                        className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                        title="수정"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(todo.id)}
                                        className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                        title="삭제"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {todo.dueDate && (
                            <div className="flex items-center gap-3 mt-2 text-xs">
                                <span className={`flex items-center gap-1 ${todo.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {todo.dueDate}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function TodoMain({ 
    onToggleChat, 
    isChatOpen, 
    currentView, 
    onViewChange,
    generateTrigger = 0,
    addTodoTrigger = 0,
    displayName,
    onOpenSettings,
    isMobile = false
}: TodoMainProps) {
    const { language } = useLanguage();
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [agentStep, setAgentStep] = useState<AgentStep>('idle');
    const [agentMessage, setAgentMessage] = useState('');
    const [skeletonCount, setSkeletonCount] = useState(0);
    const lastTrigger = useRef(0);
    const lastAddTrigger = useRef(0);
    
    // 연동 상태
    const [hasAnyIntegration, setHasAnyIntegration] = useState<boolean | null>(null);
    
    // DnD 센서 설정 (터치 및 마우스 지원)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px 이상 움직여야 드래그 시작
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    // 인라인 편집 상태
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingDueDate, setEditingDueDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerPosition, setDatePickerPosition] = useState<{ top: number; left: number } | undefined>();
    const dateInputRef = useRef<HTMLInputElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const isClickingDatePicker = useRef(false);

    // 투두 목록 불러오기
    const fetchTodos = useCallback(async () => {
        try {
            const res = await fetch('/api/todos');
            if (res.ok) {
                const data = await res.json();
                setTodos(data.todos || []);
            }
        } catch (error) {
            console.error('Failed to fetch todos:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    // 연동 상태 확인
    useEffect(() => {
        const checkIntegrations = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    const hasIntegration = data.gmailConnected || data.slackConnected || data.notionConnected || !!data.notionApiKey;
                    setHasAnyIntegration(hasIntegration);
                }
            } catch (error) {
                console.error('Failed to check integrations:', error);
            }
        };
        checkIntegrations();
    }, []);

    // 드래그 종료 핸들러 - 낙관적 업데이트 + 백그라운드 저장
    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (!over || active.id === over.id) {
            return;
        }

        // 낙관적 업데이트 - UI 즉시 반영
        setTodos((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            
            if (oldIndex === -1 || newIndex === -1) return items;
            
            const newItems = arrayMove(items, oldIndex, newIndex);
            
            // 순서 업데이트된 아이템들의 order 값 재계산
            return newItems.map((item, index) => ({
                ...item,
                order: index,
            }));
        });

        // 백그라운드에서 서버에 저장 (렉 방지를 위해 비동기로 처리)
        try {
            const currentTodos = todos;
            const oldIndex = currentTodos.findIndex((item) => item.id === active.id);
            const newIndex = currentTodos.findIndex((item) => item.id === over.id);
            
            if (oldIndex === -1 || newIndex === -1) return;
            
            const reorderedTodos = arrayMove(currentTodos, oldIndex, newIndex);
            const updates = reorderedTodos.map((item, index) => ({
                id: item.id,
                order: index,
            }));

            await fetch('/api/todos/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            });
        } catch (error) {
            console.error('Failed to save order:', error);
            // 실패해도 UI는 유지 (다음 새로고침 시 서버 데이터로 복구됨)
        }
    }, [todos]);

    // 투두 완료 토글
    const toggleComplete = async (todoId: string) => {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;

        // 낙관적 업데이트
        setTodos(prev => prev.map(t => 
            t.id === todoId ? { ...t, completed: !t.completed } : t
        ));

        try {
            await fetch('/api/todos', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: todoId, completed: !todo.completed }),
            });
        } catch (error) {
            // 롤백
            setTodos(prev => prev.map(t => 
                t.id === todoId ? { ...t, completed: todo.completed } : t
            ));
        }
    };

    // 투두 삭제
    const deleteTodo = async (todoId: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        // 낙관적 업데이트
        setTodos(prev => prev.filter(t => t.id !== todoId));

        try {
            await fetch(`/api/todos?id=${todoId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to delete todo:', error);
            // 롤백
            await fetchTodos();
        }
    };

    // 투두 수정 시작
    const startEdit = (todo: TodoItem) => {
        setEditingTodoId(todo.id);
        setEditingTitle(todo.title);
        setEditingDueDate(todo.dueDate || '');
        setTimeout(() => {
            titleInputRef.current?.focus();
        }, 0);
    };

    // 투두 추가 - 빈 투두 생성 후 편집 모드
    const addNewTodo = async () => {
        // Amplitude 이벤트 트래킹
        track('Add Todo Button Clicked');
        
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: '',
                    dueDate: null,
                }),
            });

            if (res.ok) {
                const { todo } = await res.json();
                setTodos(prev => [todo, ...prev]);
                // 바로 편집 모드로
                setEditingTodoId(todo.id);
                setEditingTitle('');
                setEditingDueDate('');
                setTimeout(() => {
                    titleInputRef.current?.focus();
                }, 0);
            }
        } catch (error) {
            console.error('Failed to create todo:', error);
        }
    };

    // 투두 저장 (인라인 편집)
    const saveTodo = async (todoId: string) => {
        if (!editingTitle.trim()) {
            // 제목이 없으면 삭제
            await deleteTodo(todoId);
            return;
        }

        try {
            const res = await fetch('/api/todos', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: todoId,
                    title: editingTitle.trim(),
                    dueDate: editingDueDate.trim() || null,
                }),
            });

            if (res.ok) {
                const { todo } = await res.json();
                setTodos(prev => prev.map(t => t.id === todo.id ? todo : t));
                setEditingTodoId(null);
            }
        } catch (error) {
            console.error('Failed to save todo:', error);
        }
    };

    // 편집 취소
    const cancelEdit = () => {
        const todo = todos.find(t => t.id === editingTodoId);
        if (todo) {
            setEditingTitle(todo.title);
            setEditingDueDate(todo.dueDate || '');
        }
        setEditingTodoId(null);
        setShowDatePicker(false);
    };

    // 날짜 입력 클릭/포커스
    const openDatePicker = (event: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        isClickingDatePicker.current = true;
        const rect = event.currentTarget.getBoundingClientRect();
        // 화면 경계 체크
        const pickerWidth = 280;
        const pickerHeight = 350;
        let top = rect.bottom + 8;
        let left = rect.left;
        
        // 오른쪽 경계 체크
        if (left + pickerWidth > window.innerWidth) {
            left = window.innerWidth - pickerWidth - 16;
        }
        // 아래 경계 체크
        if (top + pickerHeight > window.innerHeight) {
            top = rect.top - pickerHeight - 8;
        }
        
        setDatePickerPosition({ top, left });
        setShowDatePicker(true);
    };
    
    // DatePicker 닫힐 때
    const closeDatePicker = () => {
        setShowDatePicker(false);
        isClickingDatePicker.current = false;
    };

    // AI 투두 생성
    const generateTodos = useCallback(async () => {
        console.log('generateTodos called');
        setAgentStep('slack');
        setAgentMessage('데이터 수집을 시작합니다...');
        setSkeletonCount(3);

        try {
            const res = await fetch('/api/todos/generate', { method: 'POST' });
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                console.log('No reader available');
                return;
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            console.log('SSE data:', data);
                            
                            if (data.type === 'status') {
                                setAgentStep(data.step as AgentStep);
                                setAgentMessage(data.message);
                                
                                if (data.step === 'ai') {
                                    setSkeletonCount(4);
                                } else if (data.step === 'saving') {
                                    setSkeletonCount(0);
                                }
                            } else if (data.type === 'todo') {
                                // 새 투두가 생성될 때마다 추가
                                setTodos(prev => [data.todo, ...prev]);
                            } else if (data.type === 'done') {
                                setAgentStep('complete');
                                setAgentMessage(`${data.todos?.length || 0}개의 할 일이 생성되었습니다.`);
                                setSkeletonCount(0);
                                
                                // 완료 후 투두 목록 새로고침
                                await fetchTodos();
                                
                                // 3초 후 피드백 숨기기
                                setTimeout(() => {
                                    setAgentStep('idle');
                                    setAgentMessage('');
                                }, 3000);
                            } else if (data.type === 'error') {
                                setAgentStep('error');
                                setAgentMessage(data.message);
                                setSkeletonCount(0);
                                
                                setTimeout(() => {
                                    setAgentStep('idle');
                                    setAgentMessage('');
                                }, 5000);
                            }
                        } catch (e) {
                            // JSON 파싱 실패 무시
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Generate todos error:', error);
            setAgentStep('error');
            setAgentMessage('투두 생성 중 오류가 발생했습니다.');
            setSkeletonCount(0);
        }
    }, [fetchTodos]);

    // 외부에서 생성 트리거
    useEffect(() => {
        if (generateTrigger > 0 && generateTrigger !== lastTrigger.current) {
            lastTrigger.current = generateTrigger;
            generateTodos();
        }
    }, [generateTrigger, generateTodos]);
    
    // 외부에서 투두 추가 트리거
    useEffect(() => {
        if (addTodoTrigger > 0 && addTodoTrigger !== lastAddTrigger.current) {
            lastAddTrigger.current = addTodoTrigger;
            addNewTodo();
        }
    }, [addTodoTrigger]);

    // order 기준 정렬 (order가 없으면 createdAt 역순)
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
        }
        return 0; // order가 없으면 기존 순서 유지
    });
    
    const activeTodos = sortedTodos.filter(todo => !todo.completed);
    const completedTodos = sortedTodos.filter(todo => todo.completed);

    const getSourceIcon = (type: string) => {
        switch (type) {
            case 'slack':
                return (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                    </svg>
                );
            case 'notion':
                return (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .841-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
                    </svg>
                );
            case 'email':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-orange-500';
            case 'low': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    const renderTodoItem = (todo: TodoItem, isCompleted: boolean = false) => {
        const isEditing = editingTodoId === todo.id;

        return (
            <div
                key={todo.id}
                className={`group flex items-start gap-3 border-b border-gray-200 bg-white py-3 transition-all hover:bg-gray-50 ${isCompleted ? 'opacity-60' : ''} animate-fadeIn`}
            >
                <button
                    onClick={() => !isEditing && toggleComplete(todo.id)}
                    className="mt-0.5 flex-shrink-0"
                    disabled={isEditing}
                >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        todo.completed
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                            : 'border-gray-300 hover:border-[var(--color-primary)]'
                    }`}>
                        {todo.completed && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        )}
                    </div>
                </button>
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        // 편집 모드
                        <div className="space-y-2">
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={() => {
                                    // DatePicker 클릭 중이면 저장하지 않음
                                    setTimeout(() => {
                                        if (!isClickingDatePicker.current && !showDatePicker) {
                                            saveTodo(todo.id);
                                        }
                                    }, 100);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        saveTodo(todo.id);
                                    } else if (e.key === 'Escape') {
                                        cancelEdit();
                                    }
                                }}
                                className="w-full px-2 py-1 text-[15px] font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                placeholder="할 일을 입력하세요"
                                autoFocus
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        isClickingDatePicker.current = true;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const pickerWidth = 280;
                                        const pickerHeight = 350;
                                        let top = rect.bottom + 8;
                                        let left = rect.left;
                                        if (left + pickerWidth > window.innerWidth) {
                                            left = window.innerWidth - pickerWidth - 16;
                                        }
                                        if (top + pickerHeight > window.innerHeight) {
                                            top = rect.top - pickerHeight - 8;
                                        }
                                        setDatePickerPosition({ top, left });
                                        setShowDatePicker(true);
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                    </svg>
                                    {editingDueDate || '날짜 선택'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => saveTodo(todo.id)}
                                    className="px-3 py-1 text-xs text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)] transition-colors"
                                >
                                    저장
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-3 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                            </div>
                            {showDatePicker && editingTodoId === todo.id && (
                                <DatePicker
                                    value={editingDueDate}
                                    onChange={(date) => {
                                        setEditingDueDate(date);
                                        closeDatePicker();
                                    }}
                                    onClose={closeDatePicker}
                                    position={datePickerPosition}
                                />
                            )}
                        </div>
                    ) : (
                        // 일반 모드
                        <>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <p className={`text-[15px] font-medium transition-all ${
                                        todo.completed
                                            ? 'text-gray-400 line-through'
                                            : 'text-gray-900'
                                    }`}>
                                        {todo.emoji && <span className="mr-1.5">{todo.emoji}</span>}
                                        {todo.title || '(제목 없음)'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {/* 소스 링크들 */}
                                    {todo.sources && todo.sources.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            {todo.sources.slice(0, 3).map((source, idx) => (
                                                <a
                                                    key={idx}
                                                    href={source.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-xs text-gray-600"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title={source.title || `${source.type}에서 열기`}
                                                >
                                                    {getSourceIcon(source.type)}
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                                    </svg>
                                                </a>
                                            ))}
                                            {todo.sources.length > 3 && (
                                                <span className="text-xs text-gray-400">+{todo.sources.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                    {/* 수정/삭제 버튼 (호버 시 표시) */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(todo)}
                                            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                            title="수정"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => deleteTodo(todo.id)}
                                            className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                            title="삭제"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {todo.dueDate && (
                                <div className="flex items-center gap-3 mt-2 text-xs">
                                    <span className={`flex items-center gap-1 ${todo.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {todo.dueDate}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full flex-col bg-white">
            <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-6' : 'px-12 py-12'} relative`}>
                <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
                    <div className="mb-6 md:mb-8">
                        <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-gray-900 mb-2`}>
                            {getTranslation(language, 'greeting', { name: displayName || getTranslation(language, 'user') })}
                        </h1>
                        <p className="text-gray-500 text-sm">{getTranslation(language, 'greetingSubtitle')}</p>
                    </div>

                    {currentView === 'todo' ? (
                        <>
                            {/* Agent 피드백 */}
                            {agentStep !== 'idle' && (
                                <AgentFeedback step={agentStep} message={agentMessage} />
                            )}

                            <section className="space-y-0">
                                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">할 일</h2>
                                    <div className="border-t border-gray-200">
                                    {/* 스켈레톤 */}
                                    {skeletonCount > 0 && (
                                        <TodoSkeleton count={skeletonCount} />
                                    )}

                                    {/* 로딩 상태 */}
                                    {isLoading && skeletonCount === 0 && (
                                        <TodoSkeleton count={3} />
                                    )}

                                    {/* 실제 투두 목록 - 드래그 앤 드롭 지원 */}
                                    {!isLoading && activeTodos.length > 0 && (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={activeTodos.map(t => t.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {activeTodos.map((todo) => (
                                                    <SortableTodoItem
                                                        key={todo.id}
                                                        todo={todo}
                                                        isCompleted={false}
                                                        isEditing={editingTodoId === todo.id}
                                                        editingTitle={editingTitle}
                                                        editingDueDate={editingDueDate}
                                                        showDatePicker={showDatePicker && editingTodoId === todo.id}
                                                        datePickerPosition={datePickerPosition}
                                                        onToggleComplete={toggleComplete}
                                                        onStartEdit={startEdit}
                                                        onDelete={deleteTodo}
                                                        onTitleChange={setEditingTitle}
                                                        onDueDateChange={setEditingDueDate}
                                                        onSave={saveTodo}
                                                        onCancel={cancelEdit}
                                                        onOpenDatePicker={(e) => {
                                                            e.stopPropagation();
                                                            isClickingDatePicker.current = true;
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const pickerWidth = 280;
                                                            const pickerHeight = 350;
                                                            let top = rect.bottom + 8;
                                                            let left = rect.left;
                                                            if (left + pickerWidth > window.innerWidth) {
                                                                left = window.innerWidth - pickerWidth - 16;
                                                            }
                                                            if (top + pickerHeight > window.innerHeight) {
                                                                top = rect.top - pickerHeight - 8;
                                                            }
                                                            setDatePickerPosition({ top, left });
                                                            setShowDatePicker(true);
                                                        }}
                                                        onCloseDatePicker={closeDatePicker}
                                                        titleInputRef={titleInputRef}
                                                        getSourceIcon={getSourceIcon}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    )}

                                    {/* 빈 상태 - 연동 없을 때 */}
                                    {!isLoading && activeTodos.length === 0 && skeletonCount === 0 && hasAnyIntegration === false && (
                                        <div className="py-12 text-center">
                                            <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-5">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[var(--color-primary)]">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">서비스를 연동해보세요</h3>
                                            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                                                Gmail, Slack, Notion을 연동하면<br />AI가 자동으로 할 일을 생성해드려요.
                                            </p>
                                            <button
                                                onClick={() => onOpenSettings?.('integrations')}
                                                className="px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[var(--color-primary-hover)] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                            >
                                                연동하기
                                            </button>
                                        </div>
                                    )}

                                    {/* 빈 상태 - 연동 있을 때 */}
                                    {!isLoading && activeTodos.length === 0 && skeletonCount === 0 && hasAnyIntegration !== false && (
                                        <div className="py-8 text-center text-gray-400">
                                            <p className="text-sm">할 일이 없습니다.</p>
                                            <p className="text-xs mt-1">새로고침 버튼을 눌러 AI로 할 일을 생성해보세요.</p>
                                        </div>
                                    )}

                                    <button 
                                        onClick={addNewTodo}
                                        className="w-full py-3 text-left text-sm text-[var(--color-primary)] hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            <span className="font-bold">할일 추가하기</span>
                                        </button>
                </div>
                                </section>
                            
                            {/* 완료된 투두 */}
                            {completedTodos.length > 0 && (
                                <section className="mt-8">
                                    <button 
                                        onClick={() => setShowCompleted(!showCompleted)}
                                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-3"
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            strokeWidth={2} 
                                            stroke="currentColor" 
                                            className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-90' : ''}`}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                        <span>완료된 투두</span>
                                        <span className="text-gray-400">({completedTodos.length})</span>
                                    </button>
                                    
                                    {showCompleted && (
                                        <div className="border-t border-gray-200">
                                            {completedTodos.map((todo) => renderTodoItem(todo, true))}
                        </div>
                                    )}
                                </section>
                            )}
                        </>
                    ) : (
                        <CardMain />
                    )}
                </div>

                {/* 채팅 토글 버튼 - 모바일에서는 숨김 (하단 네비에서 접근) */}
                {!isMobile && (
                    <button 
                        onClick={onToggleChat}
                        className={`fixed bottom-8 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-xl hover:shadow-2xl hover:bg-[var(--color-primary-hover)] transition-all hover:scale-105 flex items-center justify-center z-50 ${
                            isChatOpen ? 'right-[392px]' : 'right-8'
                        }`}
                        aria-label="채팅 열기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                    </button>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
