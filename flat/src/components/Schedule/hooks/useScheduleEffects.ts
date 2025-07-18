import { useEffect } from 'react';
import { isToday } from '../../../utils/dateUtils';

export const useScheduleEffects = (
  days: Date[],
  scrollRef: React.RefObject<HTMLDivElement>,
  sliderValue: number,
  setSliderValue: (value: number) => void
) => {
  const cellWidth = 40;

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
        const scrollWidth = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        const percentage = (scrollLeft / scrollWidth) * 100;
        setSliderValue(percentage);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      
      const todayIndex = days.findIndex(day => isToday(day));
      if (todayIndex >= 0) {
        const scrollPosition = Math.max(0, todayIndex * cellWidth - 200);
        scrollElement.scrollLeft = scrollPosition;
      }
      
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [days, cellWidth, scrollRef, setSliderValue]);

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollLeft = (value / 100) * scrollWidth;
    }
  };

  const scrollToToday = () => {
    const todayIndex = days.findIndex(day => isToday(day));
    if (todayIndex >= 0 && scrollRef.current) {
      const scrollPosition = Math.max(0, todayIndex * cellWidth - 200);
      scrollRef.current.scrollLeft = scrollPosition;
    }
  };

  return {
    handleSliderChange,
    scrollToToday
  };
};