// Global state management for Schedule component
// Using a namespace to prevent window pollution

export interface InteractionState {
  mode: 'idle' | 'dragging' | 'resizing' | 'selecting';
  preventClickUntil: number;
}

export interface ScheduleGlobalState {
  interactionState: InteractionState;
  dragImageElement?: HTMLDivElement;
}

// Initialize namespace on window object
declare global {
  interface Window {
    __FLAT_SCHEDULE__: ScheduleGlobalState;
  }
}

// Initialize the namespace if it doesn't exist
if (typeof window !== 'undefined' && !window.__FLAT_SCHEDULE__) {
  window.__FLAT_SCHEDULE__ = {
    interactionState: {
      mode: 'idle',
      preventClickUntil: 0
    }
  };
}

// Export helper functions to access global state
export const getScheduleGlobalState = (): ScheduleGlobalState => {
  if (typeof window === 'undefined') {
    throw new Error('Window is not defined');
  }
  
  if (!window.__FLAT_SCHEDULE__) {
    window.__FLAT_SCHEDULE__ = {
      interactionState: {
        mode: 'idle',
        preventClickUntil: 0
      }
    };
  }
  
  return window.__FLAT_SCHEDULE__;
};

export const getInteractionState = (): InteractionState => {
  return getScheduleGlobalState().interactionState;
};

export const setInteractionMode = (mode: InteractionState['mode']) => {
  const state = getScheduleGlobalState();
  state.interactionState.mode = mode;
};

export const setPreventClickUntil = (timestamp: number) => {
  const state = getScheduleGlobalState();
  state.interactionState.preventClickUntil = timestamp;
};

export const getDragImageElement = (): HTMLDivElement | undefined => {
  return getScheduleGlobalState().dragImageElement;
};

export const setDragImageElement = (element: HTMLDivElement | undefined) => {
  const state = getScheduleGlobalState();
  state.dragImageElement = element;
};