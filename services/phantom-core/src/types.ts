export interface Device {
  id:            string
  name:          string
  hostname?:     string
  mac_address?:  string
  ip_address?:   string
  platform:      'windows' | 'linux' | 'macos' | 'android' | 'ios' | 'unknown'
  status:        'online' | 'offline' | 'degraded' | 'unknown'
  health_score:  number
  agent_version?: string
  first_seen:    string
  last_seen:     string
}

export interface Alert {
  id:         string
  device_id?: string
  severity:   'info' | 'warning' | 'critical'
  message:    string
  resolved:   boolean
  created_at: string
}

export interface ChatMessage {
  role:    'user' | 'ai'
  content: string
}

export interface NetworkHealth {
  score:       number
  cpu_avg:     number
  memory_avg:  number
  online_count: number
  total_count:  number
}