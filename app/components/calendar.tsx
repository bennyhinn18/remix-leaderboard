import React, { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return (
    <div className="calendar">
      <DayPicker 
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
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