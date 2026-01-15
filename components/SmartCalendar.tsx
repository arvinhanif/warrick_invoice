
import React, { useState } from 'react';

interface SmartCalendarProps {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
}

const SmartCalendar: React.FC<SmartCalendarProps> = ({ value, onChange, onClose }) => {
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    onClose();
  };

  const setToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    onClose();
  };

  const clearSelection = () => {
    // For this UI, "Clear" typically resets to current date or null. We'll stick to a reset/default action.
    onClose();
  };

  const renderDays = () => {
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const totalDays = daysInMonth(currentYear, currentMonth);
    const startDay = firstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Prev month padding
    const prevMonthView = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthDaysTotal = daysInMonth(prevMonthView.getFullYear(), prevMonthView.getMonth());
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="h-10 w-10 flex items-center justify-center text-white/30 text-[13px]">
          {prevMonthDaysTotal - i}
        </div>
      );
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
      const dateCheck = new Date(currentYear, currentMonth, d);
      const yearStr = dateCheck.getFullYear();
      const monthStr = String(dateCheck.getMonth() + 1).padStart(2, '0');
      const dayStr = String(dateCheck.getDate()).padStart(2, '0');
      const isSelected = value === `${yearStr}-${monthStr}-${dayStr}`;
      
      days.push(
        <div
          key={d}
          onClick={() => handleDateClick(d)}
          className={`h-10 w-10 flex items-center justify-center cursor-pointer text-[13px] transition-all rounded-[4px] font-medium ${
            isSelected 
              ? 'bg-[#8ab4f8] text-[#202124] ring-2 ring-[#8ab4f8] ring-offset-2 ring-offset-[#2e2e2e]' 
              : 'text-white hover:bg-white/10'
          }`}
        >
          {d}
        </div>
      );
    }

    // Next month padding to fill the 6x7 grid (42 cells)
    const remainingSlots = 42 - days.length; 
    for (let i = 1; i <= remainingSlots; i++) {
      days.push(
        <div key={`next-${i}`} className="h-10 w-10 flex items-center justify-center text-white/30 text-[13px]">
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-[#2e2e2e] rounded-xl shadow-2xl p-5 w-[320px] select-none text-white border border-white/10 font-sans animate-in fade-in zoom-in-95 duration-200">
      {/* Header matching image exactly */}
      <div className="flex justify-between items-center mb-5 px-1">
        <div className="flex items-center space-x-2 cursor-pointer group">
          <span className="font-bold text-[16px] text-white/90 tracking-tight">
            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handlePrevMonth} 
            className="text-white/60 hover:text-white transition-colors"
            title="Previous Month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button 
            onClick={handleNextMonth} 
            className="text-white/60 hover:text-white transition-colors"
            title="Next Month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="h-10 w-10 flex items-center justify-center text-[12px] font-bold text-white/90">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {renderDays()}
      </div>

      {/* Footer Actions in Blue */}
      <div className="flex justify-between items-center mt-6 px-1">
        <button 
          onClick={clearSelection}
          className="text-[#8ab4f8] font-bold text-[14px] hover:brightness-110 active:scale-95 transition-all"
        >
          Clear
        </button>
        <button 
          onClick={setToday}
          className="text-[#8ab4f8] font-bold text-[14px] hover:brightness-110 active:scale-95 transition-all"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default SmartCalendar;
