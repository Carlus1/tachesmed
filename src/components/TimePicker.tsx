interface TimePickerProps {
  value: string; // Format "HH:MM"
  onChange: (time: string) => void;
  className?: string;
}

export default function TimePicker({ value, onChange, className = '' }: TimePickerProps) {
  // Parse current time
  const [hours, minutes] = value.split(':').map(Number);
  
  // Generate hours (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minutes by 15 min intervals
  const minuteOptions = [0, 15, 30, 45];
  
  const handleHourChange = (newHour: number) => {
    const newTime = `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    onChange(newTime);
  };
  
  const handleMinuteChange = (newMinute: number) => {
    const newTime = `${String(hours).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
    onChange(newTime);
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={hours}
        onChange={(e) => handleHourChange(Number(e.target.value))}
        className="flex-1 border border-border rounded-xl px-3 py-3 bg-background text-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-400 transition-all"
      >
        {hourOptions.map((hour) => (
          <option key={hour} value={hour}>
            {String(hour).padStart(2, '0')}h
          </option>
        ))}
      </select>
      
      <span className="text-primary-400 font-semibold">:</span>
      
      <select
        value={minutes}
        onChange={(e) => handleMinuteChange(Number(e.target.value))}
        className="flex-1 border border-border rounded-xl px-3 py-3 bg-background text-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-400 transition-all"
      >
        {minuteOptions.map((minute) => (
          <option key={minute} value={minute}>
            {String(minute).padStart(2, '0')}
          </option>
        ))}
      </select>
    </div>
  );
}
