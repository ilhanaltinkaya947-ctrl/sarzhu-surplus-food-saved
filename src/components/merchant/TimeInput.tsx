import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export function TimeInput({ value, onChange, label, className = "" }: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse current value
  const [currentHour, currentMinute] = (value || '09:00').split(':');
  
  const handleSelect = (hour: string, minute: string) => {
    const newTime = `${hour}:${minute}`;
    onChange(newTime);
    setIsOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as unknown as EventListener);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as unknown as EventListener);
    };
  }, [isOpen]);

  const formatDisplayTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 flex items-center justify-between gap-2 rounded-md border border-input bg-background text-base font-medium hover:bg-accent/50 transition-colors"
      >
        <span>{formatDisplayTime(value || '09:00')}</span>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="flex">
            {/* Hours column */}
            <div className="flex-1 max-h-64 overflow-y-auto border-r border-border">
              <div className="p-1">
                {HOURS.map((hour) => {
                  const displayHour = parseInt(hour, 10);
                  const ampm = displayHour >= 12 ? 'PM' : 'AM';
                  const display = displayHour === 0 ? '12 AM' : displayHour > 12 ? `${displayHour - 12} PM` : displayHour === 12 ? '12 PM' : `${displayHour} AM`;
                  
                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleSelect(hour, currentMinute)}
                      className={`w-full px-3 py-2 text-sm text-left rounded transition-colors ${
                        hour === currentHour
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      {display}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Minutes column */}
            <div className="flex-1 max-h-64 overflow-y-auto">
              <div className="p-1">
                {MINUTES.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleSelect(currentHour, minute)}
                    className={`w-full px-3 py-2 text-sm text-left rounded transition-colors ${
                      minute === currentMinute
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    :{minute}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}