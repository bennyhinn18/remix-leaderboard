import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  initialFocus?: boolean;
  disabled?: (date: Date) => boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  initialFocus,
  disabled,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(selected);

  useEffect(() => {
    if (selected) {
      setSelectedDate(selected);
    }
  }, [selected]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onSelect(date);
    }
  };

  return (
    <div className="calendar">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        initialFocus={initialFocus}
        disabled={disabled}
      />
      {selectedDate && (
        <p className="selected-date">
          Selected Date: {format(selectedDate, 'PPP')}
        </p>
      )}
    </div>
  );
};

export default Calendar;
