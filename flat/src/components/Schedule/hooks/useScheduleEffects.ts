import { useEffect } from 'react';
import { isToday } from '../../../utils/dateUtils';

export const useScheduleEffects = (
  days: Date[],
  scrollRef: React.RefObject<HTMLDivElement>,
  sliderValue: number,
  setSliderValue: (value: number) => void
) => {
  const cellWidth = 40;

  // 스크롤 이벤트 핸들러만 설정
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
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [scrollRef, setSliderValue]);

  // 초기 로드 시에만 오늘 날짜로 스크롤
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && days.length > 0) {
      const todayIndex = days.findIndex(day => isToday(day));
      if (todayIndex >= 0) {
        // setTimeout으로 초기 렌더링 후 스크롤
        setTimeout(() => {
          const scrollPosition = Math.max(0, todayIndex * cellWidth - 200);
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollPosition;
          }
        }, 100);
      }
    }
  }, []); // 빈 배열로 초기 로드 시에만 실행

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