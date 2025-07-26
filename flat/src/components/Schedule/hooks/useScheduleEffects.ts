import { useEffect, useRef } from 'react';
import { isToday } from '../../../utils/coreUtils';

export const useScheduleEffects = (
  days: Date[],
  scrollRef: React.RefObject<HTMLDivElement>,
  sliderValue: number,
  setSliderValue: (value: number) => void
) => {
  const cellWidth = 40;
  const hasScrolledToToday = useRef(false);

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
      return () => {
        // Check if element still exists before removing listener
        if (scrollRef.current) {
          scrollRef.current.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [scrollRef, setSliderValue]);

  // 초기 로드 시에만 오늘 날짜로 스크롤
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && days.length > 0 && !hasScrolledToToday.current) {
      const todayIndex = days.findIndex(day => isToday(day));
      if (todayIndex >= 0) {
        // setTimeout으로 초기 렌더링 후 스크롤
        setTimeout(() => {
          if (!scrollRef.current || hasScrolledToToday.current) {
            return;
          }
          
          const viewportWidth = scrollRef.current.clientWidth;
          const maxScrollLeft = scrollRef.current.scrollWidth - viewportWidth;
          
          // 스크롤 가능한 경우에만 스크롤
          if (maxScrollLeft > 0) {
            // 비율 기반 계산으로 모든 프로젝트에서 일관된 중앙 위치
            const totalDays = days.length;
            const todayRatio = todayIndex / (totalDays - 1); // 전체에서 오늘의 비율 (0~1)
            
            // 스크롤 범위에서 해당 비율만큼 이동한 후 중앙 정렬
            const baseScrollPosition = maxScrollLeft * todayRatio;
            let scrollPosition = baseScrollPosition - (viewportWidth / 2);
            
            // 경계값 확인: 스크롤 가능 범위를 벗어나지 않도록 제한
            scrollPosition = Math.max(0, Math.min(scrollPosition, maxScrollLeft));
            
            scrollRef.current.scrollLeft = scrollPosition;
            hasScrolledToToday.current = true;
          }
        }, 300);
      }
    }
  }, [days.length]); // days 길이가 변경될 때만 실행

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
      const viewportWidth = scrollRef.current.clientWidth;
      const maxScrollLeft = scrollRef.current.scrollWidth - viewportWidth;
      
      // 스크롤 가능한 경우에만 스크롤
      if (maxScrollLeft > 0) {
        // 비율 기반 계산으로 모든 프로젝트에서 일관된 중앙 위치
        const totalDays = days.length;
        const todayRatio = todayIndex / (totalDays - 1); // 전체에서 오늘의 비율 (0~1)
        
        // 스크롤 범위에서 해당 비율만큼 이동한 후 중앙 정렬
        const baseScrollPosition = maxScrollLeft * todayRatio;
        let scrollPosition = baseScrollPosition - (viewportWidth / 2);
        
        // 경계값 확인: 스크롤 가능 범위를 벗어나지 않도록 제한
        scrollPosition = Math.max(0, Math.min(scrollPosition, maxScrollLeft));
        
        scrollRef.current.scrollLeft = scrollPosition;
      }
    }
  };

  return {
    handleSliderChange,
    scrollToToday
  };
};