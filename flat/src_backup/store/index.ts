import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { projectSlice, type ProjectSlice } from './slices/projectSlice';
import { userSlice, type UserSlice } from './slices/userSlice';
import { uiSlice, type UISlice } from './slices/uiSlice';

export type RootState = ProjectSlice & UserSlice & UISlice;

export const useStore = create<RootState>()(
  devtools(
    persist(
      (set) => ({
        ...projectSlice(set),
        ...userSlice(set),
        ...uiSlice(set),
      }),
      {
        name: 'flat-dashboard-storage',
        partialize: (state) => ({
          // Only persist specific parts of the state
          user: state.user,
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    )
  )
);