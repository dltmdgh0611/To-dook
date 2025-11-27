'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export default function DatePicker({ value, onChange, onClose, position }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  // 날짜 파싱 (간단한 형식 지원)
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return new Date();
    // "오늘", "내일" 등의 간단한 형식은 현재 날짜로 처리
    const today = new Date();
    if (dateStr.includes('오늘')) return today;
    if (dateStr.includes('내일')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    // 실제 날짜 형식 파싱 시도
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? today : parsed;
  };

  const selectedDate = parseDate(value) || new Date();

  // 월 변경
  const changeMonth = (delta: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
  };

  // 날짜 선택
  const selectDate = (date: Date) => {
    const dateStr = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    onChange(dateStr);
    onClose();
  };

  // 캘린더 그리드 생성
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // 이전 달의 마지막 날들
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }

    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // 다음 달의 첫 날들 (캘린더를 6주로 채우기)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const today = new Date();
  const isToday = (date: Date) => 
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isSelected = (date: Date) =>
    date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getFullYear() === selectedDate.getFullYear();

  const isCurrentMonth = (date: Date) =>
    date.getMonth() === currentMonth.getMonth();

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const monthYearStr = currentMonth.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div
      ref={pickerRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-[100]"
      style={position ? { top: position.top, left: position.left } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-sm font-semibold text-gray-900">
          {monthYearStr}
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div key={idx} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, idx) => {
          if (!date) return <div key={idx} />;
          
          const isOtherMonth = !isCurrentMonth(date);
          const isSelectedDate = isSelected(date);
          const isTodayDate = isToday(date);

          return (
            <button
              key={idx}
              onClick={() => selectDate(date)}
              className={`
                w-8 h-8 text-xs rounded transition-colors
                ${isOtherMonth ? 'text-gray-300' : 'text-gray-900'}
                ${isSelectedDate 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : isTodayDate 
                    ? 'bg-blue-100 text-blue-600 font-semibold' 
                    : 'hover:bg-gray-100'
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* 빠른 선택 버튼 */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
        <button
          onClick={() => {
            const today = new Date();
            selectDate(today);
          }}
          className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          오늘
        </button>
        <button
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            selectDate(tomorrow);
          }}
          className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          내일
        </button>
        <button
          onClick={() => {
            onChange('');
            onClose();
          }}
          className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          제거
        </button>
      </div>
    </div>
  );
}

