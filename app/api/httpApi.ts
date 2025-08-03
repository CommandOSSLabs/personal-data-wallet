import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const createHttpClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
  
  const client = axios.create({
    baseURL,
    timeout: 60000, 
    headers: {
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use(
    (config) => {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    (error) => {
      console.error('Request error:', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
      return response
    },
    (error) => {
      const status = error.response?.status
      const url = error.config?.url
      const method = error.config?.method?.toUpperCase()
      
      console.error(`❌ ${method} ${url} - ${status}:`, error.response?.data || error.message)
      
      // Handle common error cases
      if (status === 401) {
        // Handle unauthorized - could redirect to login
        console.warn('Unauthorized request')
      } else if (status === 404) {
        console.warn('Resource not found')
      } else if (status >= 500) {
        console.error('Server error')
      }
      
      return Promise.reject(error)
    }
  )

  return client
}

// Create the main HTTP client instance
export const httpClient = createHttpClient()

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Generic API methods
export const httpApi = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.get<T>(url, config)
    return response.data
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.post<T>(url, data, config)
    return response.data
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.put<T>(url, data, config)
    return response.data
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.delete<T>(url, config)
    return response.data
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.patch<T>(url, data, config)
    return response.data
  },

  // Streaming request (for Server-Sent Events)
  stream: async (url: string, data?: any, config?: AxiosRequestConfig): Promise<Response> => {
    const fullUrl = `${httpClient.defaults.baseURL}${url}`
    
    return fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }
}

export default httpApi
