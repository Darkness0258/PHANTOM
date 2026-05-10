export interface Device {
  id: string; name: string; hostname?: string
  mac_address?: string; ip_address?: string
  platform: string; status: string
  health_score: number; first_seen: string; last_seen: string
}
export interface Alert {
  id: string; device_id?: string
  severity: 'info'|'warning'|'critical'
  message: string; resolved: boolean; created_at: string
}
export interface ChatMessage { role: 'user'|'ai'; content: string }
