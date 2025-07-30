import axios from 'axios'
import { SendMessageRequest, SendMessageResponse } from '@/app/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiClient = {
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await api.post('/ingest', data)
    return response.data
  },
  
  query: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await api.post('/query', data)
    return response.data
  },
}

export default api