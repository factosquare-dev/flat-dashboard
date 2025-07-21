import { useState, useRef, useEffect } from 'react';
import { isToday } from '../utils/dateUtils';

export const useScheduleDrag = (
  days?: Date[],
  sliderValue?: number,
  setSliderValue?: (value: number) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cellWidth = 40;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setDragStartTime(Date.now());
    setDragDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
    setDragDistance(Math.abs(walk));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const isDragClick = () => {
    const dragTime = Date.now() - dragStartTime;
    return dragTime < 200 && dragDistance < 5;
  };

  // 스크롤 이벤트 핸들러 (슬라이더 동기화)
  useEffect(() => {
    if (!setSliderValue) return;

    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
        const scrollWidth = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        const percentage = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
        setSliderValue(percentage);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [setSliderValue]);

  // 오늘 날짜로 자동 스크롤 (정중앙 정렬)
  useEffect(() => {
    if (!days || days.length === 0) return;
    
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const todayIndex = days.findIndex(day => isToday(day));
    if (todayIndex < 0) return;

    // 약간의 지연 후 실행
    setTimeout(() => {
      if (!scrollRef.current) return;

      const todayPosition = todayIndex * cellWidth;
      const viewportWidth = scrollRef.current.clientWidth;
      const scrollLeft = todayPosition - viewportWidth / 2 + cellWidth / 2;

      scrollRef.current.scrollLeft = Math.max(0, scrollLeft);
    }, 150);
  }, [days]);

  // 슬라이더 이동 처리
  const handleSliderChange = (value: number) => {
    if (!setSliderValue) return;
    
    setSliderValue(value);
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollLeft = (value / 100) * scrollWidth;
    }
  };

  // 오늘 날짜로 이동 버튼용 함수
  const scrollToToday = () => {
    if (!days) return;
    
    const todayIndex = days.findIndex(day => isToday(day));
    if (todayIndex >= 0 && scrollRef.current) {
      const todayPosition = todayIndex * cellWidth;
      const viewportWidth = scrollRef.current.clientWidth;
      const scrollLeft = todayPosition - viewportWidth / 2 + cellWidth / 2;
      scrollRef.current.scrollLeft = Math.max(0, scrollLeft);
    }
  };

  return {
    isDragging,
    scrollRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragClick,
    handleSliderChange,
    scrollToToday
  };
};