import { create } from 'zustand'
interface AppState {
  activePage: string
  setPage: (p: string) => void
}
export const useAppStore = create<AppState>((set) => ({
  activePage: 'home',
  setPage: (activePage) => set({ activePage })
}))
