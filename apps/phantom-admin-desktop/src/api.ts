import axios from 'axios'
export const coreApi = axios.create({ baseURL: 'http://localhost:8000' })
export const aiApi   = axios.create({ baseURL: 'http://localhost:8001' })
