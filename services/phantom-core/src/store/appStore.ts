import { create } from 'zustand'
import { Device, Alert } from '../types'

interface AppState {
  activePage:  string
  devices:     Device[]
  alerts:      Alert[]
  setPage:     (page: string) => void
  setDevices:  (devices: Device[]) => void
  addAlert:    (alert: Alert) => void
}

export const useAppStore = create<AppState>((set) => ({
  activePage: 'home',
  devices:    [],
  alerts:     [],
  setPage:    (page)    => set({ activePage: page }),
  setDevices: (devices) => set({ devices }),
  addAlert:   (alert)   => set((s) => ({ alerts: [alert, ...s.alerts] })),
}))