import axios from 'axios'

const CORE_URL = 'http://localhost:8000'
const AI_URL   = 'http://localhost:8001'

export const coreApi = axios.create({ baseURL: CORE_URL })
export const aiApi   = axios.create({ baseURL: AI_URL })

export const api = {
  getHealth:  () => coreApi.get('/health'),
  getDevices: () => coreApi.get('/devices'),
  chatAI:     (message: string) => aiApi.post('/chat', { message }),
}