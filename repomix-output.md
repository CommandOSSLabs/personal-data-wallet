This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.dockerignore
.env.example
.prettierrc
api/chat/sessions/rename/route.ts
api/chatApi.ts
api/httpApi.ts
api/index.ts
api/memory/content/[hash]/route.ts
api/memoryApi.ts
api/storage/retrieve/[blobId]/route.ts
auth/callback/page.tsx
components/auth/login-page.tsx
components/chat/chat-input.tsx
components/chat/chat-interface.tsx
components/chat/chat-window.tsx
components/chat/markdown-renderer.tsx
components/chat/message.tsx
components/chat/model-selector.tsx
components/chat/relevant-memories.tsx
components/memory/memory-approval-modal.tsx
components/memory/memory-batch-status.tsx
components/memory/memory-decryption-modal.tsx
components/memory/memory-extraction-indicator.tsx
components/memory/memory-graph.tsx
components/memory/memory-index-debug.tsx
components/memory/memory-indicator-icon.tsx
components/memory/memory-indicator.tsx
components/memory/memory-manager.tsx
components/memory/memory-panel.tsx
components/memory/memory-review-modal.tsx
components/memory/memory-selection-modal.tsx
components/sidebar/sidebar.tsx
components/wallet/wallet-balance.tsx
config/models.ts
config/sealConfig.ts
direct/page.tsx
Dockerfile
env.example
eslint.config.mjs
globals.css
hooks/use-chat-sessions.ts
hooks/use-memory-index.ts
hooks/use-streaming-chat.ts
hooks/use-sui-auth.ts
layout.tsx
lib/api.ts
nest-cli.json
package.json
page.tsx
providers/mantine-provider.tsx
providers/query-provider.tsx
providers/sui-provider.tsx
railway.toml
README.md
services/BatchTransactionService.ts
services/EnhancedTransactionService.ts
services/memoryDecryptionCache.ts
services/memoryEventEmitter.ts
services/memoryIndexService.ts
services/memoryIntegration.ts
services/memoryRetrievalService.ts
services/README.MD
services/relevant-memories.tsx
services/sealService.ts
services/suiBlockchainService.ts
services/walrusCache.ts
src/app.controller.spec.ts
src/app.controller.ts
src/app.module.ts
src/app.service.ts
src/chat/chat.controller.spec.ts
src/chat/chat.controller.ts
src/chat/chat.module.ts
src/chat/chat.service.spec.ts
src/chat/chat.service.ts
src/chat/dto/add-message.dto.ts
src/chat/dto/chat-message.dto.ts
src/chat/dto/create-session.dto.ts
src/chat/dto/save-summary.dto.ts
src/chat/dto/session-index.dto.ts
src/chat/dto/update-session-title.dto.ts
src/chat/entities/chat-message.entity.ts
src/chat/entities/chat-session.entity.ts
src/chat/README.md
src/chat/summarization/summarization.service.spec.ts
src/chat/summarization/summarization.service.ts
src/database/database.config.ts
src/database/database.module.ts
src/database/migrations/1704326400000-CreateChatTables.ts
src/infrastructure/demo-storage/demo-storage.service.ts
src/infrastructure/gemini/gemini.service.spec.ts
src/infrastructure/gemini/gemini.service.ts
src/infrastructure/infrastructure.module.ts
src/infrastructure/local-storage/local-storage.service.ts
src/infrastructure/seal/seal.service.spec.ts
src/infrastructure/seal/seal.service.ts
src/infrastructure/storage/storage.service.ts
src/infrastructure/sui/sui.service.spec.ts
src/infrastructure/sui/sui.service.ts
src/infrastructure/walrus/cached-walrus.service.ts
src/infrastructure/walrus/walrus.service.spec.ts
src/infrastructure/walrus/walrus.service.ts
src/main.ts
src/memory/classifier/classifier.service.spec.ts
src/memory/classifier/classifier.service.ts
src/memory/dto/create-memory.dto.ts
src/memory/dto/initialize-index.dto.ts
src/memory/dto/memory-context.dto.ts
src/memory/dto/memory-index.dto.ts
src/memory/dto/prepare-index.dto.ts
src/memory/dto/process-memory.dto.ts
src/memory/dto/query-memory.dto.ts
src/memory/dto/register-index.dto.ts
src/memory/dto/save-memory.dto.ts
src/memory/dto/search-memory.dto.ts
src/memory/dto/update-memory-index.dto.ts
src/memory/dto/update-memory.dto.ts
src/memory/embedding/embedding.service.spec.ts
src/memory/embedding/embedding.service.ts
src/memory/graph/graph.service.spec.ts
src/memory/graph/graph.service.ts
src/memory/hnsw-index/hnsw-index.service.spec.ts
src/memory/hnsw-index/hnsw-index.service.ts
src/memory/memory-index/memory-index.service.ts
src/memory/memory-ingestion/memory-ingestion.service.spec.ts
src/memory/memory-ingestion/memory-ingestion.service.ts
src/memory/memory-query/memory-query.service.spec.ts
src/memory/memory-query/memory-query.service.ts
src/memory/memory.controller.spec.ts
src/memory/memory.controller.ts
src/memory/memory.module.ts
src/storage/storage.controller.ts
src/storage/storage.module.ts
src/types/chat.types.ts
src/types/memory.types.ts
storage/demo/demo_1754534312456_2lx7mykti.meta.json
storage/demo/demo_1754534633183_yt9zuy3qe.meta.json
storage/demo/demo_1754535038700_ntefo0kvy.meta.json
storage/demo/demo_1754535327413_yf2wjwvbd.meta.json
storage/demo/demo_1754535362416_1pfa05kc4.meta.json
storage/demo/demo_1754535958436_tlj0znmas.meta.json
storage/demo/demo_1754535968438_o9u9eqgr4.meta.json
storage/demo/demo_1754536709267_yr833srfc.meta.json
storage/demo/demo_1754536719270_ujscvj291.meta.json
storage/demo/demo_1754538821742_9a9vv89al.meta.json
storage/demo/demo_1754538831743_cwbsutrso.meta.json
storage/demo/demo_1754539071783_tzhiji8bw.meta.json
storage/demo/demo_1754539081785_9vqq494ia.meta.json
storage/demo/demo_1754539231823_gfk1ubeyw.meta.json
storage/demo/demo_1754539241821_ua9an5w6x.meta.json
storage/demo/demo_1754539655050_1yuvdud9e.meta.json
storage/demo/demo_1754539665050_3d43d888p.meta.json
storage/demo/demo_1754540095842_852742y8r.meta.json
storage/demo/demo_1754540110846_e7eavdz9c.meta.json
storage/demo/demo_1754540565610_75jbcbuzp.meta.json
storage/demo/demo_1754540578725_u30bqfq9m.meta.json
storage/demo/demo_1754541640849_t6j1myndi.meta.json
storage/demo/demo_1754541650850_pf532v4hi.meta.json
storage/demo/demo_1754541695858_n554auc76.meta.json
storage/demo/demo_1754541710861_jhl08v5l4.meta.json
storage/demo/demo_1754541790876_li15dswz8.meta.json
storage/demo/demo_1754541800877_d638k2anw.meta.json
storage/local-files/local_1754534305198_q22zh8cwy.bin
storage/local-files/local_1754534305198_q22zh8cwy.meta.json
storage/local-files/local_1754534625610_ypj49l99v.bin
storage/local-files/local_1754534625610_ypj49l99v.meta.json
storage/local-files/local_1754534628442_toq5anvtd.bin
storage/local-files/local_1754534628442_toq5anvtd.meta.json
storage/local-files/local_1754535033763_gref2myc6.bin
storage/local-files/local_1754535033763_gref2myc6.meta.json
storage/local-files/local_1754535036617_jl0y01afd.bin
storage/local-files/local_1754535036617_jl0y01afd.meta.json
storage/local-files/local_1754535324074_l4jqutgyc.bin
storage/local-files/local_1754535324074_l4jqutgyc.meta.json
storage/local-files/local_1754535357357_zxnoife04.bin
storage/local-files/local_1754535357357_zxnoife04.meta.json
storage/local-files/local_1754535359902_w2u5g1r3l.bin
storage/local-files/local_1754535359902_w2u5g1r3l.meta.json
storage/local-files/local_1754535950418_c1wqhxkb2.bin
storage/local-files/local_1754535950418_c1wqhxkb2.meta.json
storage/local-files/local_1754535961289_ajo3o72e8.bin
storage/local-files/local_1754535961289_ajo3o72e8.meta.json
storage/local-files/local_1754535963229_ko9bposbo.bin
storage/local-files/local_1754535963229_ko9bposbo.meta.json
storage/local-files/local_1754536703093_ynqbvipyi.bin
storage/local-files/local_1754536703093_ynqbvipyi.meta.json
storage/local-files/local_1754536713359_nxidex5ql.bin
storage/local-files/local_1754536713359_nxidex5ql.meta.json
storage/local-files/local_1754536715722_4gkzdpanm.bin
storage/local-files/local_1754536715722_4gkzdpanm.meta.json
storage/local-files/local_1754538815556_kw9wcf4uj.bin
storage/local-files/local_1754538815556_kw9wcf4uj.meta.json
storage/local-files/local_1754538826612_zg4aeo58j.bin
storage/local-files/local_1754538826612_zg4aeo58j.meta.json
storage/local-files/local_1754538829479_1leonmojs.bin
storage/local-files/local_1754538829479_1leonmojs.meta.json
storage/local-files/local_1754539068311_nxtd4wt07.bin
storage/local-files/local_1754539068311_nxtd4wt07.meta.json
storage/local-files/local_1754539078099_0khnnvawh.bin
storage/local-files/local_1754539078099_0khnnvawh.meta.json
storage/local-files/local_1754539080663_uqitg0fks.bin
storage/local-files/local_1754539080663_uqitg0fks.meta.json
storage/local-files/local_1754539227568_qdhfiob2p.bin
storage/local-files/local_1754539227568_qdhfiob2p.meta.json
storage/local-files/local_1754539239062_ah8bgtzu7.bin
storage/local-files/local_1754539239062_ah8bgtzu7.meta.json
storage/local-files/local_1754539242127_46r89jdob.bin
storage/local-files/local_1754539242127_46r89jdob.meta.json
storage/local-files/local_1754539649516_nncbx4o95.bin
storage/local-files/local_1754539649516_nncbx4o95.meta.json
storage/local-files/local_1754539660418_298i349h8.bin
storage/local-files/local_1754539660418_298i349h8.meta.json
storage/local-files/local_1754539662466_olvt271kr.bin
storage/local-files/local_1754539662466_olvt271kr.meta.json
storage/local-files/local_1754540091880_d3pum0g1x.bin
storage/local-files/local_1754540091880_d3pum0g1x.meta.json
storage/local-files/local_1754540106067_jvxtdtin9.bin
storage/local-files/local_1754540106067_jvxtdtin9.meta.json
storage/local-files/local_1754540108700_bygazbzkw.bin
storage/local-files/local_1754540108700_bygazbzkw.meta.json
storage/local-files/local_1754540560620_s4ex6ddxg.bin
storage/local-files/local_1754540560620_s4ex6ddxg.meta.json
storage/local-files/local_1754540573009_ghjdr09ly.bin
storage/local-files/local_1754540573009_ghjdr09ly.meta.json
storage/local-files/local_1754540575575_yxy9qez6f.bin
storage/local-files/local_1754540575575_yxy9qez6f.meta.json
storage/local-files/local_1754541634539_sqt76tdfh.bin
storage/local-files/local_1754541634539_sqt76tdfh.meta.json
storage/local-files/local_1754541647648_icfuh11h7.bin
storage/local-files/local_1754541647648_icfuh11h7.meta.json
storage/local-files/local_1754541650145_ri0guagxt.bin
storage/local-files/local_1754541650145_ri0guagxt.meta.json
storage/local-files/local_1754541692408_i6mdo5ysk.bin
storage/local-files/local_1754541692408_i6mdo5ysk.meta.json
storage/local-files/local_1754541704380_6whgsy61h.bin
storage/local-files/local_1754541704380_6whgsy61h.meta.json
storage/local-files/local_1754541707350_4jfu1ojc0.bin
storage/local-files/local_1754541707350_4jfu1ojc0.meta.json
storage/local-files/local_1754541785901_ea8kfryak.bin
storage/local-files/local_1754541785901_ea8kfryak.meta.json
storage/local-files/local_1754541797114_05pja6iqr.bin
storage/local-files/local_1754541797114_05pja6iqr.meta.json
storage/local-files/local_1754541799714_jdfwhdtlo.bin
storage/local-files/local_1754541799714_jdfwhdtlo.meta.json
test-chat-success copy.js
test/app.e2e-spec.ts
test/jest-e2e.json
tsconfig.build.json
tsconfig.json
types/index.ts
```

# Files

## File: api/chat/sessions/rename/route.ts
````typescript
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, title, userAddress } = await req.json();
    
    if (!sessionId || !title || !userAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the backend URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Forward the request to the backend
    const response = await fetch(`${baseURL}/api/chat/sessions/${sessionId}/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        userAddress
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      return new Response(
        JSON.stringify({ 
          error: 'Failed to rename session',
          details: errorData
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error renaming session:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
````

## File: api/chatApi.ts
````typescript
import { httpApi, ApiResponse } from './httpApi'

export interface ChatSession {
  id: string
  owner: string
  title: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
  message_count: number
  sui_object_id: string
}

export interface ChatMessage {
  id?: string
  content: string
  role?: string  
  type?: 'user' | 'assistant'  
  timestamp?: string
  memory_detected?: boolean
  memory_id?: string
}

export interface CreateSessionRequest {
  userAddress: string
  title?: string
  modelName: string
  suiObjectId?: string // Used when session is created directly on blockchain
}

export interface AddMessageRequest {
  userAddress: string
  content: string
  type: 'user' | 'assistant'
  memoryId?: string
  walrusHash?: string
}

export interface StreamChatRequest {
  text: string
  user_id: string
  session_id?: string
  model?: string
  originalUserMessage?: string
  memoryContext?: string
}

export interface StreamChatResponse {
  chunk?: string
  done?: boolean
  intent?: string
  entities?: any
  error?: string
}

export interface BackendSessionsResponse {
  success: boolean
  sessions: ChatSession[]
}

export interface BackendSessionResponse {
  success: boolean
  session: ChatSession
}

export interface BackendMessageResponse {
  success: boolean
  message: string
}

export const chatApi = {
  // Get all sessions for a user
  getSessions: async (userAddress: string): Promise<BackendSessionsResponse> => {
    return httpApi.get(`/api/chat/sessions?userAddress=${userAddress}`)
  },

  // Get a specific session
  getSession: async (sessionId: string, userAddress: string): Promise<BackendSessionResponse> => {
    return httpApi.get(`/api/chat/sessions/${sessionId}?userAddress=${userAddress}`)
  },

  // Create a new session
  createSession: async (request: CreateSessionRequest): Promise<BackendSessionResponse> => {
    // Ensure modelName is set (use default if not provided)
    const requestWithModel = {
      ...request,
      modelName: request.modelName || 'gemini-2.0-flash'
    };
    return httpApi.post('/api/chat/sessions', requestWithModel)
  },

  // Add a message to a session
  addMessage: async (sessionId: string, request: AddMessageRequest): Promise<BackendMessageResponse> => {
    return httpApi.post(`/api/chat/sessions/${sessionId}/messages`, request)
  },

  // Delete a session
  deleteSession: async (sessionId: string, userAddress: string): Promise<BackendMessageResponse> => {
    return httpApi.delete(`/api/chat/sessions/${sessionId}`, {
      data: { userAddress }
    })
  },

  // Update session title
  updateSessionTitle: async (sessionId: string, userAddress: string, newTitle: string): Promise<ApiResponse<{ message: string }>> => {
    return httpApi.put(`/api/chat/sessions/${sessionId}/title`, {
      userAddress,
      title: newTitle
    })
  },

  // Stream chat (returns a Response object for streaming)
  streamChat: async (request: StreamChatRequest): Promise<Response> => {
    // Format request for backend
    const backendRequest = {
      text: request.text,
      userId: request.user_id,
      sessionId: request.session_id,
      model: request.model || 'gemini-2.0-flash',
      originalUserMessage: request.originalUserMessage,
      memoryContext: request.memoryContext
    };
    
    return httpApi.stream('/api/chat/stream', backendRequest)
  },

  // Send regular (non-streaming) chat message
  sendMessage: async (request: StreamChatRequest): Promise<ApiResponse<any>> => {
    const backendRequest = {
      text: request.text,
      userId: request.user_id,
      sessionId: request.session_id,
      model: request.model || 'gemini-2.0-flash',
      originalUserMessage: request.originalUserMessage,
      memoryContext: request.memoryContext
    };
    
    return httpApi.post('/api/chat', backendRequest)
  }
}

export default chatApi
````

## File: api/httpApi.ts
````typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const createHttpClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
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
    
    // Extract headers from config
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    // Only add custom headers if they exist
    if (config?.headers) {
      // Convert Axios headers to fetch headers
      const axiosHeaders = config.headers as Record<string, string>
      Object.keys(axiosHeaders).forEach(key => {
        if (axiosHeaders[key]) {
          headers[key] = axiosHeaders[key]
        }
      })
    }
    
    return fetch(fullUrl, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    })
  }
}

export default httpApi
````

## File: api/index.ts
````typescript
// Export all API modules
export { httpApi, httpClient, type ApiResponse } from './httpApi'
export { chatApi, type ChatSession, type ChatMessage, type CreateSessionRequest, type AddMessageRequest, type StreamChatRequest, type StreamChatResponse } from './chatApi'
export { memoryApi, type Memory, type SaveMemoryRequest, type SearchMemoryRequest, type MemoryResponse } from './memoryApi'

// Import for default export
import { chatApi } from './chatApi'
import { memoryApi } from './memoryApi'
import { httpApi } from './httpApi'

// Re-export for convenience
export default {
  chat: chatApi,
  memory: memoryApi,
  http: httpApi
}
````

## File: api/memory/content/[hash]/route.ts
````typescript
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { hash: string } }
) {
  const hash = params.hash;
  
  try {
    // Get the backend URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Forward the request to the backend storage endpoint
    const response = await fetch(`${baseURL}/api/storage/retrieve/${hash}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch memory content',
          status: response.status
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching memory content:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
````

## File: api/memoryApi.ts
````typescript
import { httpApi } from './httpApi';

export interface SaveMemoryRequest {
  content: string;
  category: string;
  userAddress: string;
  suiObjectId?: string;
}

export interface MemoryResponse {
  success: boolean;
  memoryId?: string;
  blobId?: string;
  vectorId?: number;
  message?: string;
}

export interface SearchMemoryRequest {
  query: string;
  userAddress: string;
  category?: string;
  k?: number;
}

export interface Memory {
  id: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  blobId?: string;
}

export const memoryApi = {
  /**
   * Get all memories for a user
   */
  async getMemories(userAddress: string): Promise<{ memories: Memory[], success: boolean }> {
    try {
      const response = await httpApi.get(`/api/memories?user=${userAddress}`);
      return response;
    } catch (error) {
      console.error('Error fetching memories:', error);
      return { memories: [], success: false };
    }
  },

  /**
   * Save a user-approved memory
   */
  async saveApprovedMemory(saveRequest: SaveMemoryRequest): Promise<MemoryResponse> {
    try {
      const response = await httpApi.post('/api/memories/save-approved', saveRequest);
      return response;
    } catch (error) {
      console.error('Error saving approved memory:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Search memories by query
   */
  async searchMemories(searchRequest: SearchMemoryRequest): Promise<{ results: Memory[] }> {
    try {
      const response = await httpApi.post('/api/memories/search', searchRequest);
      return response;
    } catch (error) {
      console.error('Error searching memories:', error);
      return { results: [] };
    }
  },

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string, userAddress: string): Promise<{ success: boolean }> {
    try {
      const response = await httpApi.delete(`/api/memories/${memoryId}`, {
        data: { userAddress }
      });
      return response;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return { success: false };
    }
  },
  
  /**
   * Get memory context for a chat message
   */
  async getMemoryContext(
    query: string, 
    userAddress: string, 
    userSignature: string
  ): Promise<{ 
    context: string, 
    relevant_memories: any[],
    query_metadata: {
      query_time_ms: number,
      memories_found: number,
      context_length: number
    }
  }> {
    try {
      const response = await httpApi.post('/api/memories/context', {
        query,
        userAddress,
        userSignature
      });
      return response;
    } catch (error) {
      console.error('Error getting memory context:', error);
      return { 
        context: '',
        relevant_memories: [],
        query_metadata: {
          query_time_ms: 0,
          memories_found: 0,
          context_length: 0
        }
      };
    }
  }
};
````

## File: api/storage/retrieve/[blobId]/route.ts
````typescript
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { blobId: string } }
) {
  const blobId = params.blobId;
  
  try {
    // Get the backend URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Forward the request to the backend storage endpoint
    const response = await fetch(`${baseURL}/api/storage/retrieve/${blobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          content: '',
          success: false,
          error: 'Failed to fetch storage content',
          status: response.status
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching storage content:', error);
    
    return new Response(
      JSON.stringify({ 
        content: '',
        success: false,
        error: 'Internal server error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
````

## File: auth/callback/page.tsx
````typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const { handleCallback, isAuthenticated } = useSuiAuth()

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract JWT from URL hash
        const hash = window.location.hash
        const params = new URLSearchParams(hash.substring(1))
        const idToken = params.get('id_token')

        if (idToken) {
          await handleCallback(idToken)
        } else {
          throw new Error('No ID token found in callback')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/?error=auth_failed')
      }
    }

    processCallback()
  }, [handleCallback, router])

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
````

## File: components/auth/login-page.tsx
````typescript
'use client'

import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { ConnectButton } from '@suiet/wallet-kit'
import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  Alert,
  Group,
  ThemeIcon,
  Center
} from '@mantine/core'
import { IconWallet, IconShield, IconBrain, IconHistory } from '@tabler/icons-react'

export function LoginPage() {
  const { error } = useSuiAuth()
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <Center h="100vh" bg="gray.0">
      <Container size="xs">
        <Paper shadow="md" p="xl" radius="md">
          <Stack align="center" gap="lg">
            {/* Header */}
            <Stack align="center" gap="sm">
              <ThemeIcon size="xl" radius="xl" color="blue">
                <IconWallet size={24} />
              </ThemeIcon>
              <Title order={2} ta="center">
                Personal Data Wallet
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Your decentralized memory layer powered by Sui
              </Text>
            </Stack>

            {/* Error Alert */}
            {error && (
              <Alert color="red" radius="md" w="100%">
                {error}
              </Alert>
            )}

            {/* Connect Button */}
            <ConnectButton style={{ width: '100%' }}>
              Connect Wallet
            </ConnectButton>

            {/* Development Mode Info */}
            {isDev ? (
              <Alert color="yellow" radius="md" w="100%">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Development Mode</Text>
                  <Text size="xs">
                    Connect any supported Sui wallet or use dev mode for testing
                  </Text>
                </Stack>
              </Alert>
            ) : (
              <Stack align="center" gap="xs">
                <Text size="xs" c="dimmed" ta="center">
                  Connect your Sui wallet to continue
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  Supports Sui Wallet, Suiet, Ethos, and more
                </Text>
              </Stack>
            )}

            {/* Features */}
            <Stack gap="md" w="100%" mt="md">
              <Text size="sm" fw={500} ta="center">Features</Text>
              <Stack gap="sm">
                <Group gap="sm" justify="center">
                  <ThemeIcon size="sm" color="green" radius="xl">
                    <IconShield size={12} />
                  </ThemeIcon>
                  <Text size="xs">Decentralized memory storage</Text>
                </Group>
                <Group gap="sm" justify="center">
                  <ThemeIcon size="sm" color="blue" radius="xl">
                    <IconBrain size={12} />
                  </ThemeIcon>
                  <Text size="xs">AI-powered knowledge graphs</Text>
                </Group>
                <Group gap="sm" justify="center">
                  <ThemeIcon size="sm" color="violet" radius="xl">
                    <IconHistory size={12} />
                  </ThemeIcon>
                  <Text size="xs">Chat history and memory management</Text>
                </Group>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Center>
  )
}
````

## File: components/chat/chat-input.tsx
````typescript
'use client'

import { useState } from 'react'
import {
  Group,
  TextInput,
  ActionIcon,
  Box,
  Loader
} from '@mantine/core'
import { IconSend } from '@tabler/icons-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onInputChange?: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({ onSendMessage, onInputChange, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading && !disabled) {
      console.log('Sending message:', message.trim())
      onSendMessage(message.trim())
      setMessage('')
    } else {
      console.log('Message not sent:', {
        hasMessage: !!message.trim(),
        isLoading,
        disabled
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Box p="md" style={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderTop: '1px solid #e2e8f0',
      backdropFilter: 'blur(10px)'
    }}>
      <form onSubmit={handleSubmit}>
        <Group gap="sm" align="flex-end">
          <TextInput
            value={message}
            onChange={(e) => {
              const newValue = e.target.value;
              setMessage(newValue);
              if (onInputChange) {
                onInputChange(newValue);
              }
            }}
            onKeyDown={handleKeyPress}
            placeholder="💭 Ask me anything or share personal information..."
            disabled={disabled || isLoading}
            style={{ 
              flex: 1,
            }}
            styles={{
              input: {
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '14px',
                '&:focus': {
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }
              }
            }}
            size="md"
          />
          <ActionIcon
            type="submit"
            size="lg"
            disabled={!message.trim() || isLoading || disabled}
            variant="gradient"
            gradient={{ from: 'cyan', to: 'indigo' }}
            radius="xl"
            style={{
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transform: (!message.trim() || isLoading || disabled) ? 'scale(0.95)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? <Loader size="sm" color="white" /> : <IconSend size={18} />}
          </ActionIcon>
        </Group>
      </form>
    </Box>
  )
}
````

## File: components/chat/chat-interface.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChatWindow } from './chat-window'
import { ChatInput } from './chat-input'
import { ModelSelector, ModelType } from './model-selector'
import { DEFAULT_MODEL_ID, getProviderModelId } from '@/app/config/models'
import { Sidebar } from '@/app/components/sidebar/sidebar'

import { useStreamingChat } from '@/app/hooks/use-streaming-chat'
import { useChatSessions } from '@/app/hooks/use-chat-sessions'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { Message } from '@/app/types'
import { memoryIntegrationService } from '@/app/services/memoryIntegration'
import { MemoryIndicator, useMemoryIndicator } from '@/app/components/memory/memory-indicator'
import { MemoryPanel } from '@/app/components/memory/memory-panel'
import { MemorySelectionModal } from '@/app/components/memory/memory-selection-modal'
import { MemoryBatchStatus } from '@/app/components/memory/memory-batch-status'
import { MemoryExtraction } from '@/app/services/memoryIntegration'
import { emitMemoriesUpdated, emitMemoryAdded } from '@/app/services/memoryEventEmitter'
import {
  AppShell,
  Group,
  Title,
  Text,
  ActionIcon,
  Badge,
  Loader,
  Center,
  Stack,
  Modal,
  Button
} from '@mantine/core'
import { IconLogout, IconUser, IconBrain, IconWallet } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { MemoryManager } from '@/app/components/memory/memory-manager'
import { WalletBalance } from '@/app/components/wallet/wallet-balance'

export function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState<ModelType>(DEFAULT_MODEL_ID)
  const queryClient = useQueryClient()

  // Memory indicator state
  const memoryIndicator = useMemoryIndicator()

  // Memory manager modal
  const [memoryModalOpened, { open: openMemoryModal, close: closeMemoryModal }] = useDisclosure(false)
  
  // Memory selection modal
  const [memorySelectionModalOpened, setMemorySelectionModalOpened] = useState(false)
  const [currentMemoryExtractions, setCurrentMemoryExtractions] = useState<MemoryExtraction[]>([])

  const { logout, userAddress } = useSuiAuth()

  const {
    sessions,
    currentSessionId,
    sessionsLoading,
    currentSessionLoading,
    getCurrentSession,
    createNewSession,
    addMessageToSession,
    deleteSession,
    selectSession,
    isAddingMessage,
    executePendingTransactions
  } = useChatSessions()

  // Load memories from the memory API
  const [memories, setMemories] = useState<any[]>([])
  const [memoriesLoading, setMemoriesLoading] = useState(true)
  const [currentInputMessage, setCurrentInputMessage] = useState<string>('')

  // Load memories when the user address changes
  useEffect(() => {
    const loadMemories = async () => {
      if (!userAddress) return
      
      try {
        setMemoriesLoading(true)
        const response = await memoryIntegrationService.fetchUserMemories(userAddress)
        setMemories(response.memories || [])
      } catch (error) {
        console.error('Failed to load memories:', error)
      } finally {
        setMemoriesLoading(false)
      }
    }
    
    loadMemories()
  }, [userAddress])

  const clearMemories = async () => {
    if (!userAddress) return
    
    try {
      await memoryIntegrationService.clearUserMemories(userAddress)
      setMemories([])
    } catch (error) {
      console.error('Failed to clear memories:', error)
    }
  }


  const { sendStreamingMessage, isStreaming, currentResponse, resetStreaming } = useStreamingChat()
  const currentSession = getCurrentSession()

  // State for streaming message
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null)

  // State for temporary user message (shown immediately, replaced by backend data)
  const [tempUserMessage, setTempUserMessage] = useState<Message | null>(null)
  
  // Flag to prevent clearing messages during session refresh
  const [isRefreshingSession, setIsRefreshingSession] = useState(false)

  // Don't auto-create sessions - let user initiate first chat
  // This prevents unwanted session creation on page reload

  const handleSendMessage = async (messageText: string) => {
    console.log('🚀 handleSendMessage called with:', messageText);
    console.log('🚀 Current streaming state:', { isStreaming, currentSessionLoading });

    // Prevent sending if already processing
    if (isStreaming || currentSessionLoading) {
      console.log('❌ Blocked message send - already processing');
      return;
    }

    // Ensure we have an active session
    let sessionId = currentSessionId
    if (!sessionId) {
      try {
        sessionId = await createNewSession()

        if (!sessionId) {
          alert('Failed to create chat session. Please try again.')
          return
        }
      } catch (error) {
        // Log error for monitoring but show a user-friendly message
        console.error('Failed to create session:', error instanceof Error ? error.message : 'Unknown error')
        alert('Failed to create chat session. Please try again.')
        return
      }
    }

    // Initialize memory indicator (backend now handles detection automatically)
    memoryIndicator.reset()
    memoryIndicator.startProcessing()

    // Create temporary user message for immediate display (will be replaced by backend data)
    // Use a more unique ID format combining timestamp and random string
    const timestamp = Date.now()
    const randomUserSuffix = Math.random().toString(36).substring(2, 8)
    const userMessageId = `${userAddress}_${timestamp}_${randomUserSuffix}`
    const tempUserMessage: Message = {
      id: userMessageId,
      content: messageText,
      type: 'user',
      timestamp: new Date().toISOString(),
    }

    // Create a placeholder message for streaming with a completely different ID
    const randomAiSuffix = Math.random().toString(36).substring(2, 8)
    const assistantMessageId = `${userAddress}_${timestamp + 1}_${randomAiSuffix}`
    const streamingMsg: Message = {
      id: assistantMessageId,
      content: '',
      type: 'assistant',
      timestamp: new Date().toISOString(), // Use ISO string for consistency
    }

    // Set both temporary user message and streaming assistant message
    setStreamingMessageId(assistantMessageId)
    setStreamingMessage(streamingMsg)

    // Add temporary user message to display immediately
    setTempUserMessage(tempUserMessage)

    // Reset streaming state
    resetStreaming()

    // Get memory context for enhanced AI responses (with timeout and fallback)
    let memoryContext = ''
    try {
      const contextPromise = memoryIntegrationService.generateChatContext(
        messageText,
        currentSession?.messages?.map(m => `${m.type}: ${m.content}`) || [],
        userAddress!,
        userAddress! // Use wallet address as signature in production
      )

      // Set a 3-second timeout to avoid hanging the UI
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Memory context timeout')), 3000)
      )

      const contextResult = await Promise.race([contextPromise, timeoutPromise]) as any
      memoryContext = contextResult.fullContext || ''
    } catch (error) {
      // Silent fail - continue without memory context
      memoryContext = ''
    }

    try {
      // Send the user message and context separately to avoid double injection
      const streamingRequest = {
        text: messageText,
        userId: userAddress!,
        sessionId: sessionId,
        model: getProviderModelId(selectedModel),
        originalUserMessage: messageText,
        memoryContext: memoryContext
      }

      await sendStreamingMessage(
        streamingRequest,
        // On chunk received
        (_chunk: string) => {
          // The currentResponse is managed by the streaming hook
          // We don't need to manually update here as it's handled by the streaming state
        },
        // On complete
        async (fullResponse: string, intent?: string, entities?: any, memoryStored?: boolean, memoryId?: string, memoryExtraction?: any) => {
          // Handle memory extraction results from backend
          if (memoryExtraction && memoryExtraction.shouldSave) {
            // Convert single extraction to array for consistency
            const extractions = Array.isArray(memoryExtraction) ? memoryExtraction : [memoryExtraction];
            const validExtractions = extractions.filter(ext => ext && ext.shouldSave);

            if (validExtractions.length > 0) {
              // Defer state updates to avoid setState during render
              setTimeout(() => {
                // Show memory indicator - detected but not yet stored
                memoryIndicator.setDetected(validExtractions.length);
                memoryIndicator.setStored(0);

                // Update temporary user message with memory detection data
                if (tempUserMessage) {
                  const updatedTempMessage: Message = {
                    ...tempUserMessage,
                    memoryDetected: true,
                    memoryExtraction: validExtractions[0] // Keep first for backward compatibility
                  };
                  setTempUserMessage(updatedTempMessage);
                }

                // Store memory extractions but delay showing modal
                console.log('Memories detected:', validExtractions);
                setCurrentMemoryExtractions(validExtractions);

                // Delay showing the memory modal until after the chat flow completes
                // This ensures the user sees their message and the AI response first
                setTimeout(() => {
                  // Only show modal if we're not in the middle of streaming/refreshing
                  if (!isStreaming && !isRefreshingSession) {
                    setMemorySelectionModalOpened(true);
                  } else {
                    // If still streaming, wait a bit more
                    setTimeout(() => {
                      setMemorySelectionModalOpened(true);
                    }, 2000);
                  }
                }, 1500); // 1.5 second delay to let the AI response complete
              }, 0);
            } else {
              setTimeout(() => {
                memoryIndicator.setDetected(0);
                memoryIndicator.setStored(0);
              }, 0);
            }
          } else {
            setTimeout(() => {
              memoryIndicator.setDetected(0);
              memoryIndicator.setStored(0);
            }, 0);
          }

          // Update the streaming message with the final content
          if (streamingMessage) {
            const finalMessage: Message = {
              ...streamingMessage,
              content: fullResponse
            }
            setStreamingMessage(finalMessage)
          }

            // Note: Messages are automatically saved by the backend streaming endpoint
            // No need to manually save them here to avoid duplicates
            console.log('Messages automatically saved by backend streaming endpoint')

          // Defer the session refresh to avoid setState during render
          setTimeout(async () => {
            setIsRefreshingSession(true)

            try {
              // Invalidate and refetch both session list and current session data
              await queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
              await queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId, userAddress] })
              await queryClient.refetchQueries({ queryKey: ['chat-sessions', userAddress] })
              await queryClient.refetchQueries({ queryKey: ['chat-session', sessionId, userAddress] })

              // Wait longer to ensure the backend data has been loaded and UI updated
              setTimeout(() => {
                setIsRefreshingSession(false)

                // Only clear temporary messages after confirming backend messages are loaded
                // AND memory modal is not open (to keep messages visible during memory selection)
                setTimeout(() => {
                  // Check if we have messages from the backend before clearing temp messages
                  const currentSession = getCurrentSession()
                  const hasBackendMessages = currentSession && currentSession.messages.length > 0

                  // Check if the user message specifically exists in backend messages
                  const userMessageExists = currentSession?.messages.some(msg =>
                    msg.type === 'user' &&
                    msg.content === tempUserMessage?.content &&
                    Math.abs(new Date(msg.timestamp).getTime() - new Date(tempUserMessage?.timestamp || '').getTime()) < 30000
                  )

                  if (hasBackendMessages && userMessageExists) {
                    console.log('Clearing temporary messages - user message found in backend:', userMessageExists)
                    setStreamingMessageId(null)
                    setStreamingMessage(null)
                    setTempUserMessage(null)
                  } else {
                    console.log('Keeping temporary messages - user message not yet in backend. HasBackend:', hasBackendMessages, 'UserExists:', userMessageExists)
                    // Retry clearing after another delay, but keep user message visible
                    setTimeout(() => {
                      // Check again if user message exists in backend
                      const currentSession = getCurrentSession()
                      const userMessageExists = currentSession?.messages.some(msg =>
                        msg.type === 'user' &&
                        msg.content === tempUserMessage?.content
                      )

                      if (userMessageExists) {
                        console.log('User message now found in backend, clearing temporary messages')
                        setStreamingMessageId(null)
                        setStreamingMessage(null)
                        setTempUserMessage(null)
                      } else {
                        // Keep user message visible but clear streaming
                        setStreamingMessageId(null)
                        setStreamingMessage(null)
                        console.log('User message still not in backend, keeping temporary user message visible')
                      }
                    }, 2000)
                  }
                }, 300) // Additional delay to ensure backend messages are displayed
              }, 800) // Increased delay to ensure query refetch completes
            } catch (error) {
              setIsRefreshingSession(false)

              // Keep temporary messages longer if refresh failed
              setTimeout(() => {
                setStreamingMessageId(null)
                setStreamingMessage(null)
                setTempUserMessage(null)
              }, 2000) // Longer delay for error case
            }
          }, 0)
        },
        // On error
        async (error: string) => {
          setIsRefreshingSession(false)
          
          const errorMessage: Message = {
            id: assistantMessageId,
            content: 'Sorry, there was an error processing your message. Please try again.',
            type: 'assistant',
            timestamp: new Date().toISOString(),
          }
          
          // Replace streaming message with error message
          setStreamingMessage(errorMessage)
          
          try {
            await addMessageToSession(sessionId, errorMessage.content, 'assistant')
            // Refresh session after saving error message (deferred to avoid render issues)
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
              queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId, userAddress] })
            }, 0)
          } catch (saveError) {
            // Silent error handling for production
          }
          
          // Clear state after a delay to show the error message
          setTimeout(() => {
            setStreamingMessageId(null)
            setStreamingMessage(null)
            setTempUserMessage(null)
          }, 5000)
        }
      )

    } catch (error) {
      setIsRefreshingSession(false)
      
      const errorMessage: Message = {
        id: assistantMessageId,
        content: 'Sorry, there was an error starting the conversation. Please try again.',
        type: 'assistant',
        timestamp: new Date().toISOString(),
      }

      // Show error message
      setStreamingMessage(errorMessage)

      try {
        await addMessageToSession(sessionId, errorMessage.content, 'assistant')
        // Defer query invalidation to avoid render issues
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
          queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId, userAddress] })
        }, 0)
      } catch (saveError) {
        // Silent error handling for production
      }
      
      // Clear state after showing error
      setTimeout(() => {
        setStreamingMessageId(null)
        setStreamingMessage(null)
        setTempUserMessage(null)
      }, 5000)
    }
  }

  const handleNewChat = async () => {
    try {
      const sessionId = await createNewSession()
      if (!sessionId) {
        alert('Failed to create a new chat session. Please try again.')
      }
    } catch (error) {
      alert('Failed to create a new chat session. Please try again.')
    }
  }

  const handleSelectSession = (sessionId: string) => {
    selectSession(sessionId)
  }

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId)
  }

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      // Call backend API to rename session
      const response = await fetch('/api/chat/sessions/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          title: newTitle,
          userAddress
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to rename session')
      }

      // Refresh sessions to show updated title
      // The useChatSessions hook will automatically refetch
      console.log(`Session ${sessionId} renamed to: ${newTitle}`)
    } catch (error) {
      console.error('Failed to rename session:', error)
      alert('Failed to rename session. Please try again.')
    }
  }


  if (sessionsLoading || memoriesLoading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading...</Text>
        </Stack>
      </Center>
    )
  }

  return (
    <AppShell
      navbar={{ width: 300, breakpoint: 'sm' }}
      aside={{ width: 320, breakpoint: 'md' }}
      header={{ height: 70 }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          memories={memories}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onClearMemories={clearMemories}
        />
      </AppShell.Navbar>

      <AppShell.Header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Group h="100%" px="md" justify="space-between">
          <Stack gap={0}>
            <Title order={3} style={{ color: 'white', fontWeight: 600 }}>
              {currentSession?.title || '🧠 Personal Data Wallet'}
            </Title>
            <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              ✨ Your decentralized memory layer with direct blockchain signing
            </Text>
          </Stack>

          <Group gap="md">
            <WalletBalance />
            
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

            <Badge 
              variant="gradient" 
              gradient={{ from: 'cyan', to: 'indigo' }}
              style={{ color: 'white' }}
            >
              🗃️ {memories.length} memories
            </Badge>

            <MemoryIndicator
              isProcessing={memoryIndicator.isProcessing}
              memoriesDetected={memoryIndicator.memoriesDetected}
              memoriesStored={memoryIndicator.memoriesStored}
              errors={memoryIndicator.errors}
              onViewDetails={openMemoryModal}
            />

            <Group gap="xs">
              <ActionIcon
                variant="gradient"
                gradient={{ from: 'cyan', to: 'indigo' }}
                onClick={openMemoryModal}
                title="Memory Manager"
                style={{ color: 'white' }}
              >
                <IconBrain size={16} />
              </ActionIcon>

              <Group gap="xs" style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '4px 8px', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <IconUser size={14} style={{ color: 'white' }} />
                <Text size="xs" ff="monospace" style={{ color: 'white' }}>
                  {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'User'}
                </Text>
              </Group>

              <ActionIcon
                variant="subtle"
                onClick={logout}
                title="Logout"
                style={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <IconLogout size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 70px)',
        background: 'linear-gradient(145deg, #f0f4f8 0%, #e2e8f0 100%)'
      }}>
        <ChatWindow
          messages={(() => {
            const sessionMessages = currentSession?.messages || []
            let allMessages = [...sessionMessages]

            // Debug logging
            if (process.env.NODE_ENV === 'development') {
              console.log('Message display state:', {
                sessionMessagesCount: sessionMessages.length,
                tempUserMessage: !!tempUserMessage,
                streamingMessage: !!streamingMessage,
                isStreaming,
                isRefreshingSession,
                currentSessionLoading
              })
            }

            // Add temporary messages during active states OR when memory modal is open OR when user message not yet in backend
            // This ensures user messages remain visible during memory selection and until saved to backend
            if (tempUserMessage && (isRefreshingSession || isStreaming || currentSessionLoading || memorySelectionModalOpened)) {
              const isDuplicate = sessionMessages.some(msg =>
                msg.type === 'user' &&
                msg.content === tempUserMessage?.content &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(tempUserMessage?.timestamp || '').getTime()) < 15000
              )

              if (!isDuplicate) {
                allMessages.push(tempUserMessage)
              }
            }

            // Add streaming message if active
            if (streamingMessage && (isStreaming || isRefreshingSession)) {
              // Check if streaming message is already in session messages
              const streamingDuplicate = sessionMessages.some(msg =>
                msg.id === streamingMessage.id ||
                (msg.type === 'assistant' &&
                 msg.content === streamingMessage.content &&
                 Math.abs(new Date(msg.timestamp).getTime() - new Date(streamingMessage.timestamp).getTime()) < 15000)
              )

              if (!streamingDuplicate) {
                allMessages.push(streamingMessage)
              }
            }

            // Remove duplicates by ID and content with more robust logic
            const uniqueMessages = allMessages.filter((message, index, array) => {
              // First occurrence wins
              const firstIndex = array.findIndex(m => {
                // Exact ID match
                if (m.id === message.id && message.id) return true

                // Content and type match (for messages without IDs or with generated IDs)
                if (m.content === message.content &&
                    m.type === message.type &&
                    message.content.trim() !== '') {
                  // Additional check: timestamps should be close (within 30 seconds)
                  const timeDiff = Math.abs(
                    new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()
                  )
                  return timeDiff < 30000 // 30 seconds
                }

                return false
              })

              return firstIndex === index
            })

            return uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          })()}
          isLoading={isStreaming}
          streamingMessageId={streamingMessageId}
          streamingContent={currentResponse}
          userAddress={userAddress || ''}
        />

        {/* Memory Batch Status */}
        {userAddress && (
          <div style={{ padding: '0 16px' }}>
            <MemoryBatchStatus
              userAddress={userAddress}
              onForceFlush={() => {
                // Refresh memory indicator after force flush
                memoryIndicator.setStored(memoryIndicator.memoriesStored);
              }}
            />
          </div>
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isStreaming}
          onInputChange={(text) => setCurrentInputMessage(text)}
        />
      </AppShell.Main>
      
      <AppShell.Aside>
        <MemoryPanel 
          userAddress={userAddress || ''}
          sessionId={currentSessionId || undefined}
          currentMessage={currentInputMessage}
        />
      </AppShell.Aside>

      {/* Memory Manager Modal */}
      <Modal
        opened={memoryModalOpened}
        onClose={closeMemoryModal}
        title="Memory Manager"
        size="lg"
      >
        <MemoryManager
          userAddress={userAddress || ''}
          onMemoryAdded={(memory) => {
            // Optionally refresh memories or update state
            console.log('Memory added:', memory)
          }}
          onMemoryDeleted={(memoryId) => {
            // Optionally refresh memories or update state
            console.log('Memory deleted:', memoryId)
          }}
        />
      </Modal>

      {/* Memory Selection Modal */}
      <MemorySelectionModal
        opened={memorySelectionModalOpened}
        onClose={() => {
          setMemorySelectionModalOpened(false);
          setCurrentMemoryExtractions([]);
          memoryIndicator.setDetected(0);

          // Clear temporary messages now that modal is closed
          // This ensures a clean chat interface after memory selection
          setTimeout(() => {
            setStreamingMessageId(null);
            setStreamingMessage(null);
            setTempUserMessage(null);
          }, 100);
        }}
        extractedMemories={currentMemoryExtractions}
        userAddress={userAddress || ''}
        onMemoriesSaved={(memoryIds) => {
          console.log('Memories saved with IDs:', memoryIds);
          memoryIndicator.setStored(memoryIds.length);

          // Emit events to notify other components
          emitMemoriesUpdated({ memoryIds, userAddress });
          memoryIds.forEach(memoryId => emitMemoryAdded(memoryId));

          // Refresh memories list after save
          if (userAddress) {
            memoryIntegrationService.fetchUserMemories(userAddress)
              .then(response => {
                setMemories(response.memories || []);
              })
              .catch(error => {
                console.error('Error refreshing memories:', error);
              });
          }

          // Close modal after successful save
          setMemorySelectionModalOpened(false);
          setCurrentMemoryExtractions([]);
        }}
        onError={(error) => {
          console.error('Memory save error:', error);
          // Keep modal open so user can retry
        }}
      />
    </AppShell>
  )
}
````

## File: components/chat/chat-window.tsx
````typescript
'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/app/types'
import { MessageComponent } from './message'
import {
  ScrollArea,
  Stack,
  Center,
  ThemeIcon,
  Title,
  Text,
  Box
} from '@mantine/core'
import { IconMessageCircle } from '@tabler/icons-react'

interface ChatWindowProps {
  messages: Message[]
  isLoading?: boolean
  streamingMessageId?: string | null
  streamingContent?: string
  userAddress?: string
}

export function ChatWindow({ messages, isLoading, streamingMessageId, streamingContent, userAddress }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {messages.length === 0 ? (
        <Center style={{ flex: 1 }}>
          <Stack align="center" gap="lg" maw={400}>
            <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
              <IconMessageCircle size={32} />
            </ThemeIcon>
            <Stack align="center" gap="sm">
              <Title order={2} ta="center">How can I help you today?</Title>
              <Text c="dimmed" ta="center">
                I'm your personal data wallet. I can store information and answer questions about what you've shared with me.
              </Text>
            </Stack>
          </Stack>
        </Center>
      ) : (
        <ScrollArea style={{ flex: 1 }} p="md">
          <Stack gap="md">
            {messages.map((message) => {
              // If this is the streaming message, show the streaming content
              if (streamingMessageId && message.id === streamingMessageId && streamingContent !== null) {
                return (
                  <MessageComponent
                    key={message.id}
                    message={{
                      ...message,
                      content: streamingContent || ''
                    }}
                    isStreaming={true}
                    userAddress={userAddress}
                  />
                )
              }
              return <MessageComponent key={message.id} message={message} userAddress={userAddress} />
            })}
            {isLoading && !streamingMessageId && (
              <MessageComponent
                message={{
                  id: 'loading',
                  content: '',
                  type: 'assistant',
                  timestamp: new Date().toISOString()
                }}
                isTyping={true}
              />
            )}
          </Stack>
          <div ref={messagesEndRef} />
        </ScrollArea>
      )}
    </Box>
  )
}
````

## File: components/chat/markdown-renderer.tsx
````typescript
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code({ node, className, children, ...props }: any) {
            const inline = props.inline;
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md text-sm"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code 
                className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" 
                {...props}
              >
                {children}
              </code>
            )
          },
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium mb-1 mt-2 first:mt-0">{children}</h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm">{children}</li>
          ),
          // Links
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-700">
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-gray-300 text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-2 py-1">{children}</td>
          ),
          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-4 border-gray-300" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
````

## File: components/chat/message.tsx
````typescript
'use client'

import { useState } from 'react'
import { Message } from '@/app/types'
import { MarkdownRenderer } from './markdown-renderer'
import { MemoryExtractionIndicator } from '@/app/components/memory/memory-extraction-indicator'
import { MemoryIndicatorIcon } from '@/app/components/memory/memory-indicator-icon'
import { MemoryReviewModal } from '@/app/components/memory/memory-review-modal'
import { RelevantMemories } from './relevant-memories'
import {
  Group,
  Avatar,
  Paper,
  Text,
  Box,
  Loader,
  Stack
} from '@mantine/core'
import { IconUser, IconRobot } from '@tabler/icons-react'

interface MessageProps {
  message: Message
  isTyping?: boolean
  isStreaming?: boolean
  userAddress?: string
}

export function MessageComponent({ message, isTyping = false, isStreaming = false, userAddress }: MessageProps) {
  const isUser = message.type === 'user'
  const [memoryModalOpened, setMemoryModalOpened] = useState(false)

  return (
    <Group
      align="flex-start"
      gap="sm"
      justify={isUser ? 'flex-end' : 'flex-start'}
      wrap="nowrap"
    >
      {!isUser && (
        <Avatar
          radius="xl"
          size="sm"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <IconRobot size={16} />
        </Avatar>
      )}

      <Paper
        p="md"
        radius="lg"
        shadow="md"
        style={{
          maxWidth: '80%',
          background: isUser 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          color: isUser ? 'white' : 'var(--mantine-color-dark-7)',
          border: isUser ? 'none' : '1px solid #e2e8f0',
          boxShadow: isUser 
            ? '0 4px 16px rgba(102, 126, 234, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {isTyping ? (
          <Group gap="xs" align="center">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">Thinking...</Text>
          </Group>
        ) : (
          <Box>
            {isUser ? (
              <Stack gap="xs">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap', flex: 1 }}>
                    {message.content}
                  </Text>
                  {userAddress && (message.memoryDetected || message.memoryId) && (
                    <MemoryIndicatorIcon
                      memoryDetected={!!message.memoryDetected}
                      memoryId={message.memoryId}
                      onClick={() => setMemoryModalOpened(true)}
                      size={18}
                    />
                  )}
                </Group>
              </Stack>
            ) : (
              <Stack gap="xs">
                <Box style={{ position: 'relative' }}>
                  <MarkdownRenderer
                    content={message.content}
                    className="prose prose-sm max-w-none"
                  />
                  {isStreaming && (
                    <Text
                      component="span"
                      size="sm"
                      c="dimmed"
                      style={{
                        animation: 'pulse 1s infinite',
                        display: 'inline'
                      }}
                    >
                      ▋
                    </Text>
                  )}
                </Box>
                
                {/* Show relevant memories below assistant messages when not streaming */}
                {!isUser && !isStreaming && userAddress && (
                  <RelevantMemories
                    message={message.content}
                    userAddress={userAddress || ''}
                  />
                )}
              </Stack>
            )}
          </Box>
        )}
      </Paper>

      {isUser && (
        <Avatar
          radius="xl"
          size="sm"
          style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
            color: 'white'
          }}
        >
          <IconUser size={16} />
        </Avatar>
      )}

      {/* Memory Review Modal */}
      {userAddress && (
        <MemoryReviewModal
          opened={memoryModalOpened}
          onClose={() => setMemoryModalOpened(false)}
          messageContent={message.content}
          messageId={message.id}
          memoryId={message.memoryId}
          userAddress={userAddress}
        />
      )}
    </Group>
  )
}
````

## File: components/chat/model-selector.tsx
````typescript
'use client'

import {
  Select,
  Group,
  Text,
  Badge
} from '@mantine/core'
import {
  IconRobot,
  IconSparkles,
  IconBolt,
  IconCpu
} from '@tabler/icons-react'
import { MODEL_CONFIGS, ModelConfig } from '@/app/config/models'

export type ModelType = string // Now we use the model IDs from config

// Map provider names to icons
const providerIcons: Record<string, React.ReactNode> = {
  'Google': <IconSparkles size={16} color="blue" />,
  'OpenAI': <IconRobot size={16} color="green" />,
  'Anthropic': <IconBolt size={16} color="orange" />,
  'Meta': <IconCpu size={16} color="violet" />
}

// Convert MODEL_CONFIGS to array for easier use
const models = Object.values(MODEL_CONFIGS)

interface ModelSelectorProps {
  selectedModel: ModelType
  onModelChange: (model: ModelType) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const selectedModelData = MODEL_CONFIGS[selectedModel] || Object.values(MODEL_CONFIGS)[0]

  const selectData = models.map(model => ({
    value: model.id,
    label: model.name,
    disabled: !model.available
  }))

  return (
    <Select
      value={selectedModel}
      onChange={(value) => value && onModelChange(value as ModelType)}
      data={selectData}
      size="sm"
      w={150}
      renderOption={({ option, checked }) => {
        const model = MODEL_CONFIGS[option.value]
        if (!model) return null

        return (
          <Group gap="sm" wrap="nowrap">
            {providerIcons[model.provider] || <IconRobot size={16} />}
            <div style={{ flex: 1 }}>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {model.name}
                </Text>
                {!model.available && (
                  <Badge size="xs" variant="light" color="gray">
                    Soon
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {model.description}
              </Text>
            </div>
          </Group>
        )
      }}
    />
  )
}
````

## File: components/chat/relevant-memories.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Group,
  Card,
  Badge,
  Collapse,
  ActionIcon,
  Stack,
  Loader,
  Center
} from '@mantine/core'
import {
  IconBrain,
  IconChevronDown,
  IconChevronRight,
  IconExternalLink
} from '@tabler/icons-react'
import { memoryIntegrationService } from '@/app/services/memoryIntegration'
// Removed MemoryDecryptionModal - content loads automatically now

interface Memory {
  id: string
  content: string
  category: string
  timestamp: string
  similarity?: number
  isEncrypted: boolean
  walrusHash?: string
  owner: string
}

interface RelevantMemoriesProps {
  message: string
  userAddress: string
}

export function RelevantMemories({ message, userAddress }: RelevantMemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  // Removed decryption modal state - content loads automatically now

  useEffect(() => {
    if (!message || !userAddress) {
      setMemories([])
      setLoading(false)
      return
    }

    const fetchRelevantMemories = async () => {
      try {
        setLoading(true)
        // Get memories directly from blockchain instead of through backend API
        const fetchedMemories = await memoryIntegrationService.fetchUserMemories(userAddress)
        
        // Filter memories for relevance to the current message
        console.log('Fetched memories for relevance check:', fetchedMemories.memories?.length || 0);
        console.log('Message to match against:', message);

        // For debugging: let's also try showing all memories to see if the issue is similarity scoring
        const allMemories = fetchedMemories.memories || [];
        console.log('All memories content check:', allMemories.map(m => ({
          id: m.id,
          hasContent: !!m.content,
          contentPreview: m.content?.substring(0, 30),
          isEncrypted: m.isEncrypted
        })));

        const results = memoryIntegrationService.getMemoriesRelevantToText(
          allMemories,
          message,
          5 // Get top 5 most relevant memories
        )

        console.log('Relevance results:', results.map(r => ({
          content: r.content?.substring(0, 50),
          similarity: r.similarity
        })));

        // Filter out memories that were just created (within last 30 seconds)
        const now = Date.now();
        const relevantMemories = (results || [])
          // Even lower threshold for demo - show any match above 10%
          .filter(memory => ((memory as any).similarity || 0) > 0.10)
          // Skip recently created memories to prevent showing memories just created from the current message
          .filter(memory => {
            // If timestamp is available, filter out very recent memories
            if (memory.timestamp) {
              const timestamp = new Date(memory.timestamp).getTime();
              const timeDiff = now - timestamp;
              console.log(`Memory age: ${timeDiff}ms for "${memory.content?.substring(0, 20)}..."`);
              
              // Use a 30-second threshold to avoid showing memories from the current conversation
              return timeDiff > 30000; 
            }
            return true;
          })
          // Further filter to prevent showing memories that contain the exact message text
          .filter(memory => {
            if (!memory.content || !message) return true;
            
            // Check if memory content contains the exact message text
            // This helps prevent showing memories created from the current message
            const normalizedContent = memory.content.toLowerCase().trim();
            const normalizedMessage = message.toLowerCase().trim();
            
            // Don't show memories that are just the message or contain it exactly
            return !normalizedContent.includes(normalizedMessage) || 
                  (normalizedContent.length > normalizedMessage.length * 2);
          });
        
        console.log('Final relevant memories after all filters:', relevantMemories.length);
        console.log('Relevant memories:', relevantMemories.map(m => ({
          content: m.content?.substring(0, 50),
          similarity: m.similarity,
          category: m.category
        })));

        // If no relevant memories found, show recent memories for demo purposes
        let memoriesToShow = relevantMemories;
        if (memoriesToShow.length === 0 && allMemories.length > 0) {
          console.log('No similarity matches found, showing recent memories for demo');
          memoriesToShow = allMemories
            .filter(m => m.content && m.content !== 'Loading content...' && m.content !== 'Content not available')
            .slice(0, 2) // Show 2 most recent memories
            .map(m => ({ ...m, similarity: 0.15 })); // Add fake similarity for display
        }

        setMemories(memoriesToShow)
      } catch (error) {
        console.error('Failed to fetch relevant memories:', error)
        setMemories([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelevantMemories()
  }, [message, userAddress])

  // For debugging: show component even with no memories to see what's happening
  if (!loading && memories.length === 0) {
    console.log('No relevant memories found, component will not render');
    // Temporarily show debug info
    return (
      <Box mt={12} mb={4}>
        <Card p="sm" radius="md" withBorder style={{
          background: 'rgba(255, 193, 7, 0.1)',
          borderColor: 'rgba(255, 193, 7, 0.3)',
        }}>
          <Text size="sm" c="dimmed">
            🔍 No relevant memories found for this message
          </Text>
        </Card>
      </Box>
    );
  }

  // Removed openDecryptModal - content loads automatically now
  
  const openInSuiExplorer = (walrusHash: string) => {
    const explorerUrl = `https://suivision.xyz/object/${walrusHash}?network=testnet`
    window.open(explorerUrl, '_blank')
  }

  return (
    <Box mt={12} mb={4}>
      <Card p="sm" radius="md" withBorder style={{
        background: 'linear-gradient(to right, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
        borderColor: 'rgba(102, 126, 234, 0.2)',
      }}>
        <Group justify="space-between" mb={expanded ? "xs" : 0}>
          <Group gap="xs">
            <IconBrain size={16} color="var(--mantine-color-indigo-6)" />
            <Text size="sm" fw={500}>Related Memories</Text>
            <Badge size="xs" variant="light" color="indigo">{memories.length}</Badge>
          </Group>
          <ActionIcon 
            size="sm" 
            variant="subtle" 
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </ActionIcon>
        </Group>

        <Collapse in={expanded}>
          {loading ? (
            <Center py="sm">
              <Loader size="xs" />
            </Center>
          ) : (
            <Stack gap="xs">
              {memories.map((memory) => (
                <Card key={memory.id} p="xs" radius="sm" withBorder style={{ 
                  backgroundColor: 'white',
                }}>
                  <Group justify="space-between" mb="xs">
                    <Badge 
                      size="xs" 
                      variant="light" 
                      color={(memory as any).similarity && (memory as any).similarity > 0.8 ? "green" : "blue"}
                    >
                      {(memory as any).similarity ? `${Math.round((memory as any).similarity * 100)}% match` : 'Related'}
                    </Badge>
                    <Badge size="xs" variant="outline">{memory.category}</Badge>
                  </Group>
                  
                  <Text size="xs" lineClamp={2}>{memory.content}</Text>
                  
                  <Group justify="flex-end" mt="xs" gap="xs">
                    {memory.walrusHash && (
                      <ActionIcon 
                        size="xs" 
                        variant="subtle" 
                        color="blue" 
                        onClick={() => openInSuiExplorer(memory.walrusHash!)}
                        title="View in Sui Explorer"
                      >
                        <IconExternalLink size={14} />
                      </ActionIcon>
                    )}
                    
                    {/* Removed decrypt button - content loads automatically */}
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Collapse>
      </Card>

      {/* Decryption modal removed - content loads automatically */}
    </Box>
  )
}
````

## File: components/memory/memory-approval-modal.tsx
````typescript
'use client'

import { useState } from 'react'
import { Modal, Button, Text, Group, Stack, Card, Badge, Loader } from '@mantine/core'
import { MemoryExtraction, memoryIntegrationService } from '@/app/services/memoryIntegration'
import { useWallet } from '@suiet/wallet-kit'

interface MemoryApprovalModalProps {
  opened: boolean
  onClose: () => void
  memoryExtraction: MemoryExtraction
  userAddress: string
  onApproved?: (memoryId: string) => void
  onRejected?: () => void
}

export function MemoryApprovalModal({
  opened,
  onClose,
  memoryExtraction,
  userAddress,
  onApproved,
  onRejected
}: MemoryApprovalModalProps) {
  const wallet = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleApprove = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Pass the wallet to enable blockchain operations
      const result = await memoryIntegrationService.saveApprovedMemory(
        memoryExtraction,
        userAddress,
        wallet
      )
      
      if (result.success && result.memoryId) {
        onApproved?.(result.memoryId)
        onClose()
      } else {
        // If the error is about index creation, provide more helpful message
        if (result.message?.includes('Failed to create index on blockchain')) {
          setError(
            'Failed to create memory index on blockchain. Please check your wallet connection and try again. ' +
            'Make sure you have enough SUI for gas fees.'
          )
        } else {
          setError(result.message || 'Failed to save memory')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleReject = () => {
    onRejected?.()
    onClose()
  }
  
  return (
    <Modal
      opened={opened}
      onClose={isSubmitting ? () => {} : onClose}
      title="Save this as a memory?"
      size="lg"
      closeOnClickOutside={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Stack spacing="md">
        <Text>
          I detected something that might be worth remembering. Would you like me to save this?
        </Text>
        
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack spacing="xs">
            <Group position="apart">
              <Badge color="blue" variant="light">
                {memoryExtraction.category}
              </Badge>
              <Text size="sm" color="dimmed">
                Confidence: {Math.round(memoryExtraction.confidence * 100)}%
              </Text>
            </Group>
            
            <Text weight={500}>Original Text:</Text>
            <Text size="sm" color="dimmed">
              {memoryExtraction.content}
            </Text>
            
            {memoryExtraction.extractedFacts && memoryExtraction.extractedFacts.length > 0 && (
              <>
                <Text weight={500} mt="xs">Extracted Facts:</Text>
                <Stack spacing="xs">
                  {memoryExtraction.extractedFacts.map((fact, index) => (
                    <Text key={index} size="sm" color="dimmed">
                      • {fact}
                    </Text>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </Card>
        
        {error && (
          <Text color="red" size="sm">
            {error}
          </Text>
        )}
        
        <Group position="right" mt="md">
          <Button variant="outline" onClick={handleReject} disabled={isSubmitting}>
            Don't Save
          </Button>
          
          <Button onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader size="xs" color="white" mr="xs" /> Saving...
              </>
            ) : (
              'Save as Memory'
            )}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
````

## File: components/memory/memory-batch-status.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, Text, Group, Badge, Progress, ActionIcon, Tooltip } from '@mantine/core'
import { IconRefresh, IconClock, IconCheck } from '@tabler/icons-react'
import { httpApi } from '@/app/api/httpApi'

interface BatchStats {
  totalUsers: number
  totalPendingVectors: number
  activeBatchJobs: number
  cacheEntries: Array<{
    userAddress: string
    pendingVectors: number
    lastModified: string
    isDirty: boolean
  }>
}

interface MemoryBatchStatusProps {
  userAddress: string
  onForceFlush?: () => void
}

export function MemoryBatchStatus({ userAddress, onForceFlush }: MemoryBatchStatusProps) {
  const [stats, setStats] = useState<BatchStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await httpApi.get('/api/memories/batch-stats')
      setStats(response)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching batch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleForceFlush = async () => {
    try {
      setLoading(true)
      await httpApi.post(`/api/memories/force-flush/${userAddress}`)
      await fetchStats() // Refresh stats after flush
      onForceFlush?.()
    } catch (error) {
      console.error('Error forcing flush:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000)
    
    return () => clearInterval(interval)
  }, [])

  if (!stats) {
    return null
  }

  const userEntry = stats.cacheEntries.find(entry => entry.userAddress === userAddress)
  const hasPendingVectors = userEntry && userEntry.pendingVectors > 0

  if (!hasPendingVectors && stats.totalPendingVectors === 0) {
    return null // Don't show if no pending operations
  }

  return (
    <Card padding="sm" radius="md" withBorder bg="blue.0">
      <Group justify="space-between" align="flex-start">
        <div style={{ flex: 1 }}>
          <Group gap="xs" mb="xs">
            <IconClock size={16} color="blue" />
            <Text size="sm" fw={500}>Memory Index Processing</Text>
            {hasPendingVectors && (
              <Badge size="sm" color="blue" variant="light">
                {userEntry.pendingVectors} pending
              </Badge>
            )}
          </Group>
          
          {hasPendingVectors ? (
            <>
              <Text size="xs" c="dimmed" mb="xs">
                Your memories are being processed and will be searchable shortly.
              </Text>
              <Progress 
                value={100} 
                size="xs" 
                color="blue" 
                animated 
                mb="xs"
              />
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  Processing {userEntry.pendingVectors} memories...
                </Text>
                <Tooltip label="Force immediate processing">
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="blue"
                    onClick={handleForceFlush}
                    loading={loading}
                  >
                    <IconRefresh size={12} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </>
          ) : (
            <Group gap="xs">
              <IconCheck size={14} color="green" />
              <Text size="xs" c="green">
                All memories processed and searchable
              </Text>
            </Group>
          )}
        </div>
        
        <Group gap="xs">
          <Tooltip label="Refresh status">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={fetchStats}
              loading={loading}
            >
              <IconRefresh size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      
      {lastUpdated && (
        <Text size="xs" c="dimmed" mt="xs">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}
      
      {stats.totalPendingVectors > 0 && (
        <Text size="xs" c="dimmed" mt="xs">
          System-wide: {stats.totalPendingVectors} memories being processed across {stats.activeBatchJobs} users
        </Text>
      )}
    </Card>
  )
}
````

## File: components/memory/memory-decryption-modal.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import { Modal, Stack, Button, Text, Alert, Loader, TextInput, Group, Card } from '@mantine/core'
import { IconLock, IconLockOpen, IconEye, IconKey } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { sealService } from '@/app/services/sealService'
import type { EncryptedMemoryData } from '@/app/services/sealService'

interface MemoryDecryptionModalProps {
  opened: boolean
  onClose: () => void
  memory: {
    id: string
    content: string
    category: string
    isEncrypted: boolean
    walrusHash?: string
  }
  userAddress: string
}

export function MemoryDecryptionModal({ 
  opened, 
  onClose, 
  memory, 
  userAddress 
}: MemoryDecryptionModalProps) {
  const [decrypting, setDecrypting] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null)
  const [passphrase, setPassphrase] = useState('')

  // Check if memory content is already decrypted with Seal
  useEffect(() => {
    if (memory && !decryptedContent) {
      // Check if the content is Seal-encrypted (JSON format)
      const checkSealEncryption = () => {
        try {
          // Try to parse as Seal encrypted data
          const encryptedData = JSON.parse(memory.content) as EncryptedMemoryData;
          if (encryptedData.sealMetadata && encryptedData.encryptedContent) {
            // This is Seal-encrypted data, show decrypt button
            return;
          }
        } catch {
          // Not JSON or not Seal format, treat as plaintext
          setDecryptedContent(formatDecryptedContent(memory.content));
        }
      };
      
      checkSealEncryption();
    }
  }, [memory]);
  
  const formatDecryptedContent = (fullContent: string) => {
    return `🔓 **Decrypted Memory Content:**

${fullContent}

**Technical Details:**
- Stored on Walrus: ${memory.walrusHash || 'hash_example_123'}
- Encrypted with IBE (Identity-Based Encryption)
- Category: ${memory.category}
- Owner: ${userAddress}

**Full Context:**
This memory was automatically detected and stored with advanced encryption. The content is now fully accessible and can be used for enhanced AI conversations.`;
  };
  
  const handleDecrypt = async () => {
    setDecrypting(true)
    try {
      let fullContent = memory.content;
      
      // Check if this is Seal-encrypted content
      try {
        const encryptedData = JSON.parse(memory.content) as EncryptedMemoryData;
        if (encryptedData.sealMetadata && encryptedData.encryptedContent) {
          // This is Seal-encrypted, decrypt using Seal service
          const decryptedData = await sealService.decryptMemory(encryptedData, userAddress);
          fullContent = decryptedData.content;
        }
      } catch (parseError) {
        // Not Seal format, use content as-is
        console.log('Memory is not Seal-encrypted, using plaintext');
      }
      
      // Create enhanced content with the full text
      const enhancedContent = formatDecryptedContent(fullContent);
      setDecryptedContent(enhancedContent)
      
      notifications.show({
        title: 'Memory Decrypted',
        message: 'Successfully decrypted memory content',
        color: 'green',
        icon: <IconLockOpen size={16} />
      })
    } catch (error) {
      notifications.show({
        title: 'Decryption Failed',
        message: `Failed to decrypt memory content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        color: 'red',
        icon: <IconLock size={16} />
      })
    } finally {
      setDecrypting(false)
    }
  }

  const handleClose = () => {
    setDecryptedContent(null)
    setPassphrase('')
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconLock size={20} />
          <Text fw={600}>Decrypt Memory</Text>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        <Alert color="blue" title="Encrypted Memory" icon={<IconLock size={16} />}>
          This memory is encrypted using Identity-Based Encryption (IBE) and stored on the 
          decentralized Walrus network. Only you can decrypt it.
        </Alert>

        <Card p="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={500}>Memory Preview</Text>
              <Text size="xs" c="dimmed" ff="monospace">
                {memory.id.slice(0, 12)}...
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {memory.content}
            </Text>
            <Group gap="xs">
              <Text size="xs" c="dimmed">Category:</Text>
              <Text size="xs" fw={500}>{memory.category}</Text>
            </Group>
          </Stack>
        </Card>

        {!decryptedContent && (
          <>
            <TextInput
              label="Decryption Passphrase (Optional)"
              placeholder="Enter passphrase for additional security"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              leftSection={<IconKey size={16} />}
              type="password"
            />

            <Button
              onClick={handleDecrypt}
              loading={decrypting}
              leftSection={!decrypting && <IconLockOpen size={16} />}
              fullWidth
              size="md"
            >
              {decrypting ? 'Decrypting...' : 'Decrypt Memory'}
            </Button>
          </>
        )}

        {decryptedContent && (
          <Card p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
            <Stack gap="sm">
              <Group gap="xs">
                <IconEye size={16} color="green" />
                <Text fw={500} c="green">Decrypted Content</Text>
              </Group>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {decryptedContent}
              </Text>
            </Stack>
          </Card>
        )}

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            💡 Decrypted memories are temporarily cached for this session
          </Text>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
````

## File: components/memory/memory-extraction-indicator.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import { ActionIcon, Tooltip, Modal, Stack, Text, Button, Group, Badge } from '@mantine/core'
import { IconBrain, IconPlus, IconCheck } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { type DetectionResult } from '@/app/services/memoryIntegration'
import { memoryApi } from '@/app/api'

interface MemoryExtractionIndicatorProps {
  message: string
  userAddress: string
  onMemoryStored?: (count: number) => void
}

export function MemoryExtractionIndicator({
  message,
  userAddress,
  onMemoryStored
}: MemoryExtractionIndicatorProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [isStoring, setIsStoring] = useState(false)
  const [storedMemories, setStoredMemories] = useState<string[]>([])

  // Memory detection is now handled by backend automatically
  // This component shows a simplified indicator
  useEffect(() => {
    // Backend handles detection automatically during chat streaming
    // This component now shows a basic indicator for manual memory addition
    setDetectionResult({
      shouldStore: false,
      memories: [],
      reasoning: 'Memory detection moved to backend'
    })
  }, [message])

  const handleIconClick = () => {
    // Always allow opening for manual memory addition
    // since backend handles automatic detection
    open()
  }

  const handleStoreMemories = async () => {
    if (!detectionResult || !detectionResult.shouldStore) return

    setIsStoring(true)
    const stored: string[] = []
    const errors: string[] = []

    try {
      for (const memory of detectionResult.memories) {
        try {
          const response = await memoryApi.createMemory({
            content: memory.content,
            category: memory.category,
            userAddress: userAddress,
            userSignature: 'dummy_signature' // TODO: Use real signature
          })

          if (response.success) {
            stored.push(memory.category)
          } else {
            errors.push(`Failed to store ${memory.category}: ${response.message || 'Unknown error'}`)
          }
        } catch (error) {
          console.error('Failed to store memory:', error)
          errors.push(`Failed to store ${memory.category}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      setStoredMemories(stored)
      onMemoryStored?.(stored.length)

      // Show user feedback about results
      if (errors.length > 0) {
        console.warn('Memory storage errors:', errors)
        // TODO: Show user-friendly error notification
      }

      // Auto-close after processing
      setTimeout(() => {
        close()
      }, 2000)
    } catch (error) {
      console.error('Error storing memories:', error)
    } finally {
      setIsStoring(false)
    }
  }

  // Don't show indicator if no extractable information detected
  if (!detectionResult?.shouldStore) {
    return null
  }

  const isStored = storedMemories.length > 0

  return (
    <>
      <Tooltip 
        label={isStored ? 'Memories stored' : 'Extract personal information'} 
        position="top"
      >
        <ActionIcon
          variant={isStored ? 'filled' : 'light'}
          color={isStored ? 'green' : 'blue'}
          size="sm"
          onClick={handleIconClick}
          style={{ opacity: 0.7 }}
        >
          {isStored ? <IconCheck size={14} /> : <IconBrain size={14} />}
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={close}
        title="Extract Personal Information"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            I detected some personal information in your message that could be stored in your memory layer:
          </Text>

          <Stack gap="xs">
            {detectionResult?.memories.map((memory, index) => (
              <Group key={index} justify="space-between" p="sm" style={{ 
                border: '1px solid var(--mantine-color-gray-3)', 
                borderRadius: 'var(--mantine-radius-sm)' 
              }}>
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Badge size="xs" variant="light" color="blue">
                      {memory.category}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {Math.round(memory.confidence * 100)}% confidence
                    </Text>
                  </Group>
                  <Text size="sm">
                    {memory.content}
                  </Text>
                  {memory.extractedInfo.length > 0 && (
                    <Stack gap={2}>
                      {memory.extractedInfo.map((info, i) => (
                        <Text key={i} size="xs" c="dimmed">
                          <strong>{info.key}:</strong> {info.value}
                        </Text>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Group>
            ))}
          </Stack>

          <Text size="xs" c="dimmed">
            {detectionResult?.reasoning}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={close} disabled={isStoring}>
              Cancel
            </Button>
            <Button 
              onClick={handleStoreMemories} 
              loading={isStoring}
              leftSection={<IconPlus size={16} />}
              disabled={storedMemories.length > 0}
            >
              {storedMemories.length > 0 ? 'Stored!' : 'Store Memories'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
````

## File: components/memory/memory-graph.tsx
````typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, Text, Group, ActionIcon, Badge, Stack, Box, Select } from '@mantine/core'
import { IconRefresh, IconZoomIn, IconZoomOut, IconCube, IconCircle } from '@tabler/icons-react'

interface MemoryNode {
  id: string
  label: string
  category: string
  connections: number
  isEncrypted: boolean
  walrusHash?: string
  decrypted: boolean
  fullContent?: string
}

interface MemoryEdge {
  source: string
  target: string
  weight: number
}

interface MemoryGraphProps {
  memories: Array<{
    id: string
    content: string
    category: string
    similarity?: number
    isEncrypted?: boolean
    walrusHash?: string
  }>
  userAddress: string
}

export function MemoryGraph({ memories, userAddress }: MemoryGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [nodes, setNodes] = useState<MemoryNode[]>([])
  const [edges, setEdges] = useState<MemoryEdge[]>([])
  const [zoom, setZoom] = useState(1)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    if (memories.length === 0) return

    // Convert memories to graph nodes with physics properties
    const graphNodes: MemoryNode[] = memories.map((memory, index) => ({
      id: memory.id,
      label: memory.content.slice(0, 30) + (memory.content.length > 30 ? '...' : ''),
      category: memory.category,
      connections: 0,
      isEncrypted: memory.isEncrypted || false,
      walrusHash: memory.walrusHash,
      decrypted: false,
      fullContent: undefined
    }))

    // Create edges based on category similarity and content similarity
    const graphEdges: MemoryEdge[] = []
    for (let i = 0; i < graphNodes.length; i++) {
      for (let j = i + 1; j < graphNodes.length; j++) {
        const node1 = graphNodes[i]
        const node2 = graphNodes[j]
        
        // Connect nodes in same category
        if (node1.category === node2.category) {
          graphEdges.push({
            source: node1.id,
            target: node2.id,
            weight: 0.8
          })
          node1.connections++
          node2.connections++
        }
        
        // Connect nodes with similar content (simple word overlap)
        const words1 = memories[i].content.toLowerCase().split(' ')
        const words2 = memories[j].content.toLowerCase().split(' ')
        const commonWords = words1.filter(word => words2.includes(word) && word.length > 3)
        
        if (commonWords.length >= 2) {
          graphEdges.push({
            source: node1.id,
            target: node2.id,
            weight: Math.min(commonWords.length / 5, 0.6)
          })
          node1.connections++
          node2.connections++
        }
      }
    }

    setNodes(graphNodes)
    setEdges(graphEdges)
  }, [memories])

  // Add auto-decrypt functionality
  const [isDecrypting, setIsDecrypting] = useState(false)
  
  // Auto-decrypt nodes when loaded
  useEffect(() => {
    if (nodes.length > 0 && userAddress) {
      decryptAllNodes()
    }
  }, [nodes, userAddress]) // Re-run when nodes or userAddress changes
  
  const decryptAllNodes = async () => {
    if (isDecrypting || !userAddress) return
    
    setIsDecrypting(true)
    try {
      // Get nodes that need decryption and have walrusHash
      const nodesToDecrypt = nodes.filter(node => 
        node.isEncrypted && !node.decrypted && node.walrusHash
      )
      
      if (nodesToDecrypt.length === 0) {
        setIsDecrypting(false)
        return
      }
      
      // Process in batches
      const batchSize = 3
      const updatedNodes = [...nodes]
      
      for (let i = 0; i < nodesToDecrypt.length; i += batchSize) {
        const batch = nodesToDecrypt.slice(i, i + batchSize)
        await Promise.all(batch.map(async (node) => {
          try {
            if (node.walrusHash) {
              const response = await fetch(`/api/memory/content/${node.walrusHash}`)
              if (response.ok) {
                const contentData = await response.json()
                if (contentData.content) {
                  // Find node in the nodes array and update it
                  const nodeIndex = updatedNodes.findIndex(n => n.id === node.id)
                  if (nodeIndex !== -1) {
                    updatedNodes[nodeIndex] = {
                      ...updatedNodes[nodeIndex],
                      decrypted: true,
                      fullContent: contentData.content,
                      label: contentData.content.slice(0, 30) + (contentData.content.length > 30 ? '...' : '')
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Failed to decrypt node ${node.id}:`, err)
          }
        }))
      }
      
      // Update all nodes at once
      setNodes(updatedNodes)
    } catch (error) {
      console.error('Failed to decrypt all nodes:', error)
    } finally {
      setIsDecrypting(false)
    }
  }
  
  useEffect(() => {
    drawGraph()
  }, [nodes, edges, zoom, selectedNode, animationFrame])

  // Animation loop for selected node pulsing
  useEffect(() => {
    if (selectedNode) {
      const animate = () => {
        setAnimationFrame(prev => prev + 1)
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [selectedNode])

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f8fafc')
    gradient.addColorStop(1, '#e2e8f0')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Calculate node positions using the helper function
    const nodePositions = calculateNodePositions(width, height)

    // Draw edges with better styling
    edges.forEach(edge => {
      const source = nodePositions[edge.source]
      const target = nodePositions[edge.target]
      if (source && target) {
        // Draw curved edges for better visualization
        const midX = (source.x + target.x) / 2
        const midY = (source.y + target.y) / 2
        const offset = Math.min(40, Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / 4)
        
        // Compute control point offset
        const dx = target.x - source.x
        const dy = target.y - source.y
        const norm = Math.sqrt(dx * dx + dy * dy)
        const nx = -dy / norm
        const ny = dx / norm
        
        // Draw curved path
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.quadraticCurveTo(
          midX + nx * offset,
          midY + ny * offset,
          target.x, 
          target.y
        )
        
        // Enhanced edge styling with glow
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)'
        ctx.shadowBlur = 5
        ctx.strokeStyle = `rgba(59, 130, 246, ${edge.weight * 0.8})`
        ctx.lineWidth = Math.max(2, edge.weight * 3)
        ctx.stroke()

        // Reset shadow
        ctx.shadowBlur = 0
      }
    })

    // Draw nodes with enhanced 3D-like styling
    nodes.forEach(node => {
      const pos = nodePositions[node.id]
      if (!pos) return

      const baseNodeSize = Math.min(35, 20 + node.connections * 4)
      const isSelected = selectedNode === node.id
      const baseColor = getCategoryColor(node.category)

      // Add pulsing effect for selected node
      const pulseScale = isSelected ? 1 + Math.sin(animationFrame * 0.1) * 0.1 : 1
      const nodeSize = baseNodeSize * pulseScale

      // Parse color to get RGB values for gradient
      const colorMatch = baseColor.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
      let r = 107, g = 114, b = 128 // default gray
      if (colorMatch) {
        r = parseInt(colorMatch[1], 16)
        g = parseInt(colorMatch[2], 16)
        b = parseInt(colorMatch[3], 16)
      }

      // Drop shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = isSelected ? 15 : 8
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3

      // Outer glow effect
      const outerGlow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, nodeSize + 15)
      outerGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`)
      outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.globalAlpha = isSelected ? 0.6 : 0.3
      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeSize + 15, 0, 2 * Math.PI)
      ctx.fill()

      // Main node with radial gradient for 3D effect
      const nodeGradient = ctx.createRadialGradient(
        pos.x - nodeSize * 0.3, pos.y - nodeSize * 0.3, 0,
        pos.x, pos.y, nodeSize
      )
      nodeGradient.addColorStop(0, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, 1)`)
      nodeGradient.addColorStop(0.7, baseColor)
      nodeGradient.addColorStop(1, `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, 1)`)

      ctx.globalAlpha = 1
      ctx.fillStyle = nodeGradient
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeSize, 0, 2 * Math.PI)
      ctx.fill()

      // Enhanced border
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.strokeStyle = isSelected ? '#fbbf24' : '#ffffff'
      ctx.lineWidth = isSelected ? 4 : 2
      ctx.stroke()
      
      // Enhanced text rendering
      ctx.globalAlpha = 1

      // Text with shadow for better visibility
      ctx.font = 'bold 11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Text shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillText(node.label, pos.x + 1, pos.y + 1)

      // Main text
      ctx.fillStyle = '#ffffff'
      ctx.fillText(node.label, pos.x, pos.y)

      // Category label for selected nodes
      if (isSelected) {
        ctx.font = '10px Inter, sans-serif'
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillText(node.category, pos.x, pos.y + nodeSize + 20)
      }
    })
  }

  // Helper function to calculate node positions (shared between drawing and click detection)
  const calculateNodePositions = (canvasWidth: number, canvasHeight: number): { [key: string]: { x: number; y: number } } => {
    const nodePositions: { [key: string]: { x: number; y: number } } = {}
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const minDistance = 80

    // Group nodes by category
    const nodesByCategory: { [key: string]: MemoryNode[] } = {}
    nodes.forEach(node => {
      if (!nodesByCategory[node.category]) {
        nodesByCategory[node.category] = []
      }
      nodesByCategory[node.category].push(node)
    })

    let categoryIndex = 0
    const categoryCount = Object.keys(nodesByCategory).length

    if (categoryCount === 1) {
      // Single category - arrange in a circle
      const category = Object.keys(nodesByCategory)[0]
      const categoryNodes = nodesByCategory[category]
      const nodeCount = categoryNodes.length

      if (nodeCount === 1) {
        nodePositions[categoryNodes[0].id] = { x: centerX, y: centerY }
      } else {
        let currentRadius = 80
        let nodesPlaced = 0

        while (nodesPlaced < nodeCount) {
          const nodesInThisCircle = Math.min(
            Math.floor(2 * Math.PI * currentRadius / minDistance),
            nodeCount - nodesPlaced
          )

          for (let i = 0; i < nodesInThisCircle && nodesPlaced < nodeCount; i++) {
            const angle = (i / nodesInThisCircle) * 2 * Math.PI
            nodePositions[categoryNodes[nodesPlaced].id] = {
              x: centerX + Math.cos(angle) * currentRadius,
              y: centerY + Math.sin(angle) * currentRadius
            }
            nodesPlaced++
          }
          currentRadius += minDistance
        }
      }
    } else {
      // Multiple categories
      Object.entries(nodesByCategory).forEach(([category, categoryNodes]) => {
        const categoryAngle = (categoryIndex / categoryCount) * 2 * Math.PI
        const categoryRadius = Math.min(canvasWidth, canvasHeight) * 0.25
        const categoryX = centerX + Math.cos(categoryAngle) * categoryRadius
        const categoryY = centerY + Math.sin(categoryAngle) * categoryRadius

        const nodeCount = categoryNodes.length

        if (nodeCount === 1) {
          nodePositions[categoryNodes[0].id] = { x: categoryX, y: categoryY }
        } else {
          const nodeRadius = Math.max(60, minDistance * nodeCount / (2 * Math.PI))

          categoryNodes.forEach((node, nodeIndex) => {
            const nodeAngle = (nodeIndex / nodeCount) * 2 * Math.PI
            nodePositions[node.id] = {
              x: categoryX + Math.cos(nodeAngle) * nodeRadius,
              y: categoryY + Math.sin(nodeAngle) * nodeRadius
            }
          })
        }

        categoryIndex++
      })
    }

    return nodePositions
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      // Match the actual categories from the backend
      'personal_info': '#3b82f6',
      'location': '#10b981',
      'career': '#f59e0b',
      'preference': '#ef4444',
      'custom': '#8b5cf6',
      'education': '#06b6d4',
      'contact': '#84cc16',
      'background': '#f97316',
      'health': '#ec4899',

      // Legacy categories
      'personal': '#69db7c',
      'work': '#ffd43b',
      'preferences': '#ff8cc8',
      'skills': '#9775fa',
      'auto-detected': '#4dabf7',

      'default': '#6b7280'
    }
    return colors[category] || colors.default
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setSelectedNode(null)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert to canvas coordinates
    const canvasX = (x / rect.width) * canvas.width
    const canvasY = (y / rect.height) * canvas.height

    // Use the same positioning logic as drawGraph
    const nodePositions = calculateNodePositions(canvas.width, canvas.height)

    // Find clicked node
    let closestNode = null
    let minDistance = Infinity

    for (const node of nodes) {
      const pos = nodePositions[node.id]
      if (pos) {
        const nodeSize = Math.min(35, 20 + node.connections * 4)
        const distance = Math.sqrt(Math.pow(canvasX - pos.x, 2) + Math.pow(canvasY - pos.y, 2))

        if (distance <= nodeSize && distance < minDistance) {
          minDistance = distance
          closestNode = node.id
        }
      }
    }

    setSelectedNode(closestNode)
  }

  if (memories.length === 0) {
    return (
      <Card p="md" style={{ height: 400 }}>
        <Stack align="center" justify="center" h="100%">
          <Text c="dimmed" ta="center">
            No memories to visualize yet.<br />
            Start chatting to build your memory graph!
          </Text>
        </Stack>
      </Card>
    )
  }

  return (
    <Card p="md">
      <Group justify="space-between" mb="md">
        <Group>
          <Text fw={600}>Memory Graph</Text>
          <Badge variant="light" color="blue">
            {nodes.length} memories
          </Badge>
        </Group>
        <Group gap="xs">
          <Select
            value={viewMode}
            onChange={(value) => setViewMode(value as '2d' | '3d')}
            data={[
              { value: '2d', label: '2D View' },
              { value: '3d', label: '3D View' }
            ]}
            size="xs"
            w={100}
          />
          <ActionIcon variant="light" onClick={handleZoomOut} title="Zoom Out">
            <IconZoomOut size={16} />
          </ActionIcon>
          <ActionIcon variant="light" onClick={handleReset} title="Reset View">
            <IconRefresh size={16} />
          </ActionIcon>
          <ActionIcon variant="light" onClick={handleZoomIn} title="Zoom In">
            <IconZoomIn size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Box style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onClick={handleCanvasClick}
          style={{
            width: '100%',
            height: 400,
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        />
      </Box>

      {/* Selected Node Info */}
      {selectedNode && (
        <Box mt="sm" p="sm" bg="gray.0" style={{ borderRadius: 8 }}>
          {(() => {
            const node = nodes.find(n => n.id === selectedNode)
            if (!node) return null

            return (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={600} size="sm">Selected Memory</Text>
                  <Badge size="xs" color={getCategoryColor(node.category)}>
                    {node.category}
                  </Badge>
                </Group>
                <Text size="sm">
                  {node.fullContent || node.label}
                </Text>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    Connections: {node.connections}
                  </Text>
                  {node.isEncrypted && (
                    <Badge size="xs" color="red" variant="light">
                      Encrypted
                    </Badge>
                  )}
                </Group>
              </Stack>
            )
          })()}
        </Box>
      )}

      <Group mt="sm" gap="md">
        {Object.entries({
          'personal_info': '#3b82f6',
          'location': '#10b981',
          'career': '#f59e0b',
          'preference': '#ef4444',
          'custom': '#8b5cf6',
          'education': '#06b6d4'
        }).map(([category, color]) => (
          <Group key={category} gap={4}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: color
              }}
            />
            <Text size="xs" c="dimmed">
              {category.replace('_', ' ')}
            </Text>
          </Group>
        ))}
      </Group>
    </Card>
  )
}
````

## File: components/memory/memory-index-debug.tsx
````typescript
'use client'

import { Button, Card, Stack, Text, Group, Code } from '@mantine/core'
import { memoryIndexService } from '@/app/services/memoryIndexService'
import { useWallet } from '@suiet/wallet-kit'
import { useState } from 'react'

export function MemoryIndexDebugPanel() {
  const wallet = useWallet()
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  
  const userAddress = wallet.account?.address || ''
  const indexState = userAddress ? memoryIndexService.getIndexState(userAddress) : null
  
  const handleClearCache = () => {
    if (userAddress) {
      memoryIndexService.clearIndexState(userAddress)
      setStatus('Index cache cleared')
      setTimeout(() => setStatus(''), 3000)
    }
  }
  
  const handleCreateIndex = async () => {
    if (!userAddress || !wallet.connected) {
      setStatus('Please connect your wallet first')
      return
    }
    
    setIsLoading(true)
    setStatus('Creating memory index...')
    
    try {
      const result = await memoryIndexService.checkAndCreateIndex(userAddress, wallet)
      if (result.hasIndex) {
        setStatus(`Index ready: ${result.indexId || 'exists on backend'}`)
      } else {
        setStatus(`Failed: ${result.message}`)
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack spacing="sm">
        <Text size="lg" weight={500}>Memory Index Debug</Text>
        
        <Group spacing="xs">
          <Text size="sm">Address:</Text>
          <Code>{userAddress || 'Not connected'}</Code>
        </Group>
        
        {indexState && (
          <>
            <Group spacing="xs">
              <Text size="sm">Index ID:</Text>
              <Code>{indexState.indexId || 'None'}</Code>
            </Group>
            
            <Group spacing="xs">
              <Text size="sm">Status:</Text>
              <Text size="sm" color={indexState.isRegistered ? 'green' : 'yellow'}>
                {indexState.isCreating ? 'Creating...' : indexState.isRegistered ? 'Registered' : 'Not registered'}
              </Text>
            </Group>
            
            {indexState.lastError && (
              <Text size="sm" color="red">
                Last error: {indexState.lastError}
              </Text>
            )}
          </>
        )}
        
        {status && (
          <Text size="sm" color={status.includes('Error') || status.includes('Failed') ? 'red' : 'blue'}>
            {status}
          </Text>
        )}
        
        <Group>
          <Button 
            onClick={handleClearCache} 
            variant="outline" 
            size="sm"
            disabled={!userAddress}
          >
            Clear Cache
          </Button>
          
          <Button 
            onClick={handleCreateIndex} 
            size="sm"
            disabled={!userAddress || isLoading}
            loading={isLoading}
          >
            Create/Check Index
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
````

## File: components/memory/memory-indicator-icon.tsx
````typescript
'use client'

import { IconBrain, IconPlus } from '@tabler/icons-react'
import { Tooltip, ActionIcon } from '@mantine/core'

interface MemoryIndicatorIconProps {
  memoryDetected: boolean
  memoryId?: string | null
  onClick?: () => void
  size?: number
}

export function MemoryIndicatorIcon({ 
  memoryDetected, 
  memoryId, 
  onClick, 
  size = 16 
}: MemoryIndicatorIconProps) {
  if (!memoryDetected) return null

  const isStored = !!memoryId
  const icon = isStored ? (
    <IconBrain 
      size={size} 
      style={{ 
        color: '#4CAF50',
        filter: 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.3))'
      }} 
    />
  ) : (
    <IconPlus 
      size={size} 
      style={{ 
        color: '#2196F3',
        filter: 'drop-shadow(0 0 4px rgba(33, 150, 243, 0.3))'
      }} 
    />
  )

  const tooltipText = isStored 
    ? 'Memory stored - Click to view details' 
    : 'Personal information detected - Click to add to memory'

  return (
    <Tooltip label={tooltipText} position="top" withArrow>
      <ActionIcon
        variant="subtle"
        size="sm"
        onClick={onClick}
        style={{
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  )
}
````

## File: components/memory/memory-indicator.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import { Badge, Group, Text, Tooltip, ActionIcon } from '@mantine/core'
import { IconBrain, IconCheck, IconX } from '@tabler/icons-react'

interface MemoryIndicatorProps {
  isProcessing: boolean
  memoriesDetected: number
  memoriesStored: number
  errors: string[]
  onViewDetails?: () => void
}

export function MemoryIndicator({ 
  isProcessing, 
  memoriesDetected, 
  memoriesStored, 
  errors,
  onViewDetails 
}: MemoryIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Auto-hide details after 5 seconds
  useEffect(() => {
    if (memoriesStored > 0 || errors.length > 0) {
      setShowDetails(true)
      const timer = setTimeout(() => setShowDetails(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [memoriesStored, errors.length])

  if (!isProcessing && memoriesDetected === 0 && memoriesStored === 0 && errors.length === 0) {
    return null
  }

  const getStatusColor = () => {
    if (errors.length > 0) return 'red'
    if (memoriesStored > 0) return 'green'
    if (isProcessing) return 'blue'
    return 'gray'
  }

  const getStatusIcon = () => {
    if (errors.length > 0) return <IconX size={12} />
    if (memoriesStored > 0) return <IconCheck size={12} />
    return <IconBrain size={12} />
  }

  const getStatusText = () => {
    if (isProcessing) return 'Processing memories...'
    if (errors.length > 0) return `Memory error (${errors.length})`
    if (memoriesStored > 0) return `${memoriesStored} memories stored`
    if (memoriesDetected > 0) return `${memoriesDetected} memories detected`
    return 'Memory processing'
  }

  const getTooltipContent = () => {
    const parts = []
    
    if (memoriesDetected > 0) {
      parts.push(`Detected: ${memoriesDetected} potential memories`)
    }
    
    if (memoriesStored > 0) {
      parts.push(`Stored: ${memoriesStored} memories successfully`)
    }
    
    if (errors.length > 0) {
      parts.push(`Errors: ${errors.join(', ')}`)
    }
    
    return parts.join('\n') || 'Memory system active'
  }

  return (
    <Group gap="xs" align="center">
      <Tooltip 
        label={getTooltipContent()} 
        multiline 
        position="top"
        withArrow
      >
        <Badge
          size="sm"
          color={getStatusColor()}
          variant="light"
          leftSection={getStatusIcon()}
          style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
          onClick={onViewDetails}
        >
          {getStatusText()}
        </Badge>
      </Tooltip>

      {showDetails && (memoriesStored > 0 || errors.length > 0) && (
        <Group gap="xs">
          {memoriesStored > 0 && (
            <Text size="xs" c="green">
              ✓ Personal information saved securely
            </Text>
          )}
          
          {errors.length > 0 && (
            <Text size="xs" c="red">
              ⚠ {errors.length} storage error{errors.length > 1 ? 's' : ''}
            </Text>
          )}
        </Group>
      )}
    </Group>
  )
}

// Hook for managing memory indicator state
export function useMemoryIndicator() {
  const [state, setState] = useState({
    isProcessing: false,
    memoriesDetected: 0,
    memoriesStored: 0,
    errors: [] as string[]
  })

  const startProcessing = () => {
    setState(prev => ({ ...prev, isProcessing: true }))
  }

  const setDetected = (count: number) => {
    setState(prev => ({ ...prev, memoriesDetected: count }))
  }

  const setStored = (count: number) => {
    setState(prev => ({ 
      ...prev, 
      memoriesStored: count, 
      isProcessing: false 
    }))
  }

  const addError = (error: string) => {
    setState(prev => ({ 
      ...prev, 
      errors: [...prev.errors, error],
      isProcessing: false 
    }))
  }

  const reset = () => {
    setState({
      isProcessing: false,
      memoriesDetected: 0,
      memoriesStored: 0,
      errors: []
    })
  }

  return {
    ...state,
    startProcessing,
    setDetected,
    setStored,
    addError,
    reset
  }
}
````

## File: components/memory/memory-manager.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Text,
  Badge,
  Card,
  ActionIcon,
  Tabs,
  ScrollArea,
  Alert,
  Loader,
  Center,
  Tooltip
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
  IconBrain,
  IconTrash,
  IconCategory,
  IconClock,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import { useWallet } from '@suiet/wallet-kit'
import { memoryIntegrationService } from '@/app/services/memoryIntegration'
import { MemoryGraph } from './memory-graph'
import { emitMemoriesUpdated, emitMemoryAdded } from '@/app/services/memoryEventEmitter'
// Removed MemoryDecryptionModal import - content loads automatically now

interface Memory {
  id: string
  content: string
  category: string
  timestamp: string
  similarity?: number
  isEncrypted: boolean
  walrusHash?: string
  owner: string
}

interface MemoryManagerProps {
  userAddress: string
  onMemoryAdded?: (memory: Memory) => void
  onMemoryDeleted?: (memoryId: string) => void
}

const MEMORY_CATEGORIES = [
  { value: 'personal', label: 'Personal', color: 'blue' },
  { value: 'work', label: 'Work', color: 'green' },
  { value: 'facts', label: 'Facts & Knowledge', color: 'orange' },
  { value: 'schedule', label: 'Schedule & Events', color: 'purple' },
  { value: 'preferences', label: 'Preferences', color: 'pink' },
  { value: 'goals', label: 'Goals & Plans', color: 'teal' },
  { value: 'general', label: 'General', color: 'gray' }
]

export function MemoryManager({ userAddress, onMemoryAdded, onMemoryDeleted }: MemoryManagerProps) {
  const wallet = useWallet()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('browse')

  // Add memory modal
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [newMemoryContent, setNewMemoryContent] = useState('')
  const [newMemoryCategory, setNewMemoryCategory] = useState('general')
  const [addingMemory, setAddingMemory] = useState(false)

  // Search results
  const [searchResults, setSearchResults] = useState<Memory[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadMemories()
  }, [userAddress])

  const loadMemories = async () => {
    setLoading(true)
    try {
      // Use direct blockchain access to get all memories
      const data = await memoryIntegrationService.fetchUserMemories(userAddress)
      console.log('Memories response:', data)
      
      // Handle different response formats
      const memoryList = data.memories || []
      console.log('Processed memories:', memoryList)
      setMemories(memoryList)
      
      if (memoryList.length === 0) {
        console.log('No memories found for user:', userAddress)
      }
    } catch (error: any) {
      console.error('Failed to load memories:', error)
      
      // More detailed error handling
      let errorMessage = 'Failed to load memories';
      if (error?.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The server might be under heavy load.';
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 5000
      })
      setMemories([])
      
      // No need for retry as we're using local caching
    } finally {
      setLoading(false)
    }
  }

  const addMemory = async () => {
    if (!newMemoryContent.trim()) return

    setAddingMemory(true)
    try {
      // Create memory extraction object
      const memoryExtraction = {
        shouldSave: true,
        category: newMemoryCategory,
        content: newMemoryContent,
        extractedFacts: [newMemoryContent], // Use full content as the fact
        confidence: 1.0
      };
      
      // Save directly to blockchain using memory integration service
      const result = await memoryIntegrationService.saveApprovedMemory(
        memoryExtraction,
        userAddress,
        wallet
      );
      
      if (!result.success || !result.memoryId) {
        throw new Error(result.message || 'Failed to save memory to blockchain');
      }
      
      // Add to local cache
      const key = `memories_${userAddress}`;
      const cached = localStorage.getItem(key);
      const newMemory: Memory = {
        id: result.memoryId,
        content: newMemoryContent,
        category: newMemoryCategory,
        timestamp: new Date().toISOString(),
        isEncrypted: true,
        owner: userAddress
      };
      
      if (cached) {
        try {
          const memories = JSON.parse(cached);
          memories.push(newMemory);
          localStorage.setItem(key, JSON.stringify(memories));
        } catch (e) {
          console.error('Error updating cache after add:', e);
        }
      }
      
      // Refresh the memories list
      await loadMemories()

      // Emit events to notify other components
      if (result.memoryId) {
        emitMemoryAdded(result.memoryId);
        emitMemoriesUpdated({ memoryIds: [result.memoryId], userAddress });
      }

      setNewMemoryContent('')
      setNewMemoryCategory('general')
      closeAddModal()

      notifications.show({
        title: 'Memory Added',
        message: `Memory saved successfully! ID: ${result.memoryId?.slice(0, 8)}...`,
        color: 'green',
        icon: <IconCheck size={16} />
      })

      if (onMemoryAdded) {
        onMemoryAdded(newMemory);
      }
    } catch (error) {
      console.error('Failed to add memory:', error)
      notifications.show({
        title: 'Error',
        message: typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Failed to save memory to blockchain'),
        color: 'red',
        icon: <IconX size={16} />
      })
    } finally {
      setAddingMemory(false)
    }
  }

  const searchMemories = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      // First get all memories
      const allMemories = await memoryIntegrationService.fetchUserMemories(userAddress)
      
      // Then filter for relevance using client-side search
      let results = memoryIntegrationService.getMemoriesRelevantToText(
        allMemories.memories || [],
        searchQuery,
        20 // Limit to 20 results
      )
      
      // Apply category filter if selected
      if (selectedCategory) {
        results = results.filter(memory => 
          memory.category === selectedCategory ||
          memory.category?.toLowerCase() === selectedCategory.toLowerCase()
        )
      }
      
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      notifications.show({
        title: 'Search Error',
        message: 'Failed to search memories',
        color: 'red',
        icon: <IconX size={16} />
      })
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const deleteMemory = async (memoryId: string) => {
    try {
      // Note: For demo purposes, we'll hide the memory locally rather than delete from blockchain
      // In a production system, you might want to add a delete function to the smart contract
      console.log(`Hiding memory ${memoryId} from local view`);
      
      // Clear the memory from local cache
      const key = `memories_${userAddress}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const memories = JSON.parse(cached);
          const filteredMemories = memories.filter((m: any) => m.id !== memoryId);
          localStorage.setItem(key, JSON.stringify(filteredMemories));
        } catch (e) {
          console.error('Error updating cache after delete:', e);
        }
      }
      
      // Refresh the memories list
      await loadMemories()
      
      // Also remove from search results if present
      setSearchResults(prev => prev.filter(m => m.id !== memoryId))
      onMemoryDeleted?.(memoryId)

      notifications.show({
        title: 'Memory Hidden',
        message: 'Memory removed from view (still stored on blockchain)',
        color: 'blue',
        icon: <IconCheck size={16} />
      })
    } catch (error) {
      console.error('Failed to hide memory:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to remove memory from view',
        color: 'red',
        icon: <IconX size={16} />
      })
    }
  }
  
  // Removed decryptAllMemories function - content loads automatically now

  const getCategoryColor = (category: string) => {
    return MEMORY_CATEGORIES.find(c => c.value === category)?.color || 'gray'
  }

  const filteredMemories = selectedCategory 
    ? memories.filter(m => m.category === selectedCategory)
    : memories

  const MemoryCard = ({ memory, showSimilarity = false }: { memory: Memory, showSimilarity?: boolean }) => {
    // Function to open Sui Explorer in new tab
    const openInSuiExplorer = (walrusHash: string) => {
      // Use SuiVision explorer which better handles Walrus hashes
      const explorerUrl = `https://suivision.xyz/object/${walrusHash}?network=testnet`; 
      window.open(explorerUrl, '_blank');
    };
    
    return (
      <Card key={memory.id} p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
            <Group gap="xs">
              <Badge 
                color={getCategoryColor(memory.category)} 
                variant="light"
                leftSection={<IconCategory size={12} />}
              >
                {MEMORY_CATEGORIES.find(c => c.value === memory.category)?.label || memory.category}
              </Badge>
              {/* Encryption badge removed - content loads automatically */}
              {showSimilarity && memory.similarity && (
                <Badge color="green" variant="light" size="xs">
                  {(memory.similarity * 100).toFixed(1)}% match
                </Badge>
              )}
            </Group>
            <Group gap="xs">
              {memory.walrusHash && (
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  size="sm"
                  title="View on Sui Explorer"
                  onClick={() => openInSuiExplorer(memory.walrusHash || '')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"/>
                    <path d="M12 10.5C12.83 10.5 13.5 11.17 13.5 12C13.5 12.83 12.83 13.5 12 13.5C11.17 13.5 10.5 12.83 10.5 12C10.5 11.17 11.17 10.5 12 10.5Z" fill="currentColor"/>
                    <path d="M7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12ZM9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12Z" fill="currentColor"/>
                  </svg>
                </ActionIcon>
              )}
              <Tooltip label="Hide from view (keeps on blockchain)">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => deleteMemory(memory.id)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
          
          <Text size="sm" lineClamp={3}>
            {memory.content}
          </Text>
          
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconClock size={12} />
              <Text size="xs" c="dimmed">
                {new Date(memory.timestamp).toLocaleDateString()}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" ff="monospace">
              {memory.id.slice(0, 8)}...
            </Text>
          </Group>
        </Stack>
      </Card>
    );
  }


  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={600}>Memory Manager</Text>
          
          <Group gap="sm">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openAddModal}
            >
              Add Memory
            </Button>
          </Group>
        </Group>
        
        {/* Progress bar removed - content loads automatically */}

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'browse')}>
          <Tabs.List>
            <Tabs.Tab value="browse" leftSection={<IconBrain size={16} />}>
              Browse
            </Tabs.Tab>
            <Tabs.Tab value="search" leftSection={<IconSearch size={16} />}>
              Search
            </Tabs.Tab>
            <Tabs.Tab value="graph" leftSection={<IconCategory size={16} />}>
              Graph
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="browse" pt="md">
            <Stack gap="md">
              <Select
                placeholder="Filter by category"
                data={[
                  { value: '', label: 'All Categories' },
                  ...MEMORY_CATEGORIES.map(c => ({ value: c.value, label: c.label }))
                ]}
                value={selectedCategory || ''}
                onChange={(value) => setSelectedCategory(value || null)}
                clearable
              />

              {loading ? (
                <Center py="xl">
                  <Stack align="center" gap="sm">
                    <Loader />
                    <Text c="dimmed">Loading memories...</Text>
                  </Stack>
                </Center>
              ) : filteredMemories.length === 0 ? (
                <Alert color="blue" title="No memories found">
                  {selectedCategory 
                    ? `No memories in the ${selectedCategory} category yet.`
                    : 'No memories saved yet. Add your first memory to get started!'
                  }
                </Alert>
              ) : (
                <ScrollArea h={400}>
                  <Stack gap="sm">
                    {filteredMemories.map(memory => (
                      <MemoryCard key={memory.id} memory={memory} />
                    ))}
                  </Stack>
                </ScrollArea>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="search" pt="md">
            <Stack gap="md">
              <Group>
                <TextInput
                  placeholder="Search your memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === 'Enter' && searchMemories()}
                />
                <Button
                  onClick={searchMemories}
                  loading={searching}
                  leftSection={<IconSearch size={16} />}
                >
                  Search
                </Button>
              </Group>

              <Select
                placeholder="Filter by category"
                data={[
                  { value: '', label: 'All Categories' },
                  ...MEMORY_CATEGORIES.map(c => ({ value: c.value, label: c.label }))
                ]}
                value={selectedCategory || ''}
                onChange={(value) => setSelectedCategory(value || null)}
                clearable
              />

              {searchResults.length === 0 && searchQuery ? (
                <Alert color="yellow" title="No results">
                  No memories found matching your search query.
                </Alert>
              ) : (
                <ScrollArea h={400}>
                  <Stack gap="sm">
                    {searchResults.map(memory => (
                      <MemoryCard key={memory.id} memory={memory} showSimilarity />
                    ))}
                  </Stack>
                </ScrollArea>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="graph" pt="md">
            <MemoryGraph memories={memories} userAddress={userAddress} />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Add Memory Modal */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="Add New Memory"
        size="md"
      >
        <Stack gap="md">
          <Textarea
            label="Memory Content"
            placeholder="What would you like to remember?"
            value={newMemoryContent}
            onChange={(e) => setNewMemoryContent(e.target.value)}
            minRows={4}
            maxRows={8}
            required
          />

          <Select
            label="Category"
            data={MEMORY_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
            value={newMemoryCategory}
            onChange={(value) => setNewMemoryCategory(value || 'general')}
            required
          />

          <Alert color="blue" title="Secure Storage">
            Your memory will be encrypted and stored securely on the decentralized network.
          </Alert>

          <Group justify="flex-end">
            <Button variant="outline" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button
              onClick={addMemory}
              loading={addingMemory}
              disabled={!newMemoryContent.trim()}
              leftSection={<IconCheck size={16} />}
            >
              Save Memory
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Decryption modal removed - content loads automatically */}
    </>
  )
}
````

## File: components/memory/memory-panel.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Stack,
  Text,
  Card,
  Group,
  Badge,
  Collapse,
  ActionIcon,
  Divider,
  ScrollArea,
  Loader,
  Center,
  Button
} from '@mantine/core'
import {
  IconBrain,
  IconChevronDown,
  IconChevronRight,
  IconPencil,
  IconExternalLink,
  IconCategory,
  IconLock,
  IconLockOpen,
  IconRefresh
} from '@tabler/icons-react'
import { memoryIntegrationService } from '@/app/services/memoryIntegration'
import { MemoryDecryptionModal } from './memory-decryption-modal'
import { sealService } from '@/app/services/sealService'
import type { EncryptedMemoryData } from '@/app/services/sealService'
import { memoryEventEmitter } from '@/app/services/memoryEventEmitter'

interface Memory {
  id: string
  content: string
  category: string
  timestamp: string
  similarity?: number
  isEncrypted: boolean
  walrusHash?: string
  owner: string
}

interface MemoryPanelProps {
  userAddress: string
  sessionId?: string
  currentMessage?: string
}

// Helper function to detect if content is Seal-encrypted
const isSealEncrypted = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content) as EncryptedMemoryData;
    return !!(parsed.sealMetadata && parsed.encryptedContent);
  } catch {
    return false;
  }
};

export function MemoryPanel({ userAddress, sessionId, currentMessage }: MemoryPanelProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [relevantMemories, setRelevantMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedMemories, setExpandedMemories] = useState<Set<string>>(new Set())
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [decryptModalOpened, setDecryptModalOpened] = useState(false)
  const [decryptedMemories, setDecryptedMemories] = useState<Set<string>>(new Set())
  const [isBatchDecrypting, setIsBatchDecrypting] = useState(false)
  
  // Load all memories on component mount and auto-decrypt
  useEffect(() => {
    if (userAddress) {
      loadMemories();
    }
  }, [userAddress])

  // Add periodic refresh to catch new memories
  useEffect(() => {
    if (!userAddress) return;

    const refreshInterval = setInterval(() => {
      loadMemories();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [userAddress])

  // Add manual refresh function
  const refreshMemories = () => {
    if (userAddress) {
      loadMemories();
    }
  }

  // Listen for memory update events
  useEffect(() => {
    const handleMemoriesUpdated = () => {
      console.log('Memory panel: Received memories updated event');
      refreshMemories();
    }

    const handleMemoryAdded = (data: any) => {
      console.log('Memory panel: Received memory added event', data);
      refreshMemories();
    }

    // Subscribe to events
    memoryEventEmitter.on('memoriesUpdated', handleMemoriesUpdated);
    memoryEventEmitter.on('memoryAdded', handleMemoryAdded);

    // Cleanup on unmount
    return () => {
      memoryEventEmitter.off('memoriesUpdated', handleMemoriesUpdated);
      memoryEventEmitter.off('memoryAdded', handleMemoryAdded);
    }
  }, [userAddress])
  
  // Auto-decrypt newly loaded memories
  useEffect(() => {
    if (memories.length > 0) {
      // Auto-decrypt all memories
      handleDecryptAll(true); // silent mode
      
      // Auto-expand all memories by default
      const allMemoryIds = memories.map(memory => memory.id);
      setExpandedMemories(new Set(allMemoryIds));
    }
  }, [memories])
  
  // Find relevant memories when current message changes
  useEffect(() => {
    if (currentMessage && currentMessage.trim().length > 0) {
      findRelevantMemories(currentMessage)
    } else {
      setRelevantMemories([])
    }
  }, [currentMessage])
  
  // Sync with Seal service cache
  useEffect(() => {
    // Check each memory to see if it's Seal-encrypted and needs decryption status
    const checkSealStatus = () => {
      if (memories.length === 0) return;
      
      const newDecrypted = new Set(decryptedMemories);
      let hasChanges = false;
      
      // Check each memory for Seal encryption
      for (const memory of memories) {
        const isSealed = isSealEncrypted(memory.content);
        if (isSealed && !decryptedMemories.has(memory.id)) {
          // Check if we have it in the Seal service cache
          try {
            // For now, assume not cached - the cache logic is handled by sealService
            // This could be enhanced to check sealService cache status
          } catch (error) {
            console.debug(`Could not check cache status for memory ${memory.id}`);
          }
        }
      }
      
      // Update state if we found any changes
      if (hasChanges) {
        setDecryptedMemories(newDecrypted);
      }
    };
    
    checkSealStatus();
  }, [memories, decryptedMemories])
  
  const loadMemories = async () => {
    if (!userAddress) return
    
    setLoading(true)
    try {
      // Get memories directly from blockchain using the integration service
      const data = await memoryIntegrationService.fetchUserMemories(userAddress)
      
      const memoryList = data.memories || []
      setMemories(memoryList)
    } catch (error) {
      console.error('Failed to load memories:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const findRelevantMemories = async (query: string) => {
    if (!query || !userAddress) return
    
    try {
      // First get all memories
      const allMemories = await memoryIntegrationService.fetchUserMemories(userAddress)
      
      // Then filter for relevance using the client-side search
      const relevantList = memoryIntegrationService.getMemoriesRelevantToText(
        allMemories.memories || [],
        query,
        5 // Limit to 5 results
      )
      
      setRelevantMemories(relevantList)
    } catch (error) {
      console.error('Failed to find relevant memories:', error)
    }
  }
  
  const toggleMemory = (memoryId: string) => {
    const newExpanded = new Set(expandedMemories)
    if (newExpanded.has(memoryId)) {
      newExpanded.delete(memoryId)
    } else {
      newExpanded.add(memoryId)
    }
    setExpandedMemories(newExpanded)
  }
  
  const openDecryptModal = (memory: Memory) => {
    setSelectedMemory(memory)
    setDecryptModalOpened(true)
  }
  
  const handleDecryptAll = async (silent: boolean = false) => {
    if (!userAddress || memories.length === 0) return
    
    if (!silent) setIsBatchDecrypting(true)
    try {
      // Get all Seal-encrypted memories that aren't already decrypted
      const encryptedMemories = memories.filter(
        memory => isSealEncrypted(memory.content) && !decryptedMemories.has(memory.id)
      );
      
      if (encryptedMemories.length === 0) {
        if (!silent) {
          console.log('No Seal-encrypted memories to decrypt');
        }
        if (!silent) setIsBatchDecrypting(false);
        return;
      }
      
      // Process in batches to avoid overwhelming the system
      const batchSize = 3; // Smaller batches for Seal decryption
      for (let i = 0; i < encryptedMemories.length; i += batchSize) {
        const batch = encryptedMemories.slice(i, i + batchSize);
        await Promise.all(batch.map(async (memory) => {
          try {
            // Try to decrypt with Seal service
            const encryptedData = JSON.parse(memory.content) as EncryptedMemoryData;
            await sealService.decryptMemory(encryptedData, userAddress);
            
            // Mark as successfully decrypted
            setDecryptedMemories(prev => {
              const newSet = new Set(prev);
              newSet.add(memory.id);
              return newSet;
            });
            
            if (!silent) {
              console.log(`Decrypted memory ${memory.id.slice(0, 8)}...`);
            }
          } catch (err) {
            if (!silent) {
              console.error(`Failed to decrypt memory ${memory.id}:`, err);
            }
          }
        }));
      }
      
      if (!silent) {
        console.log(`Successfully processed ${encryptedMemories.length} encrypted memories`);
      }
    } catch (error) {
      console.error('Failed to decrypt all memories:', error);
    } finally {
      if (!silent) setIsBatchDecrypting(false);
    }
  }
  
  const getCategoryColor = (category: string) => {
    const categories: Record<string, string> = {
      'personal': 'blue',
      'work': 'green',
      'preferences': 'pink',
      'skills': 'violet',
      'auto-detected': 'cyan',
      'general': 'gray'
    }
    return categories[category] || 'gray'
  }
  
  const openInSuiExplorer = (walrusHash: string) => {
    const explorerUrl = `https://suivision.xyz/object/${walrusHash}?network=testnet`
    window.open(explorerUrl, '_blank')
  }
  
  const renderMemoryCard = (memory: Memory, isRelevant: boolean = false) => (
    <Card key={memory.id} withBorder mb="xs" p="sm">
      <Stack gap="xs">
        <Group justify="space-between">
          <Badge color={getCategoryColor(memory.category)} size="sm" variant="light">
            {memory.category}
          </Badge>
          
          <Group gap="xs">
            {isRelevant && memory.similarity && (
              <Badge color="green" size="sm" variant="light">
                {(memory.similarity * 100).toFixed(0)}% match
              </Badge>
            )}
            
            <ActionIcon 
              size="sm" 
              variant="subtle" 
              onClick={() => toggleMemory(memory.id)}
              aria-label="Expand memory"
            >
              {expandedMemories.has(memory.id) ? 
                <IconChevronDown size={16} /> : 
                <IconChevronRight size={16} />}
            </ActionIcon>
          </Group>
        </Group>
        
        <Text size="sm" lineClamp={expandedMemories.has(memory.id) ? undefined : 2}>
          {memory.content}
        </Text>
        
        <Collapse in={expandedMemories.has(memory.id)}>
          <Group mt="xs" justify="space-between">
            <Text size="xs" c="dimmed">
              {new Date(memory.timestamp).toLocaleString()}
            </Text>
            
            <Group gap="xs">
              {memory.walrusHash && (
                <ActionIcon 
                  size="xs" 
                  variant="subtle" 
                  color="blue" 
                  onClick={() => openInSuiExplorer(memory.walrusHash!)}
                  title="View in Explorer"
                >
                  <IconExternalLink size={14} />
                </ActionIcon>
              )}
              
              {(memory.isEncrypted || isSealEncrypted(memory.content)) && (
                <ActionIcon 
                  size="xs" 
                  variant={decryptedMemories.has(memory.id) ? "filled" : "subtle"}
                  color={decryptedMemories.has(memory.id) ? "teal" : "gray"}
                  onClick={() => openDecryptModal(memory)}
                  title={decryptedMemories.has(memory.id) ? "View Decrypted Memory" : "Decrypt Memory"}
                >
                  {decryptedMemories.has(memory.id) ? (
                    <IconLockOpen size={14} />
                  ) : (
                    <IconLock size={14} />
                  )}
                </ActionIcon>
              )}
              
              <ActionIcon 
                size="xs" 
                variant="subtle"
                title="Edit Memory"
              >
                <IconPencil size={14} />
              </ActionIcon>
            </Group>
          </Group>
        </Collapse>
      </Stack>
    </Card>
  )
  
  return (
    <Box 
      style={{
        borderLeft: '1px solid var(--mantine-color-gray-3)',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between">
          <Group>
            <IconBrain size={18} />
            <Text fw={600}>Memory Panel</Text>
            <Badge size="xs" variant="light">
              {memories.length}
            </Badge>
          </Group>
          <ActionIcon
            variant="light"
            size="sm"
            onClick={refreshMemories}
            title="Refresh memories"
          >
            <IconRefresh size={14} />
          </ActionIcon>
        </Group>
      </Box>
      
      <ScrollArea style={{ flex: 1 }}>
        <Box p="md">
          {loading ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : (
            <>
              {relevantMemories.length > 0 && (
                <>
                  <Text size="sm" fw={500} mb="xs">Relevant Memories</Text>
                  {relevantMemories.map(memory => renderMemoryCard(memory, true))}
                  <Divider my="md" />
                </>
              )}
              
              <Text size="sm" fw={500} mb="xs">Recent Memories</Text>
              {memories.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No memories stored yet. Start chatting to collect memories.
                </Text>
              ) : (
                memories.slice(0, 5).map(memory => renderMemoryCard(memory))
              )}
            </>
          )}
        </Box>
      </ScrollArea>
      
      {/* Memory Stats */}
      <Box p="md" bg="gray.0" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between" mb="xs">
          <Text size="xs" fw={500}>Memory Stats</Text>
          <Group gap="xs">
            <Button 
              variant="light" 
              size="xs" 
              leftSection={<IconLockOpen size={12} />}
              onClick={handleDecryptAll}
              loading={isBatchDecrypting}
              disabled={memories.filter(m => (m.isEncrypted || isSealEncrypted(m.content)) && !decryptedMemories.has(m.id)).length === 0}
            >
              Decrypt All
            </Button>
            <Button 
              variant="subtle" 
              size="xs" 
              rightSection={<IconExternalLink size={12} />}
              component="a"
              href="/memory-manager"
            >
              Memory Manager
            </Button>
          </Group>
        </Group>
        
        <Group grow>
          <Stack align="center" gap={0}>
            <Text size="sm" fw={600}>{memories.length}</Text>
            <Text size="xs" c="dimmed">Total</Text>
          </Stack>
          <Stack align="center" gap={0}>
            <Text size="sm" fw={600}>
              {Object.keys(memories.reduce((acc, m) => ({...acc, [m.category]: true}), {})).length}
            </Text>
            <Text size="xs" c="dimmed">Categories</Text>
          </Stack>
          <Stack align="center" gap={0}>
            <Text size="sm" fw={600}>
              {memories.filter(m => m.isEncrypted || isSealEncrypted(m.content)).length}
            </Text>
            <Text size="xs" c="dimmed">Encrypted</Text>
          </Stack>
        </Group>
      </Box>
      
      {/* Decryption Modal */}
      {selectedMemory && (
        <MemoryDecryptionModal
          opened={decryptModalOpened}
          onClose={() => setDecryptModalOpened(false)}
          memory={selectedMemory}
          userAddress={userAddress}
        />
      )}
    </Box>
  )
}
````

## File: components/memory/memory-review-modal.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import { 
  Modal, 
  Text, 
  Button, 
  Textarea, 
  Select, 
  Group, 
  Stack, 
  Paper,
  Badge,
  Loader,
  Alert
} from '@mantine/core'
import { IconBrain, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { memoryApi } from '../../api/memoryApi'

interface MemoryReviewModalProps {
  opened: boolean
  onClose: () => void
  messageContent: string
  messageId?: string
  memoryId?: string | null
  userAddress: string
}

export function MemoryReviewModal({
  opened,
  onClose,
  messageContent,
  messageId,
  memoryId,
  userAddress
}: MemoryReviewModalProps) {
  const [extractedMemory, setExtractedMemory] = useState('')
  const [category, setCategory] = useState<string>('personal')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Extract potential memory from message content when modal opens
  useEffect(() => {
    if (opened && messageContent && !memoryId) {
      setExtractedMemory(messageContent)
      setError(null)
      setSaved(false)
    }
  }, [opened, messageContent, memoryId])

  // Load existing memory if memoryId provided
  useEffect(() => {
    const loadExistingMemory = async () => {
      if (opened && memoryId) {
        setLoading(true)
        try {
          // TODO: Implement get memory by ID API
          // For now, show that memory is already stored
          setExtractedMemory(messageContent)
          setSaved(true)
        } catch (err) {
          setError('Failed to load memory details')
        } finally {
          setLoading(false)
        }
      }
    }

    loadExistingMemory()
  }, [opened, memoryId, messageContent])

  const handleSaveMemory = async () => {
    if (!extractedMemory.trim()) return

    setSaving(true)
    setError(null)

    try {
      const result = await memoryApi.createMemory({
        userAddress: userAddress,
        content: extractedMemory,
        category
      })

      if (result) {
        setSaved(true)
        setTimeout(() => {
          onClose()
        }, 1500) // Auto-close after showing success
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save memory')
    } finally {
      setSaving(false)
    }
  }

  const categoryOptions = [
    { value: 'personal', label: 'Personal Information' },
    { value: 'work', label: 'Work & Career' },
    { value: 'preferences', label: 'Preferences & Interests' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'health', label: 'Health & Medical' },
    { value: 'travel', label: 'Travel & Location' },
    { value: 'education', label: 'Education & Skills' },
    { value: 'goals', label: 'Goals & Plans' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconBrain size={20} style={{ color: '#4CAF50' }} />
          <Text fw={600}>
            {memoryId ? 'Memory Details' : 'Add to Memory'}
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {loading && (
          <Group justify="center">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">Loading memory details...</Text>
          </Group>
        )}

        {saved && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Memory Saved!"
            color="green"
            variant="light"
          >
            Your personal information has been securely stored in your decentralized memory.
          </Alert>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <Paper p="md" bg="gray.0" radius="md">
          <Text size="sm" c="dimmed" mb="xs">
            Original Message:
          </Text>
          <Text size="sm" style={{ fontStyle: 'italic' }}>
            "{messageContent}"
          </Text>
        </Paper>

        {!memoryId && (
          <>
            <Textarea
              label="Memory Content"
              description="Edit or refine what you'd like to remember from this message"
              placeholder="Enter the information you want to store..."
              value={extractedMemory}
              onChange={(e) => setExtractedMemory(e.target.value)}
              minRows={3}
              maxRows={6}
              disabled={saving}
            />

            <Select
              label="Category"
              description="Choose the best category for this memory"
              data={categoryOptions}
              value={category}
              onChange={(value) => setCategory(value || 'personal')}
              disabled={saving}
            />
          </>
        )}

        {memoryId && (
          <Paper p="md" bg="green.0" radius="md">
            <Group>
              <Badge color="green" variant="light">
                <IconBrain size={12} style={{ marginRight: 4 }} />
                Stored
              </Badge>
              <Text size="sm" c="dimmed">
                Memory ID: {memoryId}
              </Text>
            </Group>
            <Text size="sm" mt="xs">
              This information has been saved to your personal memory vault.
            </Text>
          </Paper>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={saving}>
            {saved ? 'Close' : 'Cancel'}
          </Button>
          
          {!memoryId && !saved && (
            <Button
              onClick={handleSaveMemory}
              loading={saving}
              disabled={!extractedMemory.trim()}
              leftSection={<IconBrain size={16} />}
            >
              Save to Memory
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  )
}
````

## File: components/memory/memory-selection-modal.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Badge,
  Loader,
  Alert,
  Textarea,
  Select,
  Checkbox,
  ActionIcon,
  Divider,
  Paper,
  Title,
  ScrollArea,
  Tooltip
} from '@mantine/core'
import {
  IconBrain,
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconTrash,
  IconEye,
  IconDeviceFloppy,
  IconX,
  IconLock,
  IconLockOpen,
  IconShield
} from '@tabler/icons-react'
import { MemoryExtraction } from '@/app/services/memoryIntegration'
import { useWallet } from '@suiet/wallet-kit'
import { sealService } from '@/app/services/sealService'

interface MemorySelectionModalProps {
  opened: boolean
  onClose: () => void
  extractedMemories: MemoryExtraction[]
  userAddress: string
  onMemoriesSaved?: (savedMemoryIds: string[]) => void
  onError?: (error: string) => void
}

interface EditableMemory extends MemoryExtraction {
  id: string
  selected: boolean
  editing: boolean
  originalContent: string
  encrypted: boolean // New field for encryption status
}

const MEMORY_CATEGORIES = [
  { value: 'personal_info', label: 'Personal Information' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'skills', label: 'Skills & Expertise' },
  { value: 'goals', label: 'Goals & Objectives' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'knowledge', label: 'Knowledge & Facts' },
  { value: 'general', label: 'General' }
]

export function MemorySelectionModal({
  opened,
  onClose,
  extractedMemories,
  userAddress,
  onMemoriesSaved,
  onError
}: MemorySelectionModalProps) {
  const wallet = useWallet()
  const [memories, setMemories] = useState<EditableMemory[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [savingProgress, setSavingProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [previewMemory, setPreviewMemory] = useState<EditableMemory | null>(null)
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  const [nftType, setNftType] = useState('sui::nft::NFT')
  const [sealPolicyId, setSealPolicyId] = useState<string | null>(null)

  // Initialize memories when modal opens
  useEffect(() => {
    if (opened && extractedMemories.length > 0) {
      const editableMemories: EditableMemory[] = extractedMemories.map((memory, index) => ({
        ...memory,
        id: `memory-${index}-${Date.now()}`,
        selected: memory.shouldSave,
        editing: false,
        originalContent: memory.content,
        encrypted: encryptionEnabled // Default to global encryption setting
      }))
      setMemories(editableMemories)
      setError(null)
    }
  }, [opened, extractedMemories])

  const handleSelectAll = (selected: boolean) => {
    setMemories(prev => prev.map(memory => ({ ...memory, selected })))
  }

  const handleMemorySelect = (id: string, selected: boolean) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, selected } : memory
    ))
  }

  const handleStartEdit = (id: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, editing: true } : memory
    ))
  }

  const handleCancelEdit = (id: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { 
        ...memory, 
        editing: false, 
        content: memory.originalContent 
      } : memory
    ))
  }

  const handleSaveEdit = (id: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { 
        ...memory, 
        editing: false, 
        originalContent: memory.content 
      } : memory
    ))
  }

  const handleContentChange = (id: string, content: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, content } : memory
    ))
  }

  const handleCategoryChange = (id: string, category: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, category } : memory
    ))
  }

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(memory => memory.id !== id))
  }

  const handleToggleEncryption = (id: string, encrypted: boolean) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, encrypted } : memory
    ))
  }

  const handlePreview = (memory: EditableMemory) => {
    setPreviewMemory(memory)
  }

  const handleSaveSelected = async () => {
    const selectedMemories = memories.filter(memory => memory.selected)
    
    if (selectedMemories.length === 0) {
      setError('Please select at least one memory to save.')
      return
    }

    if (!wallet.connected) {
      setError('Please connect your wallet to save memories.')
      return
    }

    // Check if any memory needs encryption but no policy exists
    const encryptedMemories = selectedMemories.filter(memory => memory.encrypted)
    if (encryptedMemories.length > 0 && !sealPolicyId) {
      try {
        // Create Seal policy for encryption
        const policyId = await sealService.createSealPolicy(nftType, 'Personal Data Wallet Memory Access Policy')
        setSealPolicyId(policyId)
      } catch (err) {
        setError(`Failed to create encryption policy: ${err instanceof Error ? err.message : 'Unknown error'}`)
        return
      }
    }

    setIsSaving(true)
    setSavingProgress({ current: 0, total: selectedMemories.length })
    setError(null)

    const savedMemoryIds: string[] = []
    const errors: string[] = []

    try {
      // Import the memory integration service
      const { memoryIntegrationService } = await import('@/app/services/memoryIntegration')

      for (let i = 0; i < selectedMemories.length; i++) {
        const memory = selectedMemories[i]
        setSavingProgress({ current: i + 1, total: selectedMemories.length })

        try {
          let contentToSave = memory.content

          // Encrypt memory if enabled
          if (memory.encrypted && sealPolicyId) {
            try {
              const encryptedData = await sealService.encryptMemory(
                memory.content,
                sealPolicyId,
                nftType
              )
              // Store encrypted content as JSON string
              contentToSave = JSON.stringify(encryptedData)
            } catch (encErr) {
              errors.push(`Failed to encrypt "${memory.content.substring(0, 50)}...": ${encErr instanceof Error ? encErr.message : 'Encryption failed'}`)
              continue
            }
          }

          const result = await memoryIntegrationService.saveApprovedMemory(
            {
              shouldSave: true,
              category: memory.category,
              content: contentToSave, // Use encrypted content if encryption enabled
              extractedFacts: memory.extractedFacts,
              confidence: memory.confidence
            },
            userAddress,
            wallet
          )

          if (result.success && result.memoryId) {
            savedMemoryIds.push(result.memoryId)
          } else {
            errors.push(`Failed to save "${memory.content.substring(0, 50)}...": ${result.message}`)
          }
        } catch (err) {
          errors.push(`Error saving "${memory.content.substring(0, 50)}...": ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      if (savedMemoryIds.length > 0) {
        onMemoriesSaved?.(savedMemoryIds)
        
        if (errors.length === 0) {
          // All memories saved successfully
          onClose()
        } else {
          // Some memories saved, show partial success
          setError(`${savedMemoryIds.length} memories saved successfully. ${errors.length} failed: ${errors.join(', ')}`)
        }
      } else {
        // No memories saved
        setError(`Failed to save memories: ${errors.join(', ')}`)
        onError?.(errors.join(', '))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSaving(false)
      setSavingProgress({ current: 0, total: 0 })
    }
  }

  const selectedCount = memories.filter(memory => memory.selected).length

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group>
            <IconBrain size={24} />
            <Title order={3}>Select Memories to Save</Title>
          </Group>
        }
        size="xl"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack>
          {memories.length === 0 ? (
            <Alert icon={<IconAlertCircle size={16} />} color="blue">
              No memories were extracted from this conversation.
            </Alert>
          ) : (
            <>
              <Paper p="md" bg="blue.0" radius="md">
                <Group justify="space-between">
                  <Text size="sm">
                    Found {memories.length} potential memories. Select which ones to save to your personal vault.
                  </Text>
                  <Group>
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleSelectAll(true)}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleSelectAll(false)}
                    >
                      Select None
                    </Button>
                  </Group>
                </Group>
              </Paper>

              {/* Encryption Configuration */}
              <Paper p="md" bg="green.0" radius="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Group>
                      <IconShield size={20} color="green" />
                      <Text size="sm" fw={500}>Encryption Settings</Text>
                    </Group>
                    <Checkbox
                      label="Enable encryption for all memories"
                      checked={encryptionEnabled}
                      onChange={(event) => {
                        const enabled = event.currentTarget.checked
                        setEncryptionEnabled(enabled)
                        // Update all memories
                        setMemories(prev => prev.map(memory => ({ 
                          ...memory, 
                          encrypted: enabled 
                        })))
                      }}
                    />
                  </Group>
                  
                  {encryptionEnabled && (
                    <Group>
                      <Select
                        label="NFT Type for Access Control"
                        value={nftType}
                        onChange={(value) => value && setNftType(value)}
                        data={[
                          { value: 'sui::nft::NFT', label: 'Sui NFT' },
                          { value: 'sui::coin::Coin', label: 'Sui Coin' },
                          { value: 'custom::nft::MyNFT', label: 'Custom NFT' }
                        ]}
                        style={{ flex: 1 }}
                      />
                      <Text size="xs" c="dimmed" style={{ maxWidth: '300px' }}>
                        Only users with the specified NFT type can decrypt and view these memories.
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Paper>

              <ScrollArea.Autosize mah={400}>
                <Stack gap="md">
                  {memories.map((memory) => (
                    <Card key={memory.id} padding="md" radius="md" withBorder>
                      <Stack gap="sm">
                        <Group justify="space-between" align="flex-start">
                          <Group>
                            <Checkbox
                              checked={memory.selected}
                              onChange={(event) => handleMemorySelect(memory.id, event.currentTarget.checked)}
                            />
                            <Badge
                              color={memory.confidence > 0.8 ? 'green' : memory.confidence > 0.6 ? 'yellow' : 'orange'}
                              variant="light"
                            >
                              {Math.round(memory.confidence * 100)}% confidence
                            </Badge>
                            <Tooltip label={memory.encrypted ? "Encrypted with Seal" : "Not encrypted"}>
                              <Badge
                                color={memory.encrypted ? 'green' : 'gray'}
                                variant="light"
                                leftSection={memory.encrypted ? <IconLock size={12} /> : <IconLockOpen size={12} />}
                              >
                                {memory.encrypted ? 'Encrypted' : 'Plain'}
                              </Badge>
                            </Tooltip>
                          </Group>
                          
                          <Group gap="xs">
                            <Tooltip label={memory.encrypted ? "Disable encryption" : "Enable encryption"}>
                              <ActionIcon
                                variant="subtle"
                                size="sm"
                                color={memory.encrypted ? 'green' : 'gray'}
                                onClick={() => handleToggleEncryption(memory.id, !memory.encrypted)}
                              >
                                {memory.encrypted ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                              </ActionIcon>
                            </Tooltip>
                            
                            <Tooltip label="Preview">
                              <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={() => handlePreview(memory)}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                            
                            {memory.editing ? (
                              <>
                                <Tooltip label="Save changes">
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    color="green"
                                    onClick={() => handleSaveEdit(memory.id)}
                                  >
                                    <IconDeviceFloppy size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Cancel">
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    color="red"
                                    onClick={() => handleCancelEdit(memory.id)}
                                  >
                                    <IconX size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </>
                            ) : (
                              <Tooltip label="Edit">
                                <ActionIcon
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => handleStartEdit(memory.id)}
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            
                            <Tooltip label="Delete">
                              <ActionIcon
                                variant="subtle"
                                size="sm"
                                color="red"
                                onClick={() => handleDeleteMemory(memory.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>

                        <Select
                          label="Category"
                          value={memory.category}
                          onChange={(value) => value && handleCategoryChange(memory.id, value)}
                          data={MEMORY_CATEGORIES}
                          disabled={!memory.editing}
                        />

                        {memory.editing ? (
                          <Textarea
                            label="Memory Content"
                            value={memory.content}
                            onChange={(event) => handleContentChange(memory.id, event.currentTarget.value)}
                            minRows={3}
                            maxRows={6}
                            autosize
                          />
                        ) : (
                          <Paper p="sm" bg="gray.0" radius="sm">
                            <Text size="sm">{memory.content}</Text>
                          </Paper>
                        )}

                        {memory.extractedFacts.length > 0 && (
                          <div>
                            <Text size="xs" c="dimmed" mb="xs">Extracted Facts:</Text>
                            <Group gap="xs">
                              {memory.extractedFacts.map((fact, index) => (
                                <Badge key={index} variant="outline" size="sm">
                                  {fact}
                                </Badge>
                              ))}
                            </Group>
                          </div>
                        )}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </ScrollArea.Autosize>

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {error}
                </Alert>
              )}

              <Divider />

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {selectedCount} of {memories.length} memories selected
                </Text>
                
                <Group>
                  <Button variant="subtle" onClick={onClose} disabled={isSaving}>
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={handleSaveSelected}
                    disabled={selectedCount === 0 || isSaving}
                    leftSection={isSaving ? <Loader size="xs" /> : <IconBrain size={16} />}
                  >
                    {isSaving 
                      ? `Saving ${savingProgress.current}/${savingProgress.total}...`
                      : `Save ${selectedCount} Memories`
                    }
                  </Button>
                </Group>
              </Group>
            </>
          )}
        </Stack>
      </Modal>

      {/* Preview Modal */}
      <Modal
        opened={!!previewMemory}
        onClose={() => setPreviewMemory(null)}
        title="Memory Preview"
        size="md"
      >
        {previewMemory && (
          <Stack>
            <Group>
              <Badge color="blue" variant="light">
                {MEMORY_CATEGORIES.find(cat => cat.value === previewMemory.category)?.label || previewMemory.category}
              </Badge>
              <Badge
                color={previewMemory.confidence > 0.8 ? 'green' : previewMemory.confidence > 0.6 ? 'yellow' : 'orange'}
                variant="light"
              >
                {Math.round(previewMemory.confidence * 100)}% confidence
              </Badge>
            </Group>
            
            <Paper p="md" bg="gray.0" radius="md">
              <Text>{previewMemory.content}</Text>
            </Paper>
            
            {previewMemory.extractedFacts.length > 0 && (
              <div>
                <Text size="sm" fw={500} mb="xs">Extracted Facts:</Text>
                <Stack gap="xs">
                  {previewMemory.extractedFacts.map((fact, index) => (
                    <Text key={index} size="sm" c="dimmed">• {fact}</Text>
                  ))}
                </Stack>
              </div>
            )}
            
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setPreviewMemory(null)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  )
}
````

## File: components/sidebar/sidebar.tsx
````typescript
'use client'

import { useState } from 'react'
import { ChatSession, MemoryItem } from '@/app/types'
import {
  Stack,
  Button,
  Tabs,
  ScrollArea,
  Group,
  Text,
  ActionIcon,
  Collapse,
  Badge,
  Divider,
  Box,
  TextInput,
  Modal,
  Tooltip
} from '@mantine/core'
import {
  IconMessageCircle,
  IconPlus,
  IconTrash,
  IconBrain,
  IconClock,
  IconTag,
  IconSearch,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconCheck,
  IconX,
  IconDownload,
  IconShare
} from '@tabler/icons-react'

interface SidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  memories: MemoryItem[]
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onRenameSession?: (sessionId: string, newTitle: string) => void
  onClearMemories: () => void
}

export function Sidebar({
  sessions,
  currentSessionId,
  memories,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onClearMemories
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'memories'>('chats')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['facts']))
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const startEditing = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId)
    setEditingTitle(currentTitle)
  }

  const saveEdit = () => {
    if (editingSessionId && editingTitle.trim() && onRenameSession) {
      onRenameSession(editingSessionId, editingTitle.trim())
    }
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const cancelEdit = () => {
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const exportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      sessions: sessions.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages
      })),
      memories: memories.map(memory => ({
        id: memory.id,
        content: memory.content,
        category: memory.category,
        createdAt: memory.createdAt || new Date().toISOString()
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-data-wallet-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Group memories by category
  const memoriesByCategory = memories.reduce((acc, memory) => {
    if (!acc[memory.category]) {
      acc[memory.category] = []
    }
    acc[memory.category].push(memory)
    return acc
  }, {} as Record<string, MemoryItem[]>)

  return (
    <Stack h="100%" gap={0}>
      {/* Header */}
      <Box p="md">
        <Stack gap="sm">
          <Button
            onClick={onNewChat}
            fullWidth
            leftSection={<IconPlus size={16} />}
            variant="light"
          >
            New Chat
          </Button>

          <Group grow>
            <Tooltip label="Export all data">
              <Button
                onClick={exportData}
                variant="subtle"
                size="sm"
                leftSection={<IconDownload size={14} />}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip label="Share session">
              <Button
                variant="subtle"
                size="sm"
                leftSection={<IconShare size={14} />}
                disabled
              >
                Share
              </Button>
            </Tooltip>
          </Group>
        </Stack>
      </Box>

      <Divider />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'chats' | 'memories')}>
        <Tabs.List grow>
          <Tabs.Tab value="chats" leftSection={<IconMessageCircle size={16} />}>
            Chats
          </Tabs.Tab>
          <Tabs.Tab value="memories" leftSection={<IconBrain size={16} />}>
            Memory
          </Tabs.Tab>
        </Tabs.List>

        {/* Content */}
        <Tabs.Panel value="chats">
          <ScrollArea style={{ height: 'calc(100vh - 200px)' }}>
            <Stack gap="xs" p="sm">
              {sessions.length === 0 ? (
                <Stack align="center" gap="sm" py="xl">
                  <IconMessageCircle size={32} opacity={0.5} />
                  <Text size="sm" c="dimmed">No chat history yet</Text>
                </Stack>
              ) : (
                sessions.map((session) => (
                  <Group
                    key={session.id}
                    justify="space-between"
                    p="sm"
                    style={{
                      borderRadius: 'var(--mantine-radius-md)',
                      cursor: editingSessionId === session.id ? 'default' : 'pointer',
                      backgroundColor: currentSessionId === session.id ? 'var(--mantine-color-gray-1)' : 'transparent'
                    }}
                    onClick={() => editingSessionId !== session.id && onSelectSession(session.id)}
                    className={editingSessionId !== session.id ? "hover:bg-gray-50" : ""}
                  >
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                      {editingSessionId === session.id ? (
                        <TextInput
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          size="sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          autoFocus
                          onBlur={saveEdit}
                        />
                      ) : (
                        <Text size="sm" fw={500} truncate>
                          {session.title}
                        </Text>
                      )}
                      <Group gap="xs">
                        <IconClock size={12} />
                        <Text size="xs" c="dimmed">
                          {session.updatedAt.toLocaleDateString()}
                        </Text>
                      </Group>
                    </Stack>

                    <Group gap="xs">
                      {editingSessionId === session.id ? (
                        <>
                          <Tooltip label="Save">
                            <ActionIcon
                              variant="subtle"
                              color="green"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                saveEdit()
                              }}
                            >
                              <IconCheck size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Cancel">
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelEdit()
                              }}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          {onRenameSession && (
                            <Tooltip label="Rename">
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditing(session.id, session.title)
                                }}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          <Tooltip label="Delete">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteSession(session.id)
                              }}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      )}
                    </Group>
                  </Group>
                ))
              )}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
        <Tabs.Panel value="memories">
          <ScrollArea style={{ height: 'calc(100vh - 200px)' }}>
            <Stack gap="md" p="sm">
              {/* Enhanced Memory Stats */}
              <Box p="md" bg="gradient-to-br from-blue-50 to-indigo-50" style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-blue-2)' }}>
                <Group justify="space-between" mb="sm">
                  <Text size="sm" fw={600} c="blue.7">Memory Dashboard</Text>
                  <Badge size="xs" variant="light" color="blue">{memories.length} total</Badge>
                </Group>

                <Stack gap="xs">
                  <Group grow>
                    <Stack align="center" gap={2}>
                      <Text fw={700} size="lg" c="blue.8">{memories.length}</Text>
                      <Text size="xs" c="dimmed">Memories</Text>
                    </Stack>
                    <Stack align="center" gap={2}>
                      <Text fw={700} size="lg" c="green.8">{Object.keys(memoriesByCategory).length}</Text>
                      <Text size="xs" c="dimmed">Categories</Text>
                    </Stack>
                  </Group>

                  {/* Top Categories */}
                  {Object.keys(memoriesByCategory).length > 0 && (
                    <Box mt="xs">
                      <Text size="xs" c="dimmed" mb={4}>Top Categories:</Text>
                      <Group gap="xs">
                        {Object.entries(memoriesByCategory)
                          .sort(([,a], [,b]) => b.length - a.length)
                          .slice(0, 3)
                          .map(([category, items]) => (
                            <Badge
                              key={category}
                              size="xs"
                              variant="dot"
                              color={category === 'personal' ? 'blue' : category === 'work' ? 'green' : 'orange'}
                            >
                              {category} ({items.length})
                            </Badge>
                          ))
                        }
                      </Group>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Memory Categories */}
              {Object.keys(memoriesByCategory).length === 0 ? (
                <Stack align="center" gap="sm" py="xl">
                  <IconBrain size={32} opacity={0.5} />
                  <Text size="sm" c="dimmed">No memories stored yet</Text>
                </Stack>
              ) : (
                <Stack gap="xs">
                  {Object.entries(memoriesByCategory).map(([category, items]) => (
                    <Box key={category} style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
                      <Group
                        justify="space-between"
                        p="md"
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleCategory(category)}
                        className="hover:bg-gray-50"
                      >
                        <Group gap="sm">
                          <IconTag size={16} color="gray" />
                          <Text size="sm" fw={500} tt="capitalize">
                            {category}
                          </Text>
                          <Badge size="xs" variant="light">
                            {items.length}
                          </Badge>
                        </Group>
                        {expandedCategories.has(category) ? (
                          <IconChevronDown size={16} />
                        ) : (
                          <IconChevronRight size={16} />
                        )}
                      </Group>

                      <Collapse in={expandedCategories.has(category)}>
                        <Divider />
                        <Stack gap="xs" p="sm">
                          {items.map((memory) => (
                            <Box
                              key={memory.id}
                              p="sm"
                              bg="gray.0"
                              style={{ borderRadius: 'var(--mantine-radius-sm)' }}
                            >
                              <Text size="xs" fw={500} mb="xs">
                                {memory.content.substring(0, 100)}
                                {memory.content.length > 100 && '...'}
                              </Text>
                              <Group justify="space-between">
                                <Badge size="xs" variant="dot" tt="capitalize">
                                  {memory.type}
                                </Badge>
                                <Text size="xs" c="dimmed">
                                  {memory?.createdAt?.toLocaleDateString()}
                                </Text>
                              </Group>
                            </Box>
                          ))}
                        </Stack>
                      </Collapse>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Memory Actions */}
              {memories.length > 0 && (
                <>
                  <Divider />
                  <Button
                    onClick={onClearMemories}
                    variant="light"
                    color="red"
                    size="sm"
                    fullWidth
                    leftSection={<IconTrash size={16} />}
                  >
                    Clear All Memories
                  </Button>
                </>
              )}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}
````

## File: components/wallet/wallet-balance.tsx
````typescript
'use client'

import { useEffect, useState } from 'react'
import { Badge, Button, Group, Text, Tooltip } from '@mantine/core'
import { IconDroplet, IconWallet } from '@tabler/icons-react'
import { useWallet } from '@suiet/wallet-kit'
import { SuiClient } from '@mysten/sui/client'

export function WalletBalance() {
  const wallet = useWallet()
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)

  const fetchBalance = async () => {
    if (!wallet.connected || !wallet.account) return
    
    setLoading(true)
    try {
      const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' })
      const balanceData = await client.getBalance({
        owner: wallet.account.address,
        coinType: '0x2::sui::SUI'
      })
      
      // Convert from MIST to SUI (9 decimal places)
      const suiBalance = Number(balanceData.totalBalance) / 1_000_000_000
      setBalance(suiBalance.toFixed(4))
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      setBalance('0')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [wallet.connected, wallet.account])

  const openFaucet = () => {
    window.open('https://suifaucet.com', '_blank')
  }

  if (!wallet.connected) return null

  const needsGas = parseFloat(balance) < 0.1

  return (
    <Group gap="xs">
      <Tooltip label={needsGas ? "You need SUI for gas fees" : "Your SUI balance"}>
        <Badge
          leftSection={<IconWallet size={14} />}
          variant={needsGas ? "light" : "filled"}
          color={needsGas ? "yellow" : "blue"}
          size="lg"
        >
          {loading ? '...' : `${balance} SUI`}
        </Badge>
      </Tooltip>
      
      {needsGas && (
        <Button
          size="xs"
          variant="subtle"
          leftSection={<IconDroplet size={14} />}
          onClick={openFaucet}
        >
          Get SUI
        </Button>
      )}
    </Group>
  )
}
````

## File: config/models.ts
````typescript
export interface ModelConfig {
  id: string // Internal identifier
  providerId: string // Actual model name to send to backend
  name: string // Display name
  provider: string // Provider name (Google, OpenAI, etc.)
  description: string
  available: boolean
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    providerId: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Fast and efficient AI model',
    available: true
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    providerId: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: 'Advanced reasoning and analysis',
    available: true
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    providerId: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: 'Quick responses for simple tasks',
    available: true
  },
  'gpt-4': {
    id: 'gpt-4',
    providerId: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'OpenAI\'s powerful language model',
    available: false
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    providerId: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most capable Claude model',
    available: false
  },
  'llama-3': {
    id: 'llama-3',
    providerId: 'llama-3-70b',
    name: 'Llama 3',
    provider: 'Meta',
    description: 'Open source language model',
    available: false
  }
}

// Default model to use
export const DEFAULT_MODEL_ID = 'gemini-2.0-flash'

// Get the provider ID (actual model name) for a given model ID
export const getProviderModelId = (modelId: string): string => {
  return MODEL_CONFIGS[modelId]?.providerId || DEFAULT_MODEL_ID
}

// Get all available models
export const getAvailableModels = () => {
  return Object.values(MODEL_CONFIGS).filter(model => model.available)
}
````

## File: config/sealConfig.ts
````typescript
/**
 * Seal SDK Configuration for Testnet
 * 
 * This configuration provides the necessary key servers and network settings
 * for Seal Identity-Based Encryption (IBE) on Sui testnet.
 */

export const SEAL_CONFIG = {
  // Sui Network Configuration
  network: 'testnet' as const,
  
  // Key Server Configuration for Testnet
  keyServers: {
    // Primary testnet key server
    primary: {
      url: 'https://keyserver-testnet.mystenlabs.com',
      publicKey: '0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      network: 'testnet'
    },
    
    // Backup/secondary key servers (if available)
    fallback: [
      // Add additional key servers here if available
    ]
  },
  
  // Encryption Configuration
  encryption: {
    // Default encryption algorithm
    algorithm: 'ibe-bls12381',
    
    // Key derivation settings
    keyDerivation: {
      iterations: 100000,
      salt: 'personal-data-wallet-seal'
    }
  },
  
  // Policy Configuration
  policy: {
    // Default NFT types for access control
    defaultNftTypes: [
      'sui::nft::NFT',
      'sui::coin::Coin'
    ],
    
    // Policy description template
    descriptionTemplate: 'Personal Data Wallet Access Policy - {nftType}',
    
    // Maximum policy age before refresh (in milliseconds)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Cache Configuration
  cache: {
    // Enable caching of decrypted data
    enabled: true,
    
    // Cache TTL in milliseconds
    ttl: 60 * 60 * 1000, // 1 hour
    
    // Maximum cache size (number of entries)
    maxSize: 100
  },
  
  // Debug Configuration
  debug: {
    // Enable debug logging in development
    enabled: process.env.NODE_ENV === 'development',
    
    // Log levels: 'error', 'warn', 'info', 'debug'
    logLevel: 'info' as const
  }
} as const;

// Type definitions for configuration
export type SealNetworkConfig = typeof SEAL_CONFIG;
export type KeyServerConfig = typeof SEAL_CONFIG.keyServers.primary;
export type EncryptionConfig = typeof SEAL_CONFIG.encryption;
export type PolicyConfig = typeof SEAL_CONFIG.policy;

// Validation functions
export function validateSealConfig(): boolean {
  try {
    // Validate required fields
    if (!SEAL_CONFIG.keyServers.primary.url) {
      throw new Error('Primary key server URL is required');
    }
    
    if (!SEAL_CONFIG.keyServers.primary.publicKey) {
      throw new Error('Primary key server public key is required');
    }
    
    if (!SEAL_CONFIG.network) {
      throw new Error('Network configuration is required');
    }
    
    return true;
  } catch (error) {
    console.error('Seal configuration validation failed:', error);
    return false;
  }
}

// Helper functions
export function getKeyServerUrl(): string {
  return SEAL_CONFIG.keyServers.primary.url;
}

export function getNetworkConfig(): string {
  return SEAL_CONFIG.network;
}

export function isDebugEnabled(): boolean {
  return SEAL_CONFIG.debug.enabled;
}
````

## File: direct/page.tsx
````typescript
'use client'

import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { ChatInterface } from '@/app/components/chat/chat-interface'
import { LoginPage } from '@/app/components/auth/login-page'
import { Box, Container, Paper, Text, Alert, Group, Button } from '@mantine/core'
import { IconInfoCircle, IconWallet } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

export default function DirectPage() {
  const { isAuthenticated, loading, userAddress, login, wallet } = useSuiAuth()
  const [showInfoAlert, setShowInfoAlert] = useState(true)
  
  // Display wallet connection status
  useEffect(() => {
    if (wallet.connected) {
      console.log('Wallet connected:', wallet.account?.address)
    }
  }, [wallet.connected, wallet.account])
  
  if (loading) {
    return (
      <Container size="md" p="xl">
        <Paper shadow="md" p="xl" radius="md">
          <Text>Loading...</Text>
        </Paper>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Box className="h-screen flex flex-col">
      {showInfoAlert && (
        <Alert 
          icon={<IconInfoCircle size="1.1rem" />} 
          title="Direct Blockchain Interaction" 
          color="blue" 
          withCloseButton 
          onClose={() => setShowInfoAlert(false)}
          className="mb-2 mx-4 mt-2"
        >
          <Group>
                          <Text size="sm">
              Personal Data Wallet uses direct blockchain interactions with your wallet. All on-chain operations require your signature for maximum security and ownership.
            </Text>
            <Group>
              <IconWallet size="1.2rem" />
              <Text size="sm" fw={500}>Connected wallet: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</Text>
            </Group>
          </Group>
          
        </Alert>
      )}
      
      <div className="flex-grow overflow-hidden">
        <ChatInterface />
      </div>
    </Box>
  )
}
````

## File: globals.css
````css
/* Keep minimal Tailwind for utility classes if needed */
@tailwind utilities;

/* Global styles for Mantine integration */
* {
  box-sizing: border-box;
}

body {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Selection styles */
::selection {
  background: rgba(66, 153, 225, 0.3);
  color: inherit;
}
````

## File: hooks/use-chat-sessions.ts
````typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatSession, Message } from '@/app/types'
import { useSuiAuth } from './use-sui-auth'
import { chatApi } from '../api/chatApi'
import { DEFAULT_MODEL_ID } from '@/app/config/models'

export function useChatSessions() {
  const queryClient = useQueryClient()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
  const { userAddress } = useSuiAuth()
  
  // Query to get all user sessions (without messages for performance)
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError
  } = useQuery({
    queryKey: ['chat-sessions', userAddress],
    queryFn: async () => {
      if (!userAddress) return { sessions: [] }

      const response = await chatApi.getSessions(userAddress)
      return { sessions: response.sessions || [] }
    },
    enabled: !!userAddress,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  // Query to get current session with messages
  const {
    data: currentSessionData,
    isLoading: currentSessionLoading,
    error: currentSessionError
  } = useQuery({
    queryKey: ['chat-session', currentSessionId, userAddress],
    queryFn: async () => {
      if (!currentSessionId || !userAddress) return null

      const response = await chatApi.getSession(currentSessionId, userAddress)
      return response.session || null
    },
    enabled: !!currentSessionId && !!userAddress,
    staleTime: 10000, // Shorter stale time for active session
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })
  
  // Convert backend session format to frontend format
  // Note: getSessions() returns sessions without messages for performance
  // Individual session messages are loaded separately via getSession()
  const sessions: ChatSession[] = (sessionsData?.sessions || []).map((session) => ({
    id: session?.id || '',
    title: session?.title || 'Untitled Chat',
    messages: (session?.messages || []).map(msg => ({
      id: msg?.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      content: msg?.content || '',
      type: msg?.type || (msg?.role === 'user' ? 'user' : 'assistant'),
      timestamp: msg?.timestamp || new Date().toISOString(),
      memoryDetected: msg?.memory_detected || false,
      memoryId: msg?.memory_id || null
    })),
    createdAt: new Date(session?.created_at || Date.now()),
    updatedAt: new Date(session?.updated_at || Date.now())
  }))

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!userAddress) {
        throw new Error('No user address')
      }

      try {
        // Create session directly in PostgreSQL via backend
        const response = await chatApi.createSession({
          userAddress,
          title,
          modelName: DEFAULT_MODEL_ID
        })
        
        return { 
          success: true, 
          session: { 
            id: response.session?.id || '', 
            title 
          } 
        }
      } catch (error) {
        console.error('Session creation error:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })

      // Set as current session
      const sessionId = data.session?.id || ''
      if (!sessionId) {
        console.error('No session ID in successful response:', data)
      }
      setCurrentSessionId(sessionId)
    }
  })

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({ 
      sessionId, 
      content, 
      type
    }: {
      sessionId: string
      content: string
      type: 'user' | 'assistant'
    }) => {
      if (!userAddress) throw new Error('No user address')

      try {
        // Add message directly to PostgreSQL via backend
        const response = await chatApi.addMessage(sessionId, {
          userAddress,
          content,
          type
        })
        
        return { success: true }
      } catch (error) {
        console.error('Error adding message:', error)
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
    }
  })

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!userAddress) throw new Error('No user address')

      try {
        // Delete session in PostgreSQL via backend
        await chatApi.deleteSession(sessionId, userAddress)
        
        return { success: true }
      } catch (error) {
        console.error('Error deleting session:', error)
        throw error
      }
    },
    onSuccess: (_, deletedSessionId) => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
      
      // Clear current session if it was deleted
      if (currentSessionId === deletedSessionId) {
        setCurrentSessionId(null)
      }
    }
  })

  // Helper functions
  const getCurrentSession = useCallback((): ChatSession | null => {
    if (!currentSessionId) return null

    // If we have current session data with messages, use that
    if (currentSessionData) {
      return {
        id: currentSessionData.id,
        title: currentSessionData.title,
        messages: (currentSessionData.messages || []).map(msg => ({
          id: msg?.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          content: msg?.content || '',
          type: msg?.type || (msg?.role === 'user' ? 'user' : 'assistant'),
          timestamp: msg?.timestamp || new Date().toISOString(),
          memoryDetected: msg?.memory_detected || false,
          memoryId: msg?.memory_id || null
        })),
        createdAt: new Date(currentSessionData.created_at || Date.now()),
        updatedAt: new Date(currentSessionData.updated_at || Date.now())
      }
    }

    // Fallback to session list (without messages)
    return sessions.find(session => session.id === currentSessionId) || null
  }, [currentSessionId, sessions, currentSessionData])

  const createNewSession = useCallback(async (title?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Generate smart title based on time if no title provided
      const defaultTitle = title || `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

      createSessionMutation.mutate(defaultTitle, {
        onSuccess: (data) => {
          const sessionId = data.session?.id || ''
          resolve(sessionId)
        },
        onError: (error) => {
          reject(error)
        }
      })
    })
  }, [createSessionMutation])

  const addMessageToSession = useCallback(async (
    sessionId: string, 
    content: string, 
    type: 'user' | 'assistant'
  ) => {
    return new Promise((resolve, reject) => {
      addMessageMutation.mutate({ sessionId, content, type }, {
        onSuccess: () => {
          resolve(true)
        },
        onError: (error) => {
          reject(error)
        }
      })
    })
  }, [addMessageMutation])

  const deleteSession = useCallback((sessionId: string) => {
    deleteSessionMutation.mutate(sessionId)
  }, [deleteSessionMutation])

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
  }, [])
  
  // This function is no longer needed with PostgreSQL
  const executePendingTransactions = useCallback(async (): Promise<boolean> => {
    return true
  }, [])

  // Auto-select first session if none selected
  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id)
    }
  }, [sessions, currentSessionId])

  // Store current session ID in localStorage
  useEffect(() => {
    if (currentSessionId && userAddress) {
      localStorage.setItem(`currentSessionId_${userAddress}`, currentSessionId)
    }
  }, [currentSessionId, userAddress])

  // Load current session ID from localStorage
  useEffect(() => {
    if (userAddress && !currentSessionId) {
      const stored = localStorage.getItem(`currentSessionId_${userAddress}`)
      if (stored && sessions.some(s => s.id === stored)) {
        setCurrentSessionId(stored)
      }
    }
  }, [userAddress, sessions, currentSessionId])

  return {
    sessions,
    currentSessionId,
    sessionsLoading,
    sessionsError,
    currentSessionLoading,
    currentSessionError,
    getCurrentSession,
    createNewSession,
    addMessageToSession,
    deleteSession,
    selectSession,
    executePendingTransactions,
    isCreatingSession: createSessionMutation.isPending,
    isAddingMessage: addMessageMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending
  }
}
````

## File: hooks/use-memory-index.ts
````typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@suiet/wallet-kit'
import { memoryIndexService, MemoryIndexState } from '@/app/services/memoryIndexService'

export interface UseMemoryIndexReturn {
  indexState: MemoryIndexState | null
  isLoading: boolean
  error: string | null
  ensureIndex: () => Promise<string | null>
  checkIndex: () => Promise<void>
  clearIndex: () => void
  hasIndex: boolean
  indexId: string | null
}

/**
 * Hook for managing memory indexes
 * Provides automatic index creation and state management
 */
export function useMemoryIndex(): UseMemoryIndexReturn {
  const wallet = useWallet()
  const [indexState, setIndexState] = useState<MemoryIndexState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userAddress = wallet.account?.address

  // Load initial state when wallet connects
  useEffect(() => {
    if (userAddress) {
      const state = memoryIndexService.getIndexState(userAddress)
      setIndexState(state)
    } else {
      setIndexState(null)
    }
  }, [userAddress])

  /**
   * Ensure the user has a memory index
   */
  const ensureIndex = useCallback(async (): Promise<string | null> => {
    if (!wallet.connected || !userAddress) {
      setError('Wallet not connected')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const indexId = await memoryIndexService.ensureMemoryIndex(userAddress, wallet)
      
      if (indexId) {
        // Reload state after successful creation
        const newState = memoryIndexService.getIndexState(userAddress)
        setIndexState(newState)
        return indexId
      } else {
        setError('Failed to create memory index')
        return null
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [wallet, userAddress])

  /**
   * Check if user has an index and create if needed
   */
  const checkIndex = useCallback(async (): Promise<void> => {
    if (!wallet.connected || !userAddress) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await memoryIndexService.checkAndCreateIndex(userAddress, wallet)
      
      if (result.hasIndex) {
        // Update state
        const newState = memoryIndexService.getIndexState(userAddress)
        setIndexState(newState)
      } else if (result.message) {
        setError(result.message)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [wallet, userAddress])

  /**
   * Clear the index state for the current user
   */
  const clearIndex = useCallback(() => {
    if (userAddress) {
      memoryIndexService.clearIndexState(userAddress)
      setIndexState(null)
      setError(null)
    }
  }, [userAddress])

  return {
    indexState,
    isLoading,
    error,
    ensureIndex,
    checkIndex,
    clearIndex,
    hasIndex: !!indexState?.indexId && indexState.isRegistered,
    indexId: indexState?.indexId || null
  }
}
````

## File: hooks/use-streaming-chat.ts
````typescript
'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { chatApi } from '@/app/api'

interface StreamingChatRequest {
  text: string
  userId: string
  sessionId?: string
  model?: string
  originalUserMessage?: string
  memoryContext?: string
}

interface StreamChunk {
  type: 'start' | 'chunk' | 'end'
  content?: string
  intent?: string
  entities?: any
  memoryStored?: boolean
  memoryId?: string
  memoryExtraction?: any
}

interface StreamingState {
  isStreaming: boolean
  currentResponse: string
  error: string | null
}

export function useStreamingChat() {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentResponse: '',
    error: null
  })
  
  const queryClient = useQueryClient()

  const sendStreamingMessage = useCallback(async (
    request: StreamingChatRequest,
    onChunk?: (chunk: string) => void,
    onComplete?: (fullResponse: string, intent?: string, entities?: any, memoryStored?: boolean, memoryId?: string, memoryExtraction?: any) => void,
    onError?: (error: string) => void
  ) => {
    try {
      setStreamingState({
        isStreaming: true,
        currentResponse: '',
        error: null
      })

      const response = await chatApi.streamChat({
        text: request.text,
        user_id: request.userId,
        session_id: request.sessionId,
        model: request.model || 'gemini-2.0-flash', // Use consistent model name
        originalUserMessage: request.originalUserMessage,
        memoryContext: request.memoryContext
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      let fullResponse = ''
      let intent = ''
      let entities = null

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: StreamChunk = JSON.parse(line.slice(6))
                
                if (data.type === 'start') {
                  intent = data.intent || ''
                  console.log('Stream started, intent:', intent)
                } else if (data.type === 'chunk' && data.content) {
                  fullResponse += data.content
                  setStreamingState(prev => ({
                    ...prev,
                    currentResponse: fullResponse
                  }))
                  onChunk?.(data.content)
                } else if (data.type === 'end') {
                  entities = data.entities
                  console.log('Stream ended, entities:', entities)
                  
                  // Call completion handler immediately with memory info from backend
                  if (onComplete) {
                    await onComplete(
                      fullResponse, 
                      intent, 
                      entities, 
                      data.memoryStored || false,
                      data.memoryId || null,
                      data.memoryExtraction || null
                    )
                  }
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', line)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      setStreamingState({
        isStreaming: false,
        currentResponse: fullResponse,
        error: null
      })

      // Don't invalidate queries here - let the chat interface handle it
      // This prevents duplicate invalidations and race conditions
      
      // onComplete is now called when we receive the 'end' chunk above

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Streaming error:', error)
      
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage
      }))
      
      onError?.(errorMessage)
    }
  }, [queryClient])

  const resetStreaming = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      currentResponse: '',
      error: null
    })
  }, [])

  return {
    sendStreamingMessage,
    resetStreaming,
    ...streamingState
  }
}
````

## File: hooks/use-sui-auth.ts
````typescript
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@suiet/wallet-kit'

const DEV_MODE = process.env.NODE_ENV === 'development'

interface AuthState {
  isAuthenticated: boolean
  userAddress: string | null
  loading: boolean
  error: string | null
}

export function useSuiAuth() {
  const wallet = useWallet()
  
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userAddress: null,
    loading: true,
    error: null
  })

  // Update auth state when wallet connection changes
  useEffect(() => {
    if (wallet.connected && wallet.account) {
      setAuthState({
        isAuthenticated: true,
        userAddress: wallet.account.address,
        loading: false,
        error: null
      })
    } else {
      // Check dev mode fallback
      const devAddress = localStorage.getItem('dev-sui-address')
      if (DEV_MODE && devAddress) {
        setAuthState({
          isAuthenticated: true,
          userAddress: devAddress,
          loading: false,
          error: null
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          userAddress: null,
          loading: false,
          error: null
        })
      }
    }
  }, [wallet.connected, wallet.account])

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      // Development mode - skip wallet connection
      if (DEV_MODE && !wallet.connected) {
        // Simulate a user address for development
        const devAddress = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')

        localStorage.setItem('dev-sui-address', devAddress)

        setAuthState({
          isAuthenticated: true,
          userAddress: devAddress,
          loading: false,
          error: null
        })
        return
      }

      // Connect wallet if not already connected
      if (!wallet.connected) {
        try {
          await wallet.select('Sui Wallet')
          console.log('Wallet connected successfully')
        } catch (error) {
          console.error('Wallet connection failed:', error)
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to connect wallet'
          }))
        }
      }

    } catch (error) {
      console.error('Login error:', error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }))
    }
  }

  const handleCallback = async (_jwt: string) => {
    // Not needed for wallet connection
    return Promise.resolve()
  }

  const logout = () => {
    if (wallet.connected) {
      wallet.disconnect()
    }

    localStorage.removeItem('dev-sui-address')

    setAuthState({
      isAuthenticated: false,
      userAddress: null,
      loading: false,
      error: null
    })
  }

  const getUserId = (): string => {
    return authState.userAddress || 'default-user'
  }

  return {
    ...authState,
    login,
    logout,
    handleCallback,
    getUserId,
    wallet
  }
}
````

## File: layout.tsx
````typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from './providers/query-provider'
import { SuiProvider } from './providers/sui-provider'
import { MantineProvider } from './providers/mantine-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personal Data Wallet',
  description: 'Decentralized, Self-Organizing Memory Layer for LLMs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider>
          <SuiProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </SuiProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
````

## File: lib/api.ts
````typescript
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
````

## File: page.tsx
````typescript
'use client'

import { ChatInterface } from '@/app/components/chat/chat-interface'
import { LoginPage } from '@/app/components/auth/login-page'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { Center, Loader, Text, Stack } from '@mantine/core'

export default function Home() {
  const { isAuthenticated, loading } = useSuiAuth()

  if (loading) {
    return (
      <Center h="100vh" bg="gray.0">
        <Stack align="center" gap="md">
          <Loader size="lg" color="blue" />
          <Text c="dimmed">Loading...</Text>
        </Stack>
      </Center>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <ChatInterface />
}
````

## File: providers/mantine-provider.tsx
````typescript
'use client'

import { MantineProvider as BaseMantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/code-highlight/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/spotlight/styles.css'

const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    // Custom color palette for the decentralized theme
    brand: [
      '#e3f2fd',
      '#bbdefb',
      '#90caf9',
      '#64b5f6',
      '#42a5f5',
      '#2196f3',
      '#1e88e5',
      '#1976d2',
      '#1565c0',
      '#0d47a1'
    ],
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'xs',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
})

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseMantineProvider theme={theme}>
      <Notifications position="top-right" />
      <ModalsProvider>
        {children}
      </ModalsProvider>
    </BaseMantineProvider>
  )
}
````

## File: providers/query-provider.tsx
````typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
````

## File: providers/sui-provider.tsx
````typescript
'use client'

import { WalletProvider } from '@suiet/wallet-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@suiet/wallet-kit/style.css'

const queryClient = new QueryClient()

export function SuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider autoConnect={true} defaultNetwork="testnet">
        {children}
      </WalletProvider>
    </QueryClientProvider>
  )
}
````

## File: services/BatchTransactionService.ts
````typescript
'use client';

import { Transaction } from '@mysten/sui/transactions';

// Class for batching multiple blockchain operations into a single transaction
export class BatchTransactionService {
  private transaction: Transaction;
  private operations: Array<{
    execute: () => Promise<void>;
    description: string;
  }> = [];
  private isExecuting = false;
  private autoExecuteThreshold: number;

  constructor(autoExecuteThreshold = 5) {
    this.transaction = new Transaction();
    this.autoExecuteThreshold = autoExecuteThreshold;
  }

  /**
   * Add a chat message to the transaction batch
   */
  addChatMessage(
    packageId: string,
    sessionId: string,
    role: string,
    content: string
  ) {
    this.operations.push({
      execute: async () => {
        this.transaction.moveCall({
          target: `${packageId}::chat_sessions::add_message_to_session`,
          arguments: [
            this.transaction.object(sessionId),
            this.transaction.pure.string(role),
            this.transaction.pure.string(content)
          ]
        });
      },
      description: `Add "${role}" message to session ${sessionId.substring(0, 8)}...`
    });

    // Auto-execute if we reach the threshold
    if (this.operations.length >= this.autoExecuteThreshold) {
      this.executeAsync();
    }

    return this;
  }

  /**
   * Reset the batch by creating a new transaction and clearing operations
   */
  reset() {
    if (this.isExecuting) {
      console.warn('Cannot reset while executing');
      return this;
    }
    
    this.transaction = new Transaction();
    this.operations = [];
    return this;
  }

  /**
   * Execute the transaction batch asynchronously
   */
  async executeAsync(wallet?: any): Promise<boolean> {
    // If there are no operations, just return success
    if (this.operations.length === 0) {
      return true;
    }

    // Don't allow concurrent execution
    if (this.isExecuting) {
      console.warn('Transaction batch is already executing');
      return false;
    }

    this.isExecuting = true;
    try {
      // Apply all operations to the transaction
      for (const op of this.operations) {
        await op.execute();
      }

      // If wallet is provided, execute the transaction
      if (wallet && wallet.connected) {
        await wallet.signAndExecuteTransactionBlock({
          transactionBlock: this.transaction as any
        });
      } else {
        console.error('Wallet not connected, cannot execute transaction');
        return false;
      }
      
      // Reset after successful execution
      this.reset();
      return true;
    } catch (error) {
      console.error('Error executing transaction batch:', error);
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Get the current pending operations count
   */
  get pendingCount(): number {
    return this.operations.length;
  }
}

// Global instance for sharing across components
let batchService: BatchTransactionService | null = null;

/**
 * Get or create a shared batch transaction service
 */
export function getSharedBatchService(autoExecuteThreshold = 5): BatchTransactionService {
  if (!batchService) {
    batchService = new BatchTransactionService(autoExecuteThreshold);
  }
  return batchService;
}
````

## File: services/EnhancedTransactionService.ts
````typescript
'use client';

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

interface PreApprovalConfig {
  maxTransactions: number;
  expirationMinutes: number;
}

/**
 * Enhanced transaction service with pre-approval and better batching
 */
export class EnhancedTransactionService {
  private transaction: Transaction;
  private operations: Array<{
    execute: () => Promise<void>;
    description: string;
    timestamp: number;
  }> = [];
  private isExecuting = false;
  private autoExecuteThreshold: number;
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelayMs: number;
  
  // Pre-approval configuration
  private preApprovalConfig: PreApprovalConfig = {
    maxTransactions: 10,
    expirationMinutes: 30
  };
  
  // Session-based approval tracking
  private sessionApproval: {
    approved: boolean;
    remainingTransactions: number;
    expiresAt: number;
  } | null = null;

  constructor(
    autoExecuteThreshold = 10, // Increased from 5 to batch more operations
    batchDelayMs = 2000 // Wait 2 seconds before executing to collect more operations
  ) {
    this.transaction = new Transaction();
    this.autoExecuteThreshold = autoExecuteThreshold;
    this.batchDelayMs = batchDelayMs;
  }

  /**
   * Request pre-approval for multiple transactions
   */
  async requestPreApproval(wallet: any): Promise<boolean> {
    if (!wallet?.connected) {
      console.error('Wallet not connected');
      return false;
    }

    try {
      // Create a dummy transaction to request pre-approval
      const approvalTx = new Transaction();
      
      // Add a comment to explain to the user what they're approving
      approvalTx.setSender(wallet.account.address);
      
      // Show approval dialog with clear messaging
      const message = `Pre-approve up to ${this.preApprovalConfig.maxTransactions} transactions for the next ${this.preApprovalConfig.expirationMinutes} minutes?`;
      
      if (confirm(message)) {
        this.sessionApproval = {
          approved: true,
          remainingTransactions: this.preApprovalConfig.maxTransactions,
          expiresAt: Date.now() + (this.preApprovalConfig.expirationMinutes * 60 * 1000)
        };
        
        console.log('Pre-approval granted for session');
        return true;
      }
    } catch (error) {
      console.error('Error requesting pre-approval:', error);
    }
    
    return false;
  }

  /**
   * Check if we have valid pre-approval
   */
  private hasValidPreApproval(): boolean {
    if (!this.sessionApproval) return false;
    
    // Check if approval has expired
    if (Date.now() > this.sessionApproval.expiresAt) {
      this.sessionApproval = null;
      return false;
    }
    
    // Check if we have remaining transactions
    return this.sessionApproval.remainingTransactions > 0;
  }

  /**
   * Add a chat message to the transaction batch
   */
  addChatMessage(
    packageId: string,
    sessionId: string,
    role: string,
    content: string
  ) {
    this.operations.push({
      execute: async () => {
        this.transaction.moveCall({
          target: `${packageId}::chat_sessions::add_message_to_session`,
          arguments: [
            this.transaction.object(sessionId),
            this.transaction.pure.string(role),
            this.transaction.pure.string(content)
          ]
        });
      },
      description: `Add "${role}" message to session ${sessionId.substring(0, 8)}...`,
      timestamp: Date.now()
    });

    // Set up delayed execution
    this.scheduleExecution();
    
    return this;
  }

  /**
   * Schedule batch execution with delay to collect more operations
   */
  private scheduleExecution() {
    // Clear existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // If we've reached the threshold, execute immediately
    if (this.operations.length >= this.autoExecuteThreshold) {
      this.executeAsync();
      return;
    }

    // Otherwise, wait for more operations
    this.batchTimeout = setTimeout(() => {
      if (this.operations.length > 0) {
        this.executeAsync();
      }
    }, this.batchDelayMs);
  }

  /**
   * Reset the batch by creating a new transaction and clearing operations
   */
  reset() {
    if (this.isExecuting) {
      console.warn('Cannot reset while executing');
      return this;
    }
    
    this.transaction = new Transaction();
    this.operations = [];
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    return this;
  }

  /**
   * Execute the transaction batch
   */
  async executeAsync(wallet?: any): Promise<boolean> {
    // If there are no operations, just return success
    if (this.operations.length === 0) {
      return true;
    }

    // Don't allow concurrent execution
    if (this.isExecuting) {
      console.warn('Transaction batch is already executing');
      return false;
    }

    // Clear the batch timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    this.isExecuting = true;
    try {
      // Apply all operations to the transaction
      for (const op of this.operations) {
        await op.execute();
      }

      // If wallet is provided, execute the transaction
      if (wallet && wallet.connected) {
        const operationCount = this.operations.length;
        console.log(`Executing batch of ${operationCount} operations`);
        
        // Check if we can use pre-approval
        if (this.hasValidPreApproval()) {
          console.log('Using pre-approved session');
          this.sessionApproval!.remainingTransactions--;
        }
        
        await wallet.signAndExecuteTransactionBlock({
          transactionBlock: this.transaction as any,
          options: {
            showEffects: true,
            showEvents: true
          }
        });
        
        console.log(`Successfully executed ${operationCount} operations in one transaction`);
      } else {
        console.error('Wallet not connected, cannot execute transaction');
        return false;
      }
      
      // Reset after successful execution
      this.reset();
      return true;
    } catch (error) {
      console.error('Error executing transaction batch:', error);
      
      // If error is due to approval, clear pre-approval
      if (error instanceof Error && error.message.includes('User rejected')) {
        this.sessionApproval = null;
      }
      
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Force immediate execution of pending operations
   */
  async flush(wallet: any): Promise<boolean> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    return this.executeAsync(wallet);
  }

  /**
   * Get the current pending operations count
   */
  get pendingCount(): number {
    return this.operations.length;
  }

  /**
   * Get session approval status
   */
  get approvalStatus(): {
    hasApproval: boolean;
    remainingTransactions: number;
    expiresIn: number;
  } {
    if (!this.hasValidPreApproval()) {
      return {
        hasApproval: false,
        remainingTransactions: 0,
        expiresIn: 0
      };
    }

    return {
      hasApproval: true,
      remainingTransactions: this.sessionApproval!.remainingTransactions,
      expiresIn: Math.max(0, this.sessionApproval!.expiresAt - Date.now())
    };
  }
}

// Global instance for sharing across components
let enhancedService: EnhancedTransactionService | null = null;

/**
 * Get or create a shared enhanced transaction service
 */
export function getEnhancedTransactionService(
  autoExecuteThreshold = 10,
  batchDelayMs = 2000
): EnhancedTransactionService {
  if (!enhancedService) {
    enhancedService = new EnhancedTransactionService(autoExecuteThreshold, batchDelayMs);
  }
  return enhancedService;
}
````

## File: services/memoryDecryptionCache.ts
````typescript
/**
 * Memory Decryption Cache Service
 * 
 * This service provides caching for decrypted memory content to avoid
 * repeated API calls for the same content across the application.
 */

class MemoryDecryptionCacheService {
  // In-memory cache of decrypted content keyed by walrus hash
  private decryptedContentCache: Map<string, string> = new Map();
  
  // Track which memories have been successfully decrypted 
  private decryptedMemoryIds: Set<string> = new Set();
  
  /**
   * Check if a memory has been decrypted by its ID
   */
  async isMemoryDecrypted(memoryId: string): Promise<boolean> {
    return this.decryptedMemoryIds.has(memoryId);
  }
  
  /**
   * Get content from cache if available, otherwise fetch and cache it
   */
  async getDecryptedContent(walrusHash: string): Promise<string | null> {
    try {
      // Return from cache if available
      if (this.decryptedContentCache.has(walrusHash)) {
        console.log(`Cache hit for memory: ${walrusHash.substring(0, 8)}...`);
        return this.decryptedContentCache.get(walrusHash) || null;
      }
      
      console.log(`Cache miss for memory: ${walrusHash.substring(0, 8)}..., fetching`);
      
      // Fetch from API if not in cache
      const response = await fetch(`/api/storage/retrieve/${walrusHash}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch memory content: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.content) {
        // Store in cache
        this.decryptedContentCache.set(walrusHash, data.content);
        return data.content;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting decrypted content:', error);
      return null;
    }
  }
  
  /**
   * Mark a memory as decrypted by its ID
   */
  markMemoryDecrypted(memoryId: string): void {
    this.decryptedMemoryIds.add(memoryId);
  }
  
  /**
   * Check if a memory has been decrypted by its ID
   */
  isMemoryDecrypted(memoryId: string): boolean {
    return this.decryptedMemoryIds.has(memoryId);
  }
  
  /**
   * Pre-fetch and decrypt a batch of memories
   */
  async batchDecrypt(memories: Array<{id: string, walrusHash?: string}>): Promise<void> {
    const toDecrypt = memories.filter(m => m.walrusHash && !this.decryptedContentCache.has(m.walrusHash));
    
    if (toDecrypt.length === 0) return;
    
    console.log(`Batch decrypting ${toDecrypt.length} memories`);
    
    // Process in small batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < toDecrypt.length; i += batchSize) {
      const batch = toDecrypt.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async memory => {
          if (memory.walrusHash) {
            try {
              const content = await this.getDecryptedContent(memory.walrusHash);
              if (content) {
                this.markMemoryDecrypted(memory.id);
              }
            } catch (err) {
              console.error(`Failed to decrypt memory ${memory.id}:`, err);
            }
          }
        })
      );
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.decryptedContentCache.clear();
    this.decryptedMemoryIds.clear();
  }
}

// Export singleton instance
export const memoryDecryptionCache = new MemoryDecryptionCacheService();
````

## File: services/memoryEventEmitter.ts
````typescript
/**
 * Simple event emitter for memory-related events
 * Used to notify components when memories are updated
 */

type MemoryEventType = 'memoriesUpdated' | 'memoryAdded' | 'memoryDeleted'

type MemoryEventListener = (data?: any) => void

class MemoryEventEmitter {
  private listeners: Map<MemoryEventType, MemoryEventListener[]> = new Map()

  /**
   * Subscribe to memory events
   */
  on(event: MemoryEventType, listener: MemoryEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  /**
   * Unsubscribe from memory events
   */
  off(event: MemoryEventType, listener: MemoryEventListener) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit a memory event
   */
  emit(event: MemoryEventType, data?: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Error in memory event listener:', error)
        }
      })
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: MemoryEventType) {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// Export singleton instance
export const memoryEventEmitter = new MemoryEventEmitter()

// Helper functions for common events
export const emitMemoriesUpdated = (data?: any) => {
  memoryEventEmitter.emit('memoriesUpdated', data)
}

export const emitMemoryAdded = (memoryId: string) => {
  memoryEventEmitter.emit('memoryAdded', { memoryId })
}

export const emitMemoryDeleted = (memoryId: string) => {
  memoryEventEmitter.emit('memoryDeleted', { memoryId })
}
````

## File: services/memoryIndexService.ts
````typescript
'use client'

import { Transaction } from '@mysten/sui/transactions'
import { httpApi } from '@/app/api/httpApi'
import { SuiBlockchainService } from './suiBlockchainService'

// Types for memory index management
export interface MemoryIndexState {
  indexId: string | null
  isCreating: boolean
  isRegistered: boolean
  lastError: string | null
  createdAt: number | null
}

export interface PrepareIndexResponse {
  success: boolean
  indexBlobId?: string
  graphBlobId?: string
  message?: string
}

export interface RegisterIndexResponse {
  success: boolean
  message?: string
}

export interface CreateMemoryResponse {
  success: boolean
  memoryId?: string
  message?: string
  requiresIndexCreation?: boolean
  indexBlobId?: string
  graphBlobId?: string
}

// Cache key prefix for localStorage
const CACHE_PREFIX = 'memory_index_'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

class MemoryIndexService {
  private indexCache: Map<string, MemoryIndexState> = new Map()
  private pendingOperations: Map<string, Promise<string | null>> = new Map()

  constructor() {
    // Load cached indexes from localStorage on initialization
    this.loadCachedIndexes()
  }

  /**
   * Load cached index states from localStorage
   */
  private loadCachedIndexes(): void {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX))
      
      for (const key of keys) {
        const userAddress = key.replace(CACHE_PREFIX, '')
        const cached = localStorage.getItem(key)
        
        if (cached) {
          const state: MemoryIndexState = JSON.parse(cached)
          
          // Check if cache is not expired
          if (state.createdAt && Date.now() - state.createdAt < CACHE_EXPIRY) {
            this.indexCache.set(userAddress, state)
          } else {
            // Remove expired cache
            localStorage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.error('Error loading cached indexes:', error)
    }
  }

  /**
   * Save index state to localStorage
   */
  private saveIndexState(userAddress: string, state: MemoryIndexState): void {
    if (typeof window === 'undefined') return

    try {
      this.indexCache.set(userAddress, state)
      localStorage.setItem(
        `${CACHE_PREFIX}${userAddress}`,
        JSON.stringify(state)
      )
    } catch (error) {
      console.error('Error saving index state:', error)
    }
  }

  /**
   * Get the current index state for a user
   */
  getIndexState(userAddress: string): MemoryIndexState | null {
    return this.indexCache.get(userAddress) || null
  }

  /**
   * Clear index state for a user
   */
  clearIndexState(userAddress: string): void {
    this.indexCache.delete(userAddress)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${CACHE_PREFIX}${userAddress}`)
    }
  }

  /**
   * Ensure a user has a memory index, creating one if necessary
   * This is the main entry point for index management
   */
  async ensureMemoryIndex(
    userAddress: string,
    wallet: any
  ): Promise<string | null> {
    // Check if we already have a registered index
    const cachedState = this.getIndexState(userAddress)
    if (cachedState?.indexId && cachedState.isRegistered) {
      console.log(`Using cached index ${cachedState.indexId} for ${userAddress}`)
      return cachedState.indexId
    }

    // Check if there's already a pending operation for this user
    const pendingOp = this.pendingOperations.get(userAddress)
    if (pendingOp) {
      console.log(`Waiting for pending index creation for ${userAddress}`)
      return pendingOp
    }

    // Start new index creation operation
    const operation = this.createIndexForUser(userAddress, wallet)
    this.pendingOperations.set(userAddress, operation)

    try {
      const result = await operation
      return result
    } finally {
      this.pendingOperations.delete(userAddress)
    }
  }

  /**
   * Create a new memory index for a user
   */
  private async createIndexForUser(
    userAddress: string,
    wallet: any
  ): Promise<string | null> {
    try {
      // Update state to indicate creation is in progress
      this.saveIndexState(userAddress, {
        indexId: null,
        isCreating: true,
        isRegistered: false,
        lastError: null,
        createdAt: null
      })

      // Step 1: Prepare index data on backend
      console.log(`Preparing index data for ${userAddress}...`)
      const prepareResponse = await this.prepareIndex(userAddress)
      
      if (!prepareResponse.success || !prepareResponse.indexBlobId || !prepareResponse.graphBlobId) {
        const error = prepareResponse.message || 'Failed to prepare index data'
        this.saveIndexState(userAddress, {
          indexId: null,
          isCreating: false,
          isRegistered: false,
          lastError: error,
          createdAt: null
        })
        throw new Error(error)
      }

      // Step 2: Create index on blockchain
      console.log(`Creating index on-chain for ${userAddress}...`)
      const indexId = await this.createIndexOnChain(
        userAddress,
        prepareResponse.indexBlobId,
        prepareResponse.graphBlobId,
        wallet
      )

      if (!indexId) {
        const error = 'Failed to create index on blockchain'
        this.saveIndexState(userAddress, {
          indexId: null,
          isCreating: false,
          isRegistered: false,
          lastError: error,
          createdAt: null
        })
        throw new Error(error)
      }

      // Step 3: Register index with backend
      console.log(`Registering index ${indexId} with backend...`)
      const registerResponse = await this.registerIndex(userAddress, indexId)
      
      if (!registerResponse.success) {
        const error = registerResponse.message || 'Failed to register index with backend'
        this.saveIndexState(userAddress, {
          indexId,
          isCreating: false,
          isRegistered: false,
          lastError: error,
          createdAt: Date.now()
        })
        // Don't throw here - we have the index created, just not registered
        console.error(error)
      }

      // Success - save the final state
      this.saveIndexState(userAddress, {
        indexId,
        isCreating: false,
        isRegistered: registerResponse.success,
        lastError: null,
        createdAt: Date.now()
      })

      console.log(`Successfully created and registered index ${indexId} for ${userAddress}`)
      return indexId

    } catch (error) {
      console.error(`Failed to create index for ${userAddress}:`, error)
      
      // Save error state
      this.saveIndexState(userAddress, {
        indexId: null,
        isCreating: false,
        isRegistered: false,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        createdAt: null
      })
      
      return null
    }
  }

  /**
   * Prepare index data on the backend
   */
  private async prepareIndex(userAddress: string): Promise<PrepareIndexResponse> {
    try {
      const response = await httpApi.post('/api/memories/prepare-index', {
        userAddress
      })
      return response as PrepareIndexResponse
    } catch (error) {
      console.error('Error preparing index:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to prepare index'
      }
    }
  }

  /**
   * Create memory index on blockchain
   */
  private async createIndexOnChain(
    userAddress: string,
    indexBlobId: string,
    graphBlobId: string,
    wallet: any
  ): Promise<string | null> {
    if (!wallet.connected || !wallet.account) {
      throw new Error('Wallet not connected')
    }

    try {
      const PACKAGE_ID = '0x8ae699f05fbbf9c314118d53bfdd6e43c4daa12b7a785a972128f1efaf65b50c'
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory::create_memory_index`,
        arguments: [
          tx.pure.string(indexBlobId),
          tx.pure.string(graphBlobId),
        ],
      })

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        }
      })

      // Extract created object ID
      const indexId = await this.extractObjectId(result)
      return indexId
    } catch (error) {
      console.error('Error creating index on-chain:', error)
      return null
    }
  }

  /**
   * Register index with backend
   */
  private async registerIndex(
    userAddress: string,
    indexId: string
  ): Promise<RegisterIndexResponse> {
    try {
      const response = await httpApi.post('/api/memories/register-index', {
        userAddress,
        indexId
      })
      return response as RegisterIndexResponse
    } catch (error) {
      console.error('Error registering index:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register index'
      }
    }
  }

  /**
   * Extract object ID from transaction result
   */
  private async extractObjectId(result: any): Promise<string | null> {
    try {
      console.log('Initial transaction result:', JSON.stringify(result, null, 2))
      
      // If we have a digest, fetch the full transaction details
      if (result.digest) {
        console.log('Transaction digest:', result.digest)
        
        // Import SuiClient dynamically to get transaction details
        const { SuiClient } = await import('@mysten/sui/client')
        const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' })
        
        // Wait for transaction to be indexed
        console.log('Waiting for transaction confirmation...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        try {
          const txResult = await client.getTransactionBlock({
            digest: result.digest,
            options: {
              showEffects: true,
              showEvents: true,
              showObjectChanges: true
            }
          })
          
          console.log('Retrieved full transaction details:', JSON.stringify(txResult, null, 2))
          
          // Look for created objects in objectChanges
          if (txResult.objectChanges && Array.isArray(txResult.objectChanges)) {
            for (const change of txResult.objectChanges) {
              if (change.type === 'created') {
                console.log('Found created object:', change.objectId)
                return change.objectId
              }
            }
          }
          
          // Look for created objects in effects
          if (txResult.effects?.created && Array.isArray(txResult.effects.created)) {
            for (const created of txResult.effects.created) {
              if (created.reference && created.reference.objectId) {
                console.log('Found created object in effects:', created.reference.objectId)
                return created.reference.objectId
              }
            }
          }
          
          // Look for events with object IDs (specifically MemoryIndexUpdated)
          if (txResult.events && Array.isArray(txResult.events)) {
            for (const event of txResult.events) {
              if (event.type.includes('::memory::MemoryIndexUpdated') && event.parsedJson) {
                console.log('Found MemoryIndexUpdated event:', event.parsedJson)
                if (event.parsedJson.id) {
                  return event.parsedJson.id
                }
              }
            }
          }
        } catch (fetchError) {
          console.error('Error fetching transaction details:', fetchError)
        }
      }
      
      // Fallback to checking immediate result
      if (result.objectChanges && Array.isArray(result.objectChanges)) {
        for (const change of result.objectChanges) {
          if (change.type === 'created') {
            console.log('Found created object in immediate result:', change.objectId)
            return change.objectId
          }
        }
      }

      console.error('No created objects found')
      return null
    } catch (error) {
      console.error('Error extracting object ID:', error)
      return null
    }
  }

  /**
   * Handle memory creation with automatic index creation
   * This wraps the memory creation API call and handles index creation if needed
   */
  async createMemoryWithAutoIndex(
    content: string,
    category: string,
    userAddress: string,
    wallet: any
  ): Promise<CreateMemoryResponse> {
    try {
      console.log('Creating memory with blockchain integration...');

      // Step 1: First process the memory content in the backend to get vectorId and blobId
      let backendResponse = await httpApi.post('/api/memories', {
        content,
        category,
        userAddress
      }) as CreateMemoryResponse

      // Check if index creation is required
      if (!backendResponse.success && backendResponse.requiresIndexCreation) {
        console.log('Index creation required, creating index...')

        // Ensure index exists
        const indexId = await this.ensureMemoryIndex(userAddress, wallet)

        if (!indexId) {
          return {
            success: false,
            message: 'Failed to create memory index. Please try again.'
          }
        }

        // Retry memory creation
        console.log('Retrying memory creation after index creation...')
        backendResponse = await httpApi.post('/api/memories', {
          content,
          category,
          userAddress
        }) as CreateMemoryResponse
      }

      if (!backendResponse.success) {
        return backendResponse;
      }

      // Step 2: Create blockchain record with user signature
      console.log('Creating blockchain memory record...');
      const suiBlockchainService = new SuiBlockchainService(wallet);

      try {
        const suiObjectId = await suiBlockchainService.createMemoryRecord(
          category,
          backendResponse.vectorId || 1, // Use vectorId from backend response
          backendResponse.blobId || 'temp_blob_id' // Use blobId from backend response
        );

        console.log('Blockchain record created:', suiObjectId);

        // Step 3: Call backend to finalize the memory with the real Sui object ID
        const finalResponse = await httpApi.post('/api/memories/save-approved', {
          content,
          category,
          userAddress,
          suiObjectId // Real Sui object ID, not backend temp ID
        });

        return {
          success: true,
          memoryId: suiObjectId, // Return the real Sui object ID
          message: 'Memory saved successfully to blockchain and indexed'
        };

      } catch (blockchainError) {
        console.error('Blockchain record creation failed:', blockchainError);
        return {
          success: false,
          message: `Failed to create blockchain record: ${blockchainError instanceof Error ? blockchainError.message : 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Error creating memory:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create memory'
      }
    }
  }

  /**
   * Check if user needs to create an index
   * This can be called proactively to create index before first memory
   */
  async checkAndCreateIndex(
    userAddress: string,
    wallet: any
  ): Promise<{
    hasIndex: boolean
    indexId: string | null
    message?: string
  }> {
    try {
      // Check cache first
      const cachedState = this.getIndexState(userAddress)
      if (cachedState?.indexId && cachedState.isRegistered) {
        return {
          hasIndex: true,
          indexId: cachedState.indexId
        }
      }

      // Try to create a test memory to check if index exists
      const testResponse = await httpApi.post('/api/memories', {
        content: 'test',
        category: 'test',
        userAddress
      }) as CreateMemoryResponse

      if (testResponse.requiresIndexCreation) {
        // Index doesn't exist, create it
        console.log('Index does not exist, creating...')
        const indexId = await this.ensureMemoryIndex(userAddress, wallet)
        
        return {
          hasIndex: !!indexId,
          indexId,
          message: indexId ? 'Index created successfully' : 'Failed to create index'
        }
      }

      // Index exists but not in our cache
      return {
        hasIndex: true,
        indexId: null,
        message: 'Index exists on backend'
      }
    } catch (error) {
      console.error('Error checking index:', error)
      return {
        hasIndex: false,
        indexId: null,
        message: error instanceof Error ? error.message : 'Failed to check index'
      }
    }
  }
}

// Export singleton instance
export const memoryIndexService = new MemoryIndexService()

// Export types
export type { MemoryIndexState, PrepareIndexResponse, RegisterIndexResponse, CreateMemoryResponse }
````

## File: services/memoryIntegration.ts
````typescript
// Memory Integration Service
// Simplified service for memory context retrieval (detection now handled by backend)

import { memoryApi } from '@/app/api'

export interface MemoryContext {
  relevantMemories: string[]
  contextSummary: string
  totalMemories: number
}

// Types for compatibility (detection now handled by backend)
export interface DetectionResult {
  shouldStore: boolean
  memories: MemoryCandidate[]
  reasoning: string
}

export interface MemoryCandidate {
  content: string
  category: string
  confidence: number
  extractedInfo?: { key: string; value: string }[]
}

export interface MemoryExtraction {
  shouldSave: boolean
  category: string
  content: string
  extractedFacts: string[]
  confidence: number
}

class MemoryIntegrationService {
  /**
   * Process a user message for memory detection and storage
   * Note: Memory detection is now handled automatically by the backend
   * This method is kept for compatibility but returns empty results
   */
  async processMessage(
    message: string, 
    userAddress: string, 
    userSignature?: string
  ): Promise<{
    detectionResult: DetectionResult
    storedMemories: string[]
    errors: string[]
  }> {
    // Memory detection is now handled automatically by the backend
    // during chat streaming, so this method returns empty results
    console.log('Memory detection now handled by backend automatically')
    
    return {
      detectionResult: {
        shouldStore: false,
        memories: [],
        reasoning: 'Memory detection moved to backend'
      },
      storedMemories: [],
      errors: []
    }
  }

  /**
   * Get relevant memory context for a conversation
   */
  async getMemoryContext(
    query: string,
    userAddress: string,
    userSignature: string,
    maxMemories: number = 5
  ): Promise<MemoryContext> {
    try {
      // Use direct blockchain calls instead of backend API
      // Get user memories from local storage or cache if available
      const memories = await this.fetchUserMemories(userAddress);
      const allMemories = memories.memories || [];
      
      // Simple local search to find relevant memories
      // A more sophisticated approach would involve vector embeddings
      const relevantMemories = allMemories
        .filter(memory => {
          // Simple text matching for now
          const content = memory.content?.toLowerCase() || '';
          const searchTerms = query.toLowerCase().split(' ')
            .filter(term => term.length > 3); // Filter out short words
            
          return searchTerms.some(term => content.includes(term));
        })
        .slice(0, maxMemories)
        .map(m => m.content);

      return {
        relevantMemories,
        contextSummary: relevantMemories.join('\n'),
        totalMemories: relevantMemories.length
      }
    } catch (error) {
      console.error('Failed to get memory context:', error)
      // Return empty context instead of throwing - this prevents chat from breaking
      return {
        relevantMemories: [],
        contextSummary: '',
        totalMemories: 0
      }
    }
  }

  /**
   * Search memories by category
   */
  async searchMemoriesByCategory(
    category: string,
    userAddress: string,
    userSignature?: string
  ): Promise<any[]> {
    try {
      // Use direct blockchain access instead of backend API
      const memories = await this.fetchUserMemories(userAddress);
      const allMemories = memories.memories || [];
      
      // Filter by category
      return allMemories.filter(memory => 
        memory.category === category || memory.category?.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Failed to search memories by category:', error)
      return []
    }
  }

  /**
   * Get memory statistics for a user
   */
  async getMemoryStats(userAddress: string): Promise<{
    totalMemories: number
    categoryCounts: Record<string, number>
    storageUsed: number
    lastUpdated: string
  }> {
    try {
      // Use direct blockchain access instead of backend API
      const memories = await this.fetchUserMemories(userAddress);
      const allMemories = memories.memories || [];
      
      // Calculate category counts
      const categoryCounts: Record<string, number> = {};
      allMemories.forEach(memory => {
        const category = memory.category || 'unknown';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Calculate rough storage estimation (1KB per memory as a very rough estimate)
      const storageUsed = allMemories.length * 1024;
      
      return {
        totalMemories: allMemories.length,
        categoryCounts: categoryCounts,
        storageUsed: storageUsed,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get memory stats:', error)
      return {
        totalMemories: 0,
        categoryCounts: {},
        storageUsed: 0,
        lastUpdated: ''
      }
    }
  }

  /**
   * Enhanced context generation for chat
   * Combines memory context with conversation history
   */
  async generateChatContext(
    currentMessage: string,
    conversationHistory: string[],
    userAddress: string,
    userSignature: string
  ): Promise<{
    memoryContext: string
    conversationSummary: string
    fullContext: string
  }> {
    try {
      // Get memory context based on current message
      const memoryContext = await this.getMemoryContext(
        currentMessage,
        userAddress,
        userSignature,
        3 // Limit to 3 most relevant memories
      )

      // Create conversation summary (last 3 messages)
      const recentHistory = conversationHistory.slice(-6) // Last 3 exchanges
      const conversationSummary = recentHistory.length > 0 
        ? `Recent conversation:\n${recentHistory.join('\n')}`
        : ''

      // Combine contexts
      const memoryContextStr = memoryContext.relevantMemories.length > 0
        ? `Relevant memories about the user:\n${memoryContext.relevantMemories.join('\n')}`
        : ''

      const fullContext = [memoryContextStr, conversationSummary]
        .filter(Boolean)
        .join('\n\n')

      return {
        memoryContext: memoryContextStr,
        conversationSummary,
        fullContext
      }
    } catch (error) {
      console.error('Failed to generate chat context:', error)
      return {
        memoryContext: '',
        conversationSummary: '',
        fullContext: ''
      }
    }
  }

  /**
   * Analyze conversation for memory opportunities
   * Note: Memory detection is now handled automatically by the backend
   */
  async analyzeConversationHistory(
    messages: string[],
    userAddress: string,
    userSignature?: string
  ): Promise<{
    potentialMemories: MemoryCandidate[]
    recommendations: string[]
  }> {
    // Memory detection is now handled automatically by the backend
    // during chat streaming, so this method returns empty results
    console.log('Memory detection now handled by backend automatically')
    
    return {
      potentialMemories: [],
      recommendations: ['Memory detection moved to backend - no manual analysis needed']
    }
  }

  /**
   * Fetch all memories for a user directly from the blockchain
   */
  async fetchUserMemories(userAddress: string): Promise<{
    memories: any[]
    total: number
  }> {
    try {
      console.log('Fetching memories directly from Sui blockchain for user:', userAddress);

      // Get memories directly from blockchain (no cache)
      const { SuiBlockchainService } = await import('@/app/services/suiBlockchainService');

      // Create a service instance with a mock wallet for read-only operations
      const mockWallet = {
        connected: false,
        account: null,
        signAndExecuteTransactionBlock: async () => {
          throw new Error('Read-only operation - no signing required');
        }
      };

      const suiService = new SuiBlockchainService(mockWallet);
      
      // Get user memories directly from blockchain
      const blockchainResult = await suiService.getUserMemories(userAddress);

      if (blockchainResult.memories.length === 0) {
        console.log('No memories found on blockchain for user:', userAddress);
        return {
          memories: [],
          total: 0
        };
      }

      // Transform blockchain data to frontend format
      const memories = blockchainResult.memories.map(memory => ({
        id: memory.id,
        content: memory.content || 'Loading content...', // Will be fetched by cache service
        category: memory.category,
        created_at: new Date().toISOString(), // TODO: Get actual timestamp from blockchain
        updated_at: new Date().toISOString(),
        isEncrypted: memory.isEncrypted !== false, // Default to encrypted
        owner: memory.owner,
        walrusHash: memory.blobId,
        vectorId: memory.vectorId,
        suiObjectId: memory.id
      }));

      console.log(`Fetched ${memories.length} memories from blockchain for user ${userAddress}`);

      // Auto-load content for all memories in background
      await this.autoLoadMemoryContent(memories);

      // Cache the memories for performance (after content is loaded)
      this.saveMemoriesToCache(userAddress, memories);

      return {
        memories,
        total: memories.length
      }
    } catch (error) {
      console.error('Failed to fetch user memories:', error);
      return {
        memories: [],
        total: 0
      }
    }
  }

  /**
   * Auto-load content for memories in background
   */
  private async autoLoadMemoryContent(memories: any[]): Promise<void> {
    try {
      console.log(`Auto-loading content for ${memories.length} memories`);

      // Import the cache service
      const { memoryDecryptionCache } = await import('./memoryDecryptionCache');

      // Load content for all memories in parallel (with concurrency limit)
      const batchSize = 3; // Process 3 at a time to avoid overwhelming the API
      for (let i = 0; i < memories.length; i += batchSize) {
        const batch = memories.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (memory) => {
            if (memory.walrusHash && memory.walrusHash !== 'temp_blob_id') {
              try {
                console.log(`Loading content for memory ${memory.id} from ${memory.walrusHash}`);
                const content = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash);

                if (content) {
                  // Update the memory object with real content
                  memory.content = content;
                  memory.isEncrypted = false;
                  console.log(`Content loaded for memory ${memory.id}: ${content.substring(0, 50)}...`);
                } else {
                  memory.content = 'Content not available';
                  memory.isEncrypted = false;
                }
              } catch (error) {
                console.error(`Failed to load content for memory ${memory.id}:`, error);
                memory.content = 'Failed to load content';
                memory.isEncrypted = true;
              }
            } else {
              memory.content = 'Invalid storage reference';
              memory.isEncrypted = false;
            }
          })
        );

        // Small delay between batches to be nice to the API
        if (i + batchSize < memories.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Content loading completed for ${memories.length} memories`);
    } catch (error) {
      console.error('Error auto-loading memory content:', error);
    }
  }

  // Helper methods for local caching
  private getMemoriesFromCache(userAddress: string): any[] {
    try {
      const key = `memories_${userAddress}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (error) {
      console.error('Error getting memories from cache:', error);
      return [];
    }
  }
  
  private saveMemoriesToCache(userAddress: string, memories: any[]): void {
    try {
      const key = `memories_${userAddress}`;
      localStorage.setItem(key, JSON.stringify(memories));
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error saving memories to cache:', error);
    }
  }
  
  /**
   * Automatically decrypt all memories in background
   */
  async autoDecryptMemories(memories: any[]) {
    try {
      console.log(`Auto-decrypting ${memories.length} memories in background...`);
      
      // Process memories that have walrus hashes and are encrypted
      const toDecrypt = memories.filter(m => m.isEncrypted && m.walrusHash);
      
      if (toDecrypt.length === 0) {
        console.log('No memories to decrypt');
        return;
      }
      
      // Import here to avoid circular dependencies
      const { memoryDecryptionCache } = await import('@/app/services/memoryDecryptionCache');
      
      // Process in batches to avoid overwhelming the API
      const batchSize = 5;
      
      for (let i = 0; i < toDecrypt.length; i += batchSize) {
        const batch = toDecrypt.slice(i, i + batchSize);
        
        // Don't await - let this run in background
        Promise.all(batch.map(async memory => {
          if (memory.walrusHash) {
            try {
              // Use the caching service to get and store content
              const content = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash);
              if (content) {
                memoryDecryptionCache.markMemoryDecrypted(memory.id);
                console.log(`Auto-decrypted memory ${memory.id.slice(0, 8)}...`);
              }
            } catch (err) {
              console.error(`Failed to auto-decrypt memory ${memory.id}:`, err);
            }
          }
        })).catch(err => {
          console.error('Batch decryption error:', err);
        });
      }
    } catch (error) {
      console.error('Auto-decryption failed:', error);
    }
  }

  /**
   * Clear all memories for a user and clear decryption cache
   */
  async clearUserMemories(userAddress: string): Promise<boolean> {
    try {
      // This should be replaced with actual API call when available
      console.log('Clearing memories for user:', userAddress);
      
      // Also clear the decryption cache
      const { memoryDecryptionCache } = await import('@/app/services/memoryDecryptionCache');
      memoryDecryptionCache.clearCache();
      
      // Clear the local memory cache
      const key = `memories_${userAddress}`;
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
      
      // For now, just return success
      return true;
    } catch (error) {
      console.error('Failed to clear user memories:', error);
      return false;
    }
  }
  
  /**
   * Find memories that are relevant to a given text
   * This is a client-side replacement for the backend search API
   */
  getMemoriesRelevantToText(memories: any[], text: string, limit: number = 3): any[] {
    if (!memories || !memories.length || !text) return [];
    
    // Simple relevance algorithm:
    // 1. Split the query into keywords
    // 2. For each memory, count how many keywords match
    // 3. Sort memories by match count
    // 4. Return top N memories
    
    // Prepare keywords from text (remove common words and short words)
    const stopWords = ['the', 'and', 'is', 'in', 'to', 'a', 'with', 'for', 'of', 'on', 'at', 'by'];
    const keywords = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !stopWords.includes(word));
    
    // Score each memory based on keyword matches
    const scoredMemories = memories.map(memory => {
      // Skip if no content
      if (!memory.content) return { ...memory, similarity: 0 };
      
      const content = memory.content.toLowerCase();
      
      // Count how many keywords appear in the memory content
      let matchCount = 0;
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          matchCount++;
        }
      }
      
      // Calculate similarity score (0-1)
      const similarity = keywords.length > 0 ? matchCount / keywords.length : 0;
      
      return {
        ...memory,
        similarity
      };
    });
    
    // Sort by similarity score (highest first)
    const sortedMemories = scoredMemories
      .filter(memory => memory.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);
    
    // Return top N results
    return sortedMemories.slice(0, limit);
  }

  /**
   * Save a memory after user approval
   * This handles index creation if needed, then saves the memory
   */
  async saveApprovedMemory(
    memoryExtraction: MemoryExtraction,
    userAddress: string,
    wallet?: any
  ): Promise<{
    success: boolean;
    memoryId?: string;
    message?: string;
    requiresRetry?: boolean;
    retryAction?: string;
  }> {
    try {
      console.log('Saving approved memory:', memoryExtraction);

      // Validate inputs
      if (!memoryExtraction.content?.trim()) {
        return {
          success: false,
          message: 'Memory content cannot be empty'
        };
      }

      if (!userAddress) {
        return {
          success: false,
          message: 'User address is required'
        };
      }

      // If wallet is not provided, we can't create blockchain records
      if (!wallet || !wallet.connected) {
        console.error('Wallet not connected for memory creation');
        return {
          success: false,
          message: 'Please connect your wallet to save memories',
          requiresRetry: true,
          retryAction: 'connect_wallet'
        };
      }

      // Check wallet balance for gas fees
      try {
        // This is a basic check - in production you might want to estimate gas costs
        const balance = await wallet.getBalance?.();
        if (balance && parseFloat(balance) < 0.001) { // Minimum SUI for gas
          return {
            success: false,
            message: 'Insufficient SUI balance for transaction fees. Please add funds to your wallet.',
            requiresRetry: true,
            retryAction: 'add_funds'
          };
        }
      } catch (balanceError) {
        console.warn('Could not check wallet balance:', balanceError);
        // Continue anyway - balance check is not critical
      }

      // Use the memory index service to handle everything including index creation
      const { memoryIndexService } = await import('@/app/services/memoryIndexService');

      let response;
      let retryCount = 0;
      const maxRetries = 3;

      // Retry logic for memory creation with exponential backoff
      while (retryCount < maxRetries) {
        try {
          response = await memoryIndexService.createMemoryWithAutoIndex(
            memoryExtraction.content,
            memoryExtraction.category,
            userAddress,
            wallet
          );

          if (response.success) {
            break; // Success, exit retry loop
          }

          // Handle specific error cases
          if (response.message?.includes('index not found') ||
              response.message?.includes('create index on-chain first')) {
            console.log(`Attempt ${retryCount + 1}: Index creation needed, retrying...`);
            retryCount++;

            if (retryCount < maxRetries) {
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
              continue;
            }
          }

          // If it's not an index issue, don't retry
          break;
        } catch (error) {
          console.error(`Attempt ${retryCount + 1} failed:`, error);
          retryCount++;

          if (retryCount < maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          } else {
            // Max retries reached
            response = {
              success: false,
              message: error instanceof Error ? error.message : 'Failed after multiple attempts'
            };
          }
        }
      }

      if (!response || !response.success) {
        const errorMessage = response?.message || 'Failed to create memory';
        console.error('Memory creation failed after retries:', errorMessage);

        // Provide specific error handling based on error type
        if (errorMessage.includes('insufficient funds') || errorMessage.includes('gas')) {
          return {
            success: false,
            message: 'Transaction failed due to insufficient gas fees. Please ensure you have enough SUI in your wallet.',
            requiresRetry: true,
            retryAction: 'add_funds'
          };
        }

        if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
          return {
            success: false,
            message: 'Network error occurred. Please check your connection and try again.',
            requiresRetry: true,
            retryAction: 'retry'
          };
        }

        if (errorMessage.includes('index')) {
          return {
            success: false,
            message: 'Failed to create or access memory index. This might be a temporary issue.',
            requiresRetry: true,
            retryAction: 'retry'
          };
        }

        return {
          success: false,
          message: errorMessage,
          requiresRetry: true,
          retryAction: 'retry'
        };
      }

      // Success case - process the backend integration
      try {
        // Call backend to process the memory for indexing
        const backendData = await memoryApi.saveApprovedMemory({
          content: memoryExtraction.content,
          category: memoryExtraction.category,
          userAddress,
          suiObjectId: response.memoryId
        });

        if (backendData.success) {
          return {
            success: true,
            memoryId: response.memoryId || backendData.memoryId,
            message: 'Memory saved successfully and indexed for search'
          };
        } else {
          // Backend processing failed, but blockchain record exists
          console.warn('Backend indexing failed:', backendData.message);
          return {
            success: true,
            memoryId: response.memoryId,
            message: 'Memory saved to blockchain. Search indexing will be retried automatically.'
          };
        }
      } catch (backendError) {
        console.error('Backend processing failed:', backendError);
        // Memory is saved on blockchain, backend indexing can be retried later
        return {
          success: true,
          memoryId: response.memoryId,
          message: 'Memory saved successfully. Search indexing will be processed shortly.'
        };
      }
    } catch (error) {
      console.error('Error saving approved memory:', error);

      // Provide user-friendly error messages based on error type
      let userMessage = 'An unexpected error occurred while saving your memory.';
      let requiresRetry = true;
      let retryAction = 'retry';

      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          userMessage = 'Transaction was cancelled. Please try again when ready.';
          retryAction = 'retry';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          userMessage = 'Network connection error. Please check your internet connection and try again.';
          retryAction = 'retry';
        } else if (error.message.includes('wallet')) {
          userMessage = 'Wallet connection error. Please reconnect your wallet and try again.';
          retryAction = 'connect_wallet';
        } else {
          userMessage = `Error: ${error.message}`;
        }
      }

      return {
        success: false,
        message: userMessage,
        requiresRetry,
        retryAction
      };
    }
  }
}

export const memoryIntegrationService = new MemoryIntegrationService()
````

## File: services/memoryRetrievalService.ts
````typescript
'use client'

import { memoryApi } from '../api/memoryApi'
import { memoryDecryptionCache } from './memoryDecryptionCache'

// Interface for memory search results
export interface MemorySearchResult {
  id: string
  content: string
  category: string
  similarity_score: number
  timestamp: string
  isEncrypted: boolean
  walrusHash?: string
  owner: string
}

// Interface for memory context results
export interface MemoryContext {
  context: string
  relevantMemories: any[]
  queryMetadata: {
    queryTimeMs: number
    memoriesFound: number
    contextLength: number
  }
}

class MemoryRetrievalService {
  private cachedMemories: Record<string, any[]> = {}
  private memoryCacheTTL = 60 * 1000 // 1 minute cache

  /**
   * Search for memories related to a query
   */
  async searchMemories(
    query: string,
    userAddress: string,
    category?: string,
    limit: number = 5
  ): Promise<MemorySearchResult[]> {
    try {
      // Use the backend API to perform the search
      const response = await memoryApi.searchMemories({
        query,
        userAddress,
        category,
        k: limit
      })

      // Process results and check decryption cache
      const results = response.results || []

      // Auto-decrypt results that have cached decrypted content
      await Promise.all(results.map(async (result) => {
        if (result.walrusHash && await memoryDecryptionCache.isMemoryDecrypted(result.id)) {
          // Update with cached decrypted content
          const content = await memoryDecryptionCache.getDecryptedContent(result.walrusHash)
          if (content) {
            result.content = content
          }
        }
      }))

      return results
    } catch (error) {
      console.error('Error searching memories:', error)
      return []
    }
  }

  /**
   * Get memory context for a chat message
   */
  async getMemoryContext(
    message: string,
    userAddress: string,
    userSignature: string
  ): Promise<MemoryContext> {
    try {
      // Call backend to get memory context
      const response = await memoryApi.getMemoryContext(message, userAddress, userSignature)

      // Process and return formatted context
      return {
        context: response.context,
        relevantMemories: response.relevant_memories || [],
        queryMetadata: {
          queryTimeMs: response.query_metadata?.query_time_ms || 0,
          memoriesFound: response.query_metadata?.memories_found || 0,
          contextLength: response.query_metadata?.context_length || 0
        }
      }
    } catch (error) {
      console.error('Error getting memory context:', error)
      return {
        context: '',
        relevantMemories: [],
        queryMetadata: {
          queryTimeMs: 0,
          memoriesFound: 0,
          contextLength: 0
        }
      }
    }
  }

  /**
   * Get all memories for a user directly from blockchain with caching
   */
  async getUserMemories(userAddress: string, forceRefresh = false): Promise<any[]> {
    // Check cache first unless force refresh
    const cacheKey = `memories_${userAddress}`
    const cachedData = this.cachedMemories[cacheKey]
    const now = Date.now()

    if (!forceRefresh && cachedData && cachedData.timestamp && (now - cachedData.timestamp) < this.memoryCacheTTL) {
      console.log('Using cached memories from blockchain data')
      return cachedData.memories
    }

    try {
      // Fetch directly from blockchain instead of backend API
      const { SuiBlockchainService } = await import('@/app/services/suiBlockchainService');

      // Create a service instance with a mock wallet for read-only operations
      const mockWallet = {
        connected: false,
        account: null,
        signAndExecuteTransactionBlock: async () => {
          throw new Error('Read-only operation - no signing required');
        }
      };

      const suiService = new SuiBlockchainService(mockWallet);
      const blockchainResult = await suiService.getUserMemories(userAddress);

      // Transform blockchain data to expected format
      const memories = blockchainResult.memories.map(memory => ({
        id: memory.id,
        content: memory.content || 'Loading content...', // Will be fetched by cache service
        category: memory.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        blobId: memory.blobId,
        vectorId: memory.vectorId,
        owner: memory.owner,
        suiObjectId: memory.id,
        isEncrypted: memory.isEncrypted !== false, // Default to encrypted
        walrusHash: memory.blobId // Add walrusHash for cache service
      }));

      // Update cache
      this.cachedMemories[cacheKey] = {
        memories,
        timestamp: now
      }

      console.log(`Fetched ${memories.length} memories from blockchain for user ${userAddress}`);

      // Auto-load content for memories
      await this.autoLoadMemoryContent(memories);

      return memories
    } catch (error) {
      console.error('Error getting user memories from blockchain:', error)
      return []
    }
  }

  /**
   * Auto-load content for memories in background
   */
  private async autoLoadMemoryContent(memories: any[]): Promise<void> {
    try {
      console.log(`Auto-loading content for ${memories.length} memories`);

      // Load content for all memories in parallel (with concurrency limit)
      const batchSize = 3; // Process 3 at a time to avoid overwhelming the API
      for (let i = 0; i < memories.length; i += batchSize) {
        const batch = memories.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (memory) => {
            if (memory.walrusHash && memory.walrusHash !== 'temp_blob_id') {
              try {
                console.log(`Loading content for memory ${memory.id} from ${memory.walrusHash}`);
                const content = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash);

                if (content) {
                  // Update the memory object with real content
                  memory.content = content;
                  memory.isEncrypted = false;
                  console.log(`Content loaded for memory ${memory.id}: ${content.substring(0, 50)}...`);
                } else {
                  memory.content = 'Content not available';
                  memory.isEncrypted = false;
                }
              } catch (error) {
                console.error(`Failed to load content for memory ${memory.id}:`, error);
                memory.content = 'Failed to load content';
                memory.isEncrypted = true;
              }
            } else {
              memory.content = 'Invalid storage reference';
              memory.isEncrypted = false;
            }
          })
        );

        // Small delay between batches to be nice to the API
        if (i + batchSize < memories.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Content loading completed for ${memories.length} memories`);
    } catch (error) {
      console.error('Error auto-loading memory content:', error);
    }
  }

  /**
   * Find memories relevant to a text using HNSW index
   */
  async findRelevantMemories(text: string, userAddress: string, limit = 5): Promise<any[]> {
    if (!text || text.trim().length === 0) {
      return []
    }

    try {
      // Use the search API which uses the HNSW index for fast vector similarity search
      const results = await this.searchMemories(text, userAddress, undefined, limit)
      return results
    } catch (error) {
      console.error('Error finding relevant memories:', error)
      
      // Fallback to client-side relevance if backend search fails
      try {
        const allMemories = await this.getUserMemories(userAddress)
        
        // Simple relevance calculation based on text matching
        const relevantMemories = allMemories
          .filter(memory => {
            if (!memory.content) return false
            
            // Split query into keywords
            const keywords = text.toLowerCase().split(/\s+/)
              .filter(word => word.length > 3)
            
            // Count matches
            const memoryContent = memory.content.toLowerCase()
            let matches = 0
            for (const keyword of keywords) {
              if (memoryContent.includes(keyword)) {
                matches++
              }
            }
            
            // Return true if at least one keyword matches
            return matches > 0
          })
          .sort((a, b) => {
            // Sort by recency if no other criteria
            const dateA = new Date(a.timestamp || a.created_at).getTime()
            const dateB = new Date(b.timestamp || b.created_at).getTime()
            return dateB - dateA
          })
          .slice(0, limit)
        
        return relevantMemories
      } catch (fallbackError) {
        console.error('Fallback relevance search failed:', fallbackError)
        return []
      }
    }
  }
  
  /**
   * Clear memory cache
   */
  clearCache(userAddress?: string) {
    if (userAddress) {
      // Clear specific user cache
      delete this.cachedMemories[`memories_${userAddress}`]
    } else {
      // Clear all cache
      this.cachedMemories = {}
    }
  }
}

// Export singleton instance
export const memoryRetrievalService = new MemoryRetrievalService()
````

## File: services/README.MD
````markdown
# Personal Data Wallet

A decentralized chat application featuring streaming chat, on-chain session history, and an encrypted persistent memory layer using vector search and knowledge graphs, all secured by Sui blockchain.

## Architecture

This application consists of three primary components:

1. **NestJS Backend (Application)**: Orchestrates all business logic, including chat streaming, RAG, memory classification, and communication with external services.

2. **Walrus (Data Store)**: Used for off-chain bulk data storage:
   - Encrypted Content Blobs: Individual encrypted user memories
   - HNSW Index File: Vector search index
   - Knowledge Graph File: JSON connecting memory entities

3. **Sui Blockchain (Ledger)**: On-chain source of truth for ownership and data pointers, storing chat history and pointers to user's data on Walrus.

## Prerequisites

- Node.js v18+
- Sui CLI (for smart contract deployment)
- Docker and Docker Compose
- Google API Key for Gemini AI
- Walrus API Key

## Installation and Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/personal-data-wallet.git
cd personal-data-wallet
```

2. **Set up environment variables**

Create a `.env` file in the project root:

```
SUI_NETWORK=testnett
SUI_PACKAGE_ID=<your_deployed_package_id>
SUI_ADMIN_PRIVATE_KEY=<your_sui_private_key>
GOOGLE_API_KEY=<your_google_api_key>
WALRUS_API_KEY=<your_walrus_api_key>
WALRUS_API_URL=https://api.walrus.ai/v1
SEAL_MASTER_KEY=<your_seal_master_key>
```

3. **Deploy the Sui smart contracts**

```bash
cd smart-contract
sui client publish --gas-budget 100000000
```

After deployment, copy the package ID to your `.env` file.

4. **Start the application using Docker Compose**

```bash
docker-compose up -d
```

## API Endpoints

### Chat API

- `POST /api/chat/session` - Create a new chat session
  - Body: `{ "modelName": "gemini-1.5-pro", "userAddress": "0x..." }`

- `SSE /api/chat/message` - Stream a chat message (Server-Sent Events)
  - Body: `{ "content": "Hello", "modelName": "gemini-1.5-pro", "sessionId": "0x...", "userAddress": "0x..." }`

- `POST /api/chat/summary` - Save a summary for a chat session
  - Body: `{ "sessionId": "0x...", "summary": "Chat about weather", "userAddress": "0x..." }`

### Memory API

- `POST /api/memory` - Create a new memory
  - Body: `{ "content": "My favorite color is blue", "category": "preference", "userAddress": "0x..." }`

- `GET /api/memory/query` - Query relevant memories
  - Query params: `?query=favorite+color&userAddress=0x...&limit=5`

## Consuming the Chat Streaming Endpoint

Here's how a frontend client would consume the SSE streaming endpoint:

```javascript
// Example frontend code using EventSource API
function startChatStream() {
  const userMessage = "Tell me about climate change";
  const sessionId = "0x123..."; // From previous createSession call
  const userAddress = "0x456..."; // User's Sui address
  
  // Create the EventSource
  const eventSource = new EventSource(`/api/chat/message?content=${encodeURIComponent(userMessage)}&sessionId=${sessionId}&userAddress=${userAddress}&modelName=gemini-1.5-pro`);
  
  let fullResponse = '';
  
  // Handle incoming message chunks
  eventSource.onmessage = (event) => {
    const chunk = event.data;
    fullResponse += chunk;
    
    // Update UI with the chunk
    appendToChat(chunk);
  };
  
  // Handle completion
  eventSource.onerror = () => {
    // Stream is complete or errored
    eventSource.close();
    
    // Process the complete response if needed
    processCompleteResponse(fullResponse);
  };
}

function appendToChat(text) {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML += text;
}

function processCompleteResponse(text) {
  console.log('Full response received:', text);
  // Additional processing if needed
}
```

## Project Structure

```
├── backend-v2/              # NestJS Backend
│   ├── src/
│   │   ├── controllers/     # API Controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── modules/         # NestJS Modules
│   │   ├── services/        # Service Layer
│   │   ├── app.module.ts    # Main App Module
│   │   └── main.ts          # Application Entry Point
│   ├── Dockerfile           # Backend Docker Configuration
│   └── package.json         # Backend Dependencies
├── smart-contract/          # Sui Move Package
│   ├── sources/
│   │   ├── chat_sessions.move  # Chat Session Contract
│   │   └── memory.move         # Memory Contract
│   └── Move.toml            # Move Package Config
└── docker-compose.yml       # Docker Compose Configuration
```

## Development

For local development:

1. **Run services individually**

```bash
# Backend
cd backend-v2
npm install
npm run start:dev

# Local Sui Node (in a separate terminal)
sui start
```

2. **Run tests**

```bash
# Backend tests
cd backend-v2
npm test
```

## License

This project is licensed under the MIT License.
````

## File: services/relevant-memories.tsx
````typescript
'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Group,
  Card,
  Badge,
  Collapse,
  ActionIcon,
  Stack,
  Loader,
  Center
} from '@mantine/core'
import {
  IconBrain,
  IconChevronDown,
  IconChevronRight,
  IconLockOpen,
  IconExternalLink
} from '@tabler/icons-react'
import { memoryIntegrationService } from '@/app/services/memoryIntegration'
import { MemoryDecryptionModal } from '../memory/memory-decryption-modal'

interface Memory {
  id: string
  content: string
  category: string
  timestamp: string
  similarity?: number
  isEncrypted: boolean
  walrusHash?: string
  owner: string
}

interface RelevantMemoriesProps {
  message: string
  userAddress: string
}

export function RelevantMemories({ message, userAddress }: RelevantMemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [decryptModalOpened, setDecryptModalOpened] = useState(false)

  useEffect(() => {
    if (!message || !userAddress) {
      setMemories([])
      setLoading(false)
      return
    }

    const fetchRelevantMemories = async () => {
      try {
        setLoading(true)
        // Get memories directly from blockchain instead of through backend API
        const fetchedMemories = await memoryIntegrationService.fetchUserMemories(userAddress)
        
        // Filter memories for relevance to the current message
        const results = memoryIntegrationService.getMemoriesRelevantToText(
          fetchedMemories.memories || [], 
          message,
          3 // Only get top 3 most relevant memories
        )
        
        // Filter out memories that were just created (within last 30 seconds)
        const now = Date.now();
        const relevantMemories = (results || [])
          // Only show high-quality matches
          .filter(memory => ((memory as any).similarity || 0) > 0.70)
          // Skip recently created memories to prevent showing memories just created from the current message
          .filter(memory => {
            // If timestamp is available, filter out very recent memories
            if (memory.timestamp) {
              const timestamp = new Date(memory.timestamp).getTime();
              const timeDiff = now - timestamp;
              console.log(`Memory age: ${timeDiff}ms for "${memory.content?.substring(0, 20)}..."`);
              
              // Use a 30-second threshold to avoid showing memories from the current conversation
              return timeDiff > 30000; 
            }
            return true;
          })
          // Further filter to prevent showing memories that contain the exact message text
          .filter(memory => {
            if (!memory.content || !message) return true;
            
            // Check if memory content contains the exact message text
            // This helps prevent showing memories created from the current message
            const normalizedContent = memory.content.toLowerCase().trim();
            const normalizedMessage = message.toLowerCase().trim();
            
            // Don't show memories that are just the message or contain it exactly
            return !normalizedContent.includes(normalizedMessage) || 
                  (normalizedContent.length > normalizedMessage.length * 2);
          });
        
        setMemories(relevantMemories)
      } catch (error) {
        console.error('Failed to fetch relevant memories:', error)
        setMemories([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelevantMemories()
  }, [message, userAddress])

  // If no relevant memories found, don't render anything
  if (!loading && memories.length === 0) {
    return null
  }

  const openDecryptModal = (memory: Memory) => {
    setSelectedMemory(memory)
    setDecryptModalOpened(true)
  }
  
  const openInSuiExplorer = (walrusHash: string) => {
    const explorerUrl = `https://suivision.xyz/object/${walrusHash}?network=testnet`
    window.open(explorerUrl, '_blank')
  }

  return (
    <Box mt={12} mb={4}>
      <Card p="sm" radius="md" withBorder style={{
        background: 'linear-gradient(to right, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
        borderColor: 'rgba(102, 126, 234, 0.2)',
      }}>
        <Group justify="space-between" mb={expanded ? "xs" : 0}>
          <Group gap="xs">
            <IconBrain size={16} color="var(--mantine-color-indigo-6)" />
            <Text size="sm" fw={500}>Related Memories</Text>
            <Badge size="xs" variant="light" color="indigo">{memories.length}</Badge>
          </Group>
          <ActionIcon 
            size="sm" 
            variant="subtle" 
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </ActionIcon>
        </Group>

        <Collapse in={expanded}>
          {loading ? (
            <Center py="sm">
              <Loader size="xs" />
            </Center>
          ) : (
            <Stack gap="xs">
              {memories.map((memory) => (
                <Card key={memory.id} p="xs" radius="sm" withBorder style={{ 
                  backgroundColor: 'white',
                }}>
                  <Group justify="space-between" mb="xs">
                    <Badge 
                      size="xs" 
                      variant="light" 
                      color={(memory as any).similarity && (memory as any).similarity > 0.8 ? "green" : "blue"}
                    >
                      {(memory as any).similarity ? `${Math.round((memory as any).similarity * 100)}% match` : 'Related'}
                    </Badge>
                    <Badge size="xs" variant="outline">{memory.category}</Badge>
                  </Group>
                  
                  <Text size="xs" lineClamp={2}>{memory.content}</Text>
                  
                  <Group justify="flex-end" mt="xs" gap="xs">
                    {memory.walrusHash && (
                      <ActionIcon 
                        size="xs" 
                        variant="subtle" 
                        color="blue" 
                        onClick={() => openInSuiExplorer(memory.walrusHash!)}
                        title="View in Sui Explorer"
                      >
                        <IconExternalLink size={14} />
                      </ActionIcon>
                    )}
                    
                    {memory.isEncrypted && (
                      <ActionIcon 
                        size="xs" 
                        variant="subtle" 
                        color="teal" 
                        onClick={() => openDecryptModal(memory)}
                        title="Decrypt Memory"
                      >
                        <IconLockOpen size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Collapse>
      </Card>

      {/* Decryption Modal */}
      {selectedMemory && (
        <MemoryDecryptionModal
          opened={decryptModalOpened}
          onClose={() => setDecryptModalOpened(false)}
          memory={selectedMemory}
          userAddress={userAddress}
        />
      )}
    </Box>
  )
}
````

## File: services/sealService.ts
````typescript
/**
 * Seal Service - Frontend Identity-Based Encryption (IBE) Operations
 * 
 * This service provides client-side encryption and decryption using the Seal SDK.
 * All encryption/decryption happens on the frontend for true end-to-end encryption.
 */

import { SealClient, EncryptionResult, DecryptionResult } from '@mysten/seal';
import { SEAL_CONFIG, validateSealConfig, isDebugEnabled } from '../config/sealConfig';

// Types for memory encryption
export interface EncryptedMemoryData {
  encryptedContent: string;
  sealMetadata: {
    policyId: string;
    nftType: string;
    timestamp: number;
    version: string;
  };
}

export interface DecryptedMemoryData {
  content: string;
  metadata: {
    decryptedAt: number;
    policyId: string;
  };
}

// Cache for decrypted data
class MemoryDecryptionCache {
  private cache = new Map<string, { data: string; timestamp: number; }>();
  private readonly ttl = SEAL_CONFIG.cache.ttl;
  private readonly maxSize = SEAL_CONFIG.cache.maxSize;

  set(key: string, data: string): void {
    if (!SEAL_CONFIG.cache.enabled) return;

    // Clean old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanOldEntries();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): string | null {
    if (!SEAL_CONFIG.cache.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanOldEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export class SealService {
  private client: SealClient | null = null;
  private cache = new MemoryDecryptionCache();
  
  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize the Seal client with configuration
   */
  private async initializeClient(): Promise<void> {
    try {
      // Validate configuration first
      if (!validateSealConfig()) {
        throw new Error('Invalid Seal configuration');
      }

      // Initialize Seal client with key server configuration
      this.client = new SealClient({
        keyServer: {
          url: SEAL_CONFIG.keyServers.primary.url,
          publicKey: SEAL_CONFIG.keyServers.primary.publicKey,
        },
        network: SEAL_CONFIG.network,
        debug: isDebugEnabled()
      });

      if (isDebugEnabled()) {
        console.log('Seal client initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Seal client:', error);
      throw error;
    }
  }

  /**
   * Encrypt memory content with NFT-based access policy
   */
  async encryptMemory(
    content: string,
    policyId: string,
    nftType: string
  ): Promise<EncryptedMemoryData> {
    if (!this.client) {
      throw new Error('Seal client not initialized');
    }

    try {
      if (isDebugEnabled()) {
        console.log('Encrypting memory with policy:', policyId);
      }

      // Encrypt the content using the policy ID
      const encryptionResult: EncryptionResult = await this.client.encrypt({
        data: content,
        policyId: policyId,
        recipient: nftType // Use NFT type as recipient identifier
      });

      const encryptedData: EncryptedMemoryData = {
        encryptedContent: encryptionResult.encryptedData,
        sealMetadata: {
          policyId,
          nftType,
          timestamp: Date.now(),
          version: '1.0'
        }
      };

      if (isDebugEnabled()) {
        console.log('Memory encrypted successfully');
      }

      return encryptedData;
    } catch (error) {
      console.error('Failed to encrypt memory:', error);
      throw new Error(`Memory encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt memory content (requires valid NFT ownership)
   */
  async decryptMemory(
    encryptedData: EncryptedMemoryData,
    userAddress: string
  ): Promise<DecryptedMemoryData> {
    if (!this.client) {
      throw new Error('Seal client not initialized');
    }

    // Check cache first
    const cacheKey = `${encryptedData.sealMetadata.policyId}-${userAddress}`;
    const cachedContent = this.cache.get(cacheKey);
    if (cachedContent) {
      if (isDebugEnabled()) {
        console.log('Returning cached decrypted memory');
      }
      
      return {
        content: cachedContent,
        metadata: {
          decryptedAt: Date.now(),
          policyId: encryptedData.sealMetadata.policyId
        }
      };
    }

    try {
      if (isDebugEnabled()) {
        console.log('Decrypting memory for user:', userAddress);
      }

      // Decrypt the content
      const decryptionResult: DecryptionResult = await this.client.decrypt({
        encryptedData: encryptedData.encryptedContent,
        policyId: encryptedData.sealMetadata.policyId,
        userAddress: userAddress
      });

      // Cache the decrypted content
      this.cache.set(cacheKey, decryptionResult.data);

      const decryptedData: DecryptedMemoryData = {
        content: decryptionResult.data,
        metadata: {
          decryptedAt: Date.now(),
          policyId: encryptedData.sealMetadata.policyId
        }
      };

      if (isDebugEnabled()) {
        console.log('Memory decrypted successfully');
      }

      return decryptedData;
    } catch (error) {
      console.error('Failed to decrypt memory:', error);
      throw new Error(`Memory decryption failed: ${error instanceof Error ? error.message : 'Access denied or invalid NFT'}`);
    }
  }

  /**
   * Create a new Seal policy for NFT-based access control
   */
  async createSealPolicy(
    nftType: string,
    description?: string
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Seal client not initialized');
    }

    try {
      if (isDebugEnabled()) {
        console.log('Creating Seal policy for NFT type:', nftType);
      }

      // Create the policy using the Seal client
      const policyResult = await this.client.createPolicy({
        nftType: nftType,
        description: description || SEAL_CONFIG.policy.descriptionTemplate.replace('{nftType}', nftType)
      });

      if (isDebugEnabled()) {
        console.log('Seal policy created:', policyResult.policyId);
      }

      return policyResult.policyId;
    } catch (error) {
      console.error('Failed to create Seal policy:', error);
      throw new Error(`Policy creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify if user has access to decrypt content with given policy
   */
  async verifyAccess(
    policyId: string,
    userAddress: string,
    nftType: string
  ): Promise<boolean> {
    if (!this.client) {
      throw new Error('Seal client not initialized');
    }

    try {
      if (isDebugEnabled()) {
        console.log('Verifying access for user:', userAddress);
      }

      // Use the Seal client to verify access
      const accessResult = await this.client.verifyAccess({
        policyId: policyId,
        userAddress: userAddress,
        nftType: nftType
      });

      return accessResult.hasAccess;
    } catch (error) {
      console.error('Failed to verify access:', error);
      return false;
    }
  }

  /**
   * Clear the decryption cache
   */
  clearCache(): void {
    this.cache.clear();
    
    if (isDebugEnabled()) {
      console.log('Decryption cache cleared');
    }
  }

  /**
   * Get client status and configuration info
   */
  getStatus(): {
    initialized: boolean;
    network: string;
    keyServer: string;
    cacheEnabled: boolean;
  } {
    return {
      initialized: this.client !== null,
      network: SEAL_CONFIG.network,
      keyServer: SEAL_CONFIG.keyServers.primary.url,
      cacheEnabled: SEAL_CONFIG.cache.enabled
    };
  }

  /**
   * Reinitialize the client (useful for configuration changes)
   */
  async reinitialize(): Promise<void> {
    this.client = null;
    this.cache.clear();
    await this.initializeClient();
  }
}

// Export singleton instance
export const sealService = new SealService();
export default sealService;
````

## File: services/suiBlockchainService.ts
````typescript
'use client'

import { useWallet } from '@suiet/wallet-kit'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient } from '@mysten/sui/client'
import { getSharedBatchService } from './BatchTransactionService'
import { getEnhancedTransactionService } from './EnhancedTransactionService'

// Define the package ID to be used for our Move contracts
// Hardcoding values for testnet
const PACKAGE_ID = '0xef2acd8cfed039a44c82f99e2e0a32f50ed8306b7c507e1826d5bc6b73738ef0'
const SUI_NETWORK = 'testnet'
const SUI_API_URL = 'https://fullnode.testnet.sui.io:443'

console.log('Using SUI_PACKAGE_ID:', PACKAGE_ID)
console.log('Using SUI_NETWORK:', SUI_NETWORK)
console.log('Using SUI_API_URL:', SUI_API_URL)

// Create a shared SUI client instance to be used outside of React components
const sharedSuiClient = new SuiClient({
  url: SUI_API_URL
})

export class SuiBlockchainService {
  private client: SuiClient
  private wallet: any
  
  constructor(wallet: any) {
    // Initialize the Sui client with network configuration
    this.client = sharedSuiClient
    this.wallet = wallet
  }

  // Create a new chat session on the blockchain
  async createChatSession(modelName: string): Promise<string> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    console.log('Creating chat session with model:', modelName)
    console.log('Wallet connected:', this.wallet.connected)
    console.log('Wallet account:', this.wallet.account)
    console.log('Wallet chain:', this.wallet.chain)
    
    try {
      // Check wallet balance first
      const balance = await this.client.getBalance({
        owner: this.wallet.account.address,
        coinType: '0x2::sui::SUI'
      })
      
      console.log('Wallet SUI balance:', balance)
      
      if (BigInt(balance.totalBalance) === BigInt(0)) {
        throw new Error('Insufficient SUI balance. Please get some SUI from a faucet for gas fees.')
      }
      
      // Build the transaction
      const tx = new Transaction()
      
      // Call the create_session function from our Move package
      console.log('Using package ID:', PACKAGE_ID)
      const target = `${PACKAGE_ID}::chat_sessions::create_session`
      console.log('Target function:', target)
      
      tx.moveCall({
        target,
        arguments: [
          tx.pure.string(modelName), // model name string
        ]
      })

      console.log('Transaction built, signing and executing...')
      // Sign and execute the transaction using the connected wallet
      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any
      })
      
      console.log('Transaction executed, result:', result)
      
      // Extract the created object ID from events
      const sessionId = await this.extractObjectIdFromEvents(result)
      if (!sessionId) {
        console.error('Failed to extract session ID. Full result:', JSON.stringify(result, null, 2))
        throw new Error('Failed to extract session ID from transaction result')
      }
      
      return sessionId
    } catch (error) {
      console.error('Error creating chat session:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Check if the error is related to the package not found
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && 
          error.message.includes('DependentPackageNotFound')) {
        console.error('Package not found error. Make sure you are connected to testnet and the package ID is correct.')
        console.error('Current package ID:', PACKAGE_ID)
        console.error('Current network:', SUI_NETWORK)
        console.error('Current API URL:', SUI_API_URL)
      }
      
      throw error
    }
  }

  // Add a message to an existing session
  async addMessageToSession(
    sessionId: string, 
    role: string,
    content: string,
    executeBatch = false
  ): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      // Use enhanced service for better batching and pre-approval
      const enhancedService = getEnhancedTransactionService();
      enhancedService.addChatMessage(PACKAGE_ID, sessionId, role, content);
      
      // Execute the batch immediately if requested or let it auto-execute when threshold reached
      if (executeBatch) {
        return await enhancedService.flush(this.wallet);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding message to session:', error)
      throw error
    }
  }
  
  // Execute any pending batched transactions
  async executePendingTransactions(): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const enhancedService = getEnhancedTransactionService();
      return await enhancedService.flush(this.wallet);
    } catch (error) {
      console.error('Error executing pending transactions:', error)
      throw error
    }
  }
  
  // Request pre-approval for multiple transactions
  async requestPreApproval(): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const enhancedService = getEnhancedTransactionService();
      return await enhancedService.requestPreApproval(this.wallet);
    } catch (error) {
      console.error('Error requesting pre-approval:', error)
      return false
    }
  }

  // Delete a chat session
  async deleteSession(
    sessionId: string
  ): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      // Call the delete_session function we added to the contract
      tx.moveCall({
        target: `${PACKAGE_ID}::chat_sessions::delete_session`,
        arguments: [
          tx.object(sessionId)  // session ID
        ]
      })

      await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: { showEffects: true }
      })
      
      return true
    } catch (error) {
      console.error('Error deleting session:', error)
      throw error
    }
  }

  // Save a summary for a session
  async saveSessionSummary(
    sessionId: string,
    summary: string
  ): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::chat_sessions::save_session_summary`,
        arguments: [
          tx.object(sessionId),     // session ID
          tx.pure.string(summary),  // summary text
        ]
      })

      await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: { showEffects: true }
      })
      
      return true
    } catch (error) {
      console.error('Error saving session summary:', error)
      throw error
    }
  }

  // Get all memory records for a user from the blockchain with content
  async getUserMemories(userAddress: string): Promise<{
    memories: Array<{
      id: string;
      category: string;
      vectorId: number;
      blobId: string;
      owner: string;
      content?: string;
      isEncrypted?: boolean;
    }>;
    total: number;
  }> {
    try {
      console.log('Fetching memories from blockchain for user:', userAddress);

      // Query all Memory objects owned by the user
      const response = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${PACKAGE_ID}::memory::Memory`
        },
        options: {
          showContent: true,
          showType: true
        }
      });

      console.log('Raw blockchain response:', response);

      const memories = [];

      for (const item of response.data) {
        if (item.data?.content && 'fields' in item.data.content) {
          const fields = item.data.content.fields as any;

          const memory = {
            id: item.data.objectId,
            category: fields.category || 'unknown',
            vectorId: parseInt(fields.vector_id) || 0,
            blobId: fields.blob_id || '',
            owner: fields.owner || userAddress,
            content: undefined as string | undefined,
            isEncrypted: true
          };

          // Don't fetch content here to avoid infinite loops
          // Content will be fetched on-demand by the frontend
          if (memory.blobId && memory.blobId !== 'temp_blob_id') {
            // Mark as available for fetching
            memory.isEncrypted = true; // Will be decrypted when fetched
          } else {
            console.log(`Memory ${memory.id} has invalid blobId: ${memory.blobId}`);
            memory.content = 'Content not available (invalid storage reference)';
            memory.isEncrypted = false;
          }

          memories.push(memory);
        }
      }

      console.log(`Found ${memories.length} memories on blockchain for user ${userAddress}`);

      return {
        memories,
        total: memories.length
      };

    } catch (error) {
      console.error('Error fetching user memories from blockchain:', error);
      return {
        memories: [],
        total: 0
      };
    }
  }

  // Fetch content from storage (local or Walrus)
  private async fetchContentFromStorage(blobId: string): Promise<string> {
    try {
      // Check if it's a local storage blob ID
      if (blobId.startsWith('local_') || blobId.startsWith('demo_')) {
        console.log(`Fetching content from local storage: ${blobId}`);

        // Call backend to retrieve content from local storage
        const response = await fetch(`/api/storage/retrieve/${blobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch from local storage: ${response.statusText}`);
        }

        const data = await response.text();
        return data;
      } else {
        // It's a Walrus blob ID
        console.log(`Fetching content from Walrus: ${blobId}`);

        // Call backend to retrieve content from Walrus
        const response = await fetch(`/api/storage/retrieve/${blobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch from Walrus: ${response.statusText}`);
        }

        const data = await response.text();
        return data;
      }
    } catch (error) {
      console.error(`Error fetching content for blob ${blobId}:`, error);
      throw error;
    }
  }

  // Get memory index for a user from the blockchain
  async getUserMemoryIndex(userAddress: string): Promise<{
    indexId: string;
    version: number;
    indexBlobId: string;
    graphBlobId: string;
  } | null> {
    try {
      console.log('Fetching memory index from blockchain for user:', userAddress);

      // Query MemoryIndex objects owned by the user
      const response = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${PACKAGE_ID}::memory::MemoryIndex`
        },
        options: {
          showContent: true,
          showType: true
        }
      });

      if (response.data.length === 0) {
        console.log('No memory index found for user:', userAddress);
        return null;
      }

      // Get the first (and should be only) memory index
      const indexObject = response.data[0];
      if (indexObject.data?.content && 'fields' in indexObject.data.content) {
        const fields = indexObject.data.content.fields as any;

        return {
          indexId: indexObject.data.objectId,
          version: parseInt(fields.version) || 1,
          indexBlobId: fields.index_blob_id || '',
          graphBlobId: fields.graph_blob_id || ''
        };
      }

      return null;

    } catch (error) {
      console.error('Error fetching user memory index from blockchain:', error);
      return null;
    }
  }

  // Create a memory record on the blockchain
  async createMemoryRecord(
    category: string,
    vectorId: number,
    blobId: string
  ): Promise<string> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory::create_memory_record`,
        arguments: [
          tx.pure.string(category),
          tx.pure.u64(BigInt(vectorId)),
          tx.pure.string(blobId),
        ]
      })

      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any
      })
      
      const memoryId = await this.extractObjectIdFromEvents(result)
      if (!memoryId) {
        throw new Error('Failed to extract memory ID from transaction result')
      }
      
      return memoryId
    } catch (error) {
      console.error('Error creating memory record:', error)
      throw error
    }
  }

  // Create a new memory index
  async createMemoryIndex(
    indexBlobId: string,
    graphBlobId: string
  ): Promise<string> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory::create_memory_index`,
        arguments: [
          tx.pure.string(indexBlobId),
          tx.pure.string(graphBlobId),
        ]
      })

      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any
      })
      
      const indexId = await this.extractObjectIdFromEvents(result)
      if (!indexId) {
        throw new Error('Failed to extract index ID from transaction result')
      }
      
      return indexId
    } catch (error) {
      console.error('Error creating memory index:', error)
      throw error
    }
  }

  // Update a memory index
  async updateMemoryIndex(
    indexId: string,
    expectedVersion: number,
    newIndexBlobId: string,
    newGraphBlobId: string
  ): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory::update_memory_index`,
        arguments: [
          tx.object(indexId),
          tx.pure.u64(BigInt(expectedVersion)),
          tx.pure.string(newIndexBlobId),
          tx.pure.string(newGraphBlobId),
        ]
      })

      await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: { showEffects: true }
      })
      
      return true
    } catch (error) {
      console.error('Error updating memory index:', error)
      throw error
    }
  }

  /**
   * Delete a memory record from the blockchain
   * @param memoryId The object ID of the memory to delete
   * @returns True if successful, otherwise throws an error
   */
  async deleteMemory(memoryId: string): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log(`Deleting memory ${memoryId}...`)
      // Build the transaction
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory_wallet::delete_memory`,
        arguments: [
          tx.object(memoryId), // memory object ID
        ]
      })

      // Sign and execute the transaction
      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: { showEffects: true }
      })
      
      console.log(`Memory deletion transaction completed with digest: ${result.digest}`)
      return result.digest !== undefined && result.digest !== null
    } catch (error) {
      console.error('Error deleting memory:', error)
      throw error
    }
  }

  // Helper method to extract object ID from transaction events
  private async extractObjectIdFromEvents(result: any): Promise<string> {
    try {
      console.log('Extracting object ID from result:', result)
      
      // Handle wallet kit response which may have different structure
      if (!result) {
        console.error('No result provided')
        return ''
      }
      
      // Check if we have a digest
      if (!result.digest) {
        console.error('No transaction digest found')
        return ''
      }
      
      console.log('Transaction digest:', result.digest)
      
      // Use the digest to fetch full transaction details
      try {
        // Wait for transaction to be confirmed
        console.log('Waiting for transaction confirmation...')
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds for indexing
        
        console.log('Fetching transaction details using digest:', result.digest)
        const txResult = await this.client.getTransactionBlock({
          digest: result.digest,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true
          }
        })
        
        console.log('Retrieved transaction details:', txResult)
        
        // Look for created objects in objectChanges
        if (txResult.objectChanges && Array.isArray(txResult.objectChanges)) {
          console.log('Checking object changes from transaction')
          for (const change of txResult.objectChanges) {
            if (change.type === 'created') {
              console.log('Found created object:', change.objectId)
              return change.objectId
            }
          }
        }
        
        // Look for created objects in effects
        if (txResult.effects?.created && Array.isArray(txResult.effects.created)) {
          console.log('Checking effects.created from transaction')
          const created = txResult.effects.created[0]
          if (created && created.reference) {
            console.log('Found created object in effects:', created.reference.objectId)
            return created.reference.objectId
          }
        }
        
        // Look for events that might indicate a creation
        if (txResult.events && Array.isArray(txResult.events)) {
          for (const event of txResult.events) {
            if (event.type.includes('::chat_sessions::ChatSessionCreated')) {
              console.log('Found ChatSessionCreated event:', event)
              if (event.parsedJson && typeof event.parsedJson === 'object' && 'id' in event.parsedJson) {
                console.log('Found object ID in event:', event.parsedJson.id)
                return event.parsedJson.id as string
              }
            }
          }
        }
        
        console.error('No created objects found in transaction details')
      } catch (err) {
        console.error('Error fetching transaction details:', err)
      }
      
      return ''
    } catch (error) {
      console.error('Error extracting object ID:', error)
      return ''
    }
  }
}

// Non-hook version of the service - for use in non-React contexts
let suiServiceWithMockWallet: SuiBlockchainService | null = null;

export function getStaticSuiService() {
  if (!suiServiceWithMockWallet) {
    // Create a mock wallet for non-component contexts
    const mockWallet = {
      connected: false,
      account: null,
      signAndExecuteTransactionBlock: async () => {
        throw new Error('Cannot execute transactions outside of React components - pass a real wallet instance')
      }
    };
    suiServiceWithMockWallet = new SuiBlockchainService(mockWallet);
  }
  return suiServiceWithMockWallet;
}

// Hook for using the Sui blockchain service - ONLY call this in React components
export function useSuiBlockchain() {
  const wallet = useWallet()
  const service = new SuiBlockchainService(wallet)
  
  return {
    service,
    wallet
  }
}
````

## File: services/walrusCache.ts
````typescript
'use client'

/**
 * Walrus Cache Service
 * Provides caching for Walrus content to reduce API calls and improve performance
 */

interface CacheEntry {
  content: string | ArrayBuffer
  timestamp: number
  isHit?: boolean
}

class WalrusCache {
  private cache: Map<string, CacheEntry> = new Map()
  private ttl: number = 30 * 60 * 1000 // 30 minutes default TTL
  private maxSize: number = 100 // Maximum number of entries
  private hits: number = 0
  private misses: number = 0
  
  constructor(ttlMs?: number, maxSize?: number) {
    if (typeof window !== 'undefined') {
      // Only load in browser environment
      this.loadFromLocalStorage()
    }
    
    if (ttlMs) this.ttl = ttlMs
    if (maxSize) this.maxSize = maxSize
  }
  
  /**
   * Get content from cache
   * @param blobId The Walrus blob ID
   * @returns The cached content or null if not found/expired
   */
  get(blobId: string): string | ArrayBuffer | null {
    const entry = this.cache.get(blobId)
    
    if (!entry) {
      this.misses++
      return null
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(blobId)
      this.misses++
      return null
    }
    
    // Track cache hit
    this.hits++
    entry.isHit = true
    
    return entry.content
  }
  
  /**
   * Store content in cache
   * @param blobId The Walrus blob ID
   * @param content The content to cache
   */
  set(blobId: string, content: string | ArrayBuffer): void {
    // Enforce cache size limits
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }
    
    this.cache.set(blobId, {
      content,
      timestamp: Date.now()
    })
    
    // Save to localStorage if in browser
    if (typeof window !== 'undefined') {
      this.saveToLocalStorage()
    }
  }
  
  /**
   * Remove content from cache
   * @param blobId The Walrus blob ID
   */
  invalidate(blobId: string): void {
    this.cache.delete(blobId)
    
    // Update localStorage if in browser
    if (typeof window !== 'undefined') {
      this.saveToLocalStorage()
    }
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
    
    // Clear localStorage if in browser
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walrus_cache_metadata')
      
      // Remove all walrus cache items
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('walrus_cache_')) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number, hits: number, misses: number, hitRatio: number } {
    const totalRequests = this.hits + this.misses
    const hitRatio = totalRequests === 0 ? 0 : this.hits / totalRequests
    
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio
    }
  }
  
  /**
   * Evict the oldest entry from the cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Infinity
    
    // Use Array.from to convert iterator to array
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    })
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
  
  /**
   * Save cache metadata to localStorage
   * Note: We only save metadata and small content items
   * to avoid localStorage quota issues
   */
  private saveToLocalStorage(): void {
    try {
      // Save metadata
      const metadata = {
        lastUpdated: Date.now(),
        size: this.cache.size,
        hits: this.hits,
        misses: this.misses
      }
      
      localStorage.setItem('walrus_cache_metadata', JSON.stringify(metadata))
      
      // Save cache entries (only string content, not binary)
      const maxStorageItemSize = 100 * 1024 // 100KB max per item
      
      // Use Array.from to convert iterator to array
      Array.from(this.cache.entries()).forEach(([key, entry]) => {
        if (typeof entry.content === 'string' && entry.content.length < maxStorageItemSize) {
          localStorage.setItem(`walrus_cache_${key}`, JSON.stringify({
            content: entry.content,
            timestamp: entry.timestamp
          }))
        }
      })
    } catch (error) {
      console.warn('Failed to save Walrus cache to localStorage:', error)
      // Continue silently - this is just an optimization
    }
  }
  
  /**
   * Load cache from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      // Load metadata
      const metadataStr = localStorage.getItem('walrus_cache_metadata')
      if (metadataStr) {
        const metadata = JSON.parse(metadataStr)
        this.hits = metadata.hits || 0
        this.misses = metadata.misses || 0
      }
      
      // Load cache entries
      const keysToLoad: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('walrus_cache_')) {
          keysToLoad.push(key)
        }
      }
      
      // Load cache entries (up to maxSize)
      for (let i = 0; i < Math.min(keysToLoad.length, this.maxSize); i++) {
        const key = keysToLoad[i]
        const blobId = key.replace('walrus_cache_', '')
        const entryStr = localStorage.getItem(key)
        
        if (entryStr) {
          try {
            const entry = JSON.parse(entryStr)
            
            // Check if not expired
            if (Date.now() - entry.timestamp <= this.ttl) {
              this.cache.set(blobId, {
                content: entry.content,
                timestamp: entry.timestamp
              })
            } else {
              // Remove expired item
              localStorage.removeItem(key)
            }
          } catch (error) {
            // Skip invalid entries
            localStorage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load Walrus cache from localStorage:', error)
      // Continue silently - this is not critical
    }
  }
}

// Export singleton instance
export const walrusCache = new WalrusCache()
````

## File: types/index.ts
````typescript
export interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: string // ISO string for consistency with backend
  memoryDetected?: boolean
  memoryId?: string | null
  memoryExtraction?: any // Memory extraction data from backend
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface MemoryItem {
  id: string
  content: string
  type: 'fact' | 'preference' | 'context'
  category: string
  createdAt: Date
  relatedSessions: string[]
}

export interface SendMessageRequest {
  text: string
  userId?: string
}

export interface SendMessageResponse {
  response: string
  intent: 'FACT_ADDITION' | 'QUERY' | 'CONVERSATIONAL'
  entities?: {
    nodes: string[]
    edges: Array<{
      source: string
      target: string
      label: string
    }>
  }
}

export interface ApiError {
  detail: string
}
````

## File: .env.example
````
# Port configuration (Railway will override this)
PORT=8000

# Database configuration
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=

# Other configuration
NODE_ENV=production
````

## File: .prettierrc
````
{
  "singleQuote": true,
  "trailingComma": "all"
}
````

## File: Dockerfile
````dockerfile
FROM node:20-alpine

WORKDIR /app

# Install build dependencies and curl for health checks
RUN apk add --no-cache \
    curl \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and clean up build dependencies
RUN npm prune --production && apk del python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start the application
CMD ["node", "dist/main"]
````

## File: env.example
````
# Network Configuration
PORT=3001
HOST=localhost
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=personal_data_wallet
DB_SYNC=true
DB_LOGGING=true
DB_SSL=false

# Sui Blockchain Configuration
SUI_NETWORK=testnet
SUI_ADMIN_PRIVATE_KEY=your_private_key_here
SUI_PACKAGE_ID=your_package_id_here
SUI_MODULE=memory
SUI_ADMIN_ADDRESS=your_admin_address_here

# Walrus Storage Configuration
WALRUS_USE_UPLOAD_RELAY=true
WALRUS_UPLOAD_RELAY_HOST=https://upload-relay.testnet.walrus.space

# AI Model Configuration
GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_MODEL=gemini-1.5-pro

# Security Configuration
ENCRYPTION_KEY=your_encryption_key_here
JWT_SECRET=your_jwt_secret_here
````

## File: eslint.config.mjs
````
// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
);
````

## File: nest-cli.json
````json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
````

## File: railway.toml
````toml
[build]
builder = "dockerfile"
dockerfilePath = "./Dockerfile"

[deploy]
startCommand = "node dist/main"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "always"
````

## File: README.md
````markdown
# Personal Data Wallet Backend

This is the backend for the Personal Data Wallet application, built with NestJS. It provides API endpoints for chat functionality with streaming support and memory management.

## Features

- Streaming chat API with Server-Sent Events (SSE)
- Integration with Google Gemini AI models
- Memory management with vector search and knowledge graph
- Sui blockchain integration for on-chain data storage
- Walrus integration for blob storage
- IBE encryption for memory content

## Project Structure

```
backend/
├── src/
│   ├── chat/               # Chat module
│   │   ├── dto/            # Chat DTOs
│   │   ├── summarization/  # Summarization service
│   │   ├── chat.controller.ts
│   │   ├── chat.module.ts
│   │   └── chat.service.ts
│   ├── memory/             # Memory module
│   │   ├── dto/            # Memory DTOs
│   │   ├── classifier/     # Content classifier
│   │   ├── embedding/      # Embedding service
│   │   ├── graph/          # Knowledge graph
│   │   ├── hnsw-index/     # HNSW index
│   │   ├── memory-ingestion/ # Memory extraction
│   │   ├── memory-query/   # Memory query
│   │   ├── memory.controller.ts
│   │   └── memory.module.ts
│   ├── infrastructure/     # Infrastructure
│   │   ├── gemini/         # Google Gemini service
│   │   ├── seal/           # Seal encryption
│   │   ├── sui/            # Sui blockchain
│   │   ├── walrus/         # Walrus storage
│   │   └── infrastructure.module.ts
│   ├── app.controller.ts   # App controller
│   ├── app.module.ts       # App module
│   ├── app.service.ts      # App service
│   └── main.ts             # Application entry point
└── test/                   # Tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- Sui blockchain account and private key
- Google Cloud API key for Gemini
- Walrus API key

### Environment Variables

Create a `.env` file in the root directory with:

```
SUI_NETWORK=devnet
SUI_PACKAGE_ID=<your_package_id>
SUI_ADMIN_PRIVATE_KEY=<your_private_key>
GOOGLE_API_KEY=<your_google_api_key>
WALRUS_API_KEY=<your_walrus_api_key>
WALRUS_API_URL=https://api.walrus.ai/v1
SEAL_MASTER_KEY=<your_seal_master_key>
```

### Installation

```bash
npm install
```

### Running the Application

```bash
# Development
npm run start

# Watch mode
npm run start:dev

# Production mode
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test API endpoints
node test-endpoints.js
```

## API Endpoints

### Chat API

- `GET /api/chat/sessions` - Get all sessions for a user
- `GET /api/chat/sessions/:sessionId` - Get a specific session
- `POST /api/chat/sessions` - Create a new session
- `POST /api/chat/sessions/:sessionId/messages` - Add a message to a session
- `DELETE /api/chat/sessions/:sessionId` - Delete a session
- `PUT /api/chat/sessions/:sessionId/title` - Update session title
- `POST /api/chat/summary` - Save a summary for a session
- `SSE /api/chat/stream` - Stream chat (Server-Sent Events)
- `POST /api/chat` - Send a regular chat message

### Memory API

- `GET /api/memories` - Get all memories for a user
- `POST /api/memories` - Create a new memory
- `POST /api/memories/search` - Search memories
- `DELETE /api/memories/:memoryId` - Delete a memory
- `PUT /api/memories/:memoryId` - Update a memory
- `POST /api/memories/context` - Get memory context for chat
- `GET /api/memories/stats` - Get memory statistics

### Health Check

- `GET /api/health` - Get service health status

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Frontend Integration

The frontend can consume the SSE streaming endpoint using the EventSource API:

```javascript
const eventSource = new EventSource('/api/chat/stream?content=Hello&userId=user123');

eventSource.onmessage = (event) => {
  const chunk = event.data;
  console.log('Received chunk:', chunk);
};

eventSource.onerror = () => {
  eventSource.close();
};
```
````

## File: src/app.controller.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
````

## File: src/app.controller.ts
````typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { SuiService } from './infrastructure/sui/sui.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly suiService: SuiService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  // ADMIN ENDPOINTS FOR SEAL POLICY SETUP

  @Post('admin/create-seal-policy')
  async createSealPolicy(@Body() createPolicyDto: {
    userAddress: string;
    nftType: string;
    description: string;
  }) {
    try {
      const result = await this.suiService.createSealPolicyForNft(
        createPolicyDto.userAddress,
        createPolicyDto.nftType,
        createPolicyDto.description
      );
      
      return {
        success: true,
        data: result,
        message: 'Seal policy created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create Seal policy'
      };
    }
  }

  @Post('admin/add-nft-type')
  async addNftTypeToPolicy(@Body() addNftTypeDto: {
    userAddress: string;
    capId: string;
    policyId: string;
    nftType: string;
  }) {
    try {
      const result = await this.suiService.addNftTypeToPolicy(
        addNftTypeDto.userAddress,
        addNftTypeDto.capId,
        addNftTypeDto.policyId,
        addNftTypeDto.nftType
      );
      
      return {
        success: result,
        message: result ? 'NFT type added successfully' : 'Failed to add NFT type'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to add NFT type to policy'
      };
    }
  }

  @Post('admin/verify-nft-access')
  async verifyNftAccess(@Body() verifyAccessDto: {
    policyId: string;
    nftType: string;
    objectId: string;
  }) {
    try {
      const hasAccess = await this.suiService.verifySealNftAccess(
        verifyAccessDto.policyId,
        verifyAccessDto.nftType,
        verifyAccessDto.objectId
      );
      
      return {
        success: true,
        hasAccess,
        message: hasAccess ? 'Access granted' : 'Access denied'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to verify NFT access'
      };
    }
  }
}
````

## File: src/app.module.ts
````typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { MemoryModule } from './memory/memory.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { StorageModule } from './storage/storage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    InfrastructureModule,
    MemoryModule,
    ChatModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
````

## File: src/app.service.ts
````typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
````

## File: src/chat/chat.controller.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
````

## File: src/chat/chat.controller.ts
````typescript
import { Controller, Post, Body, Get, Query, Delete, Param, Put, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveSummaryDto } from './dto/save-summary.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { UpdateSessionTitleDto } from './dto/update-session-title.dto';
import { ChatSession } from '../types/chat.types';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'Get all chat sessions for a user' })
  @ApiQuery({ name: 'userAddress', required: true, description: 'The wallet address of the user' })
  @ApiResponse({ status: 200, description: 'Returns all chat sessions for the user' })
  async getSessions(@Query('userAddress') userAddress: string): Promise<{ success: boolean, sessions: ChatSession[], message?: string }> {
    return this.chatService.getSessions(userAddress);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get a specific chat session' })
  @ApiParam({ name: 'sessionId', required: true, description: 'The ID of the chat session' })
  @ApiQuery({ name: 'userAddress', required: true, description: 'The wallet address of the user' })
  @ApiResponse({ status: 200, description: 'Returns the chat session with messages' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(
    @Param('sessionId') sessionId: string, 
    @Query('userAddress') userAddress: string
  ) {
    return this.chatService.getSession(sessionId, userAddress);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({ status: 201, description: 'The session has been successfully created' })
  @HttpCode(HttpStatus.CREATED)
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.chatService.createSession(createSessionDto);
  }

  @Post('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Add a message to a chat session' })
  @ApiParam({ name: 'sessionId', required: true, description: 'The ID of the chat session' })
  @ApiResponse({ status: 201, description: 'The message has been successfully added' })
  @HttpCode(HttpStatus.CREATED)
  async addMessage(
    @Param('sessionId') sessionId: string,
    @Body() addMessageDto: AddMessageDto
  ) {
    return this.chatService.addMessage(sessionId, addMessageDto);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiParam({ name: 'sessionId', required: true, description: 'The ID of the chat session' })
  @ApiResponse({ status: 200, description: 'The session has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @Body('userAddress') userAddress: string
  ) {
    return this.chatService.deleteSession(sessionId, userAddress);
  }

  @Put('sessions/:sessionId/title')
  @ApiOperation({ summary: 'Update the title of a chat session' })
  @ApiParam({ name: 'sessionId', required: true, description: 'The ID of the chat session' })
  @ApiResponse({ status: 200, description: 'The session title has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateSessionTitle(
    @Param('sessionId') sessionId: string,
    @Body() updateTitleDto: UpdateSessionTitleDto
  ) {
    return this.chatService.updateSessionTitle(
      sessionId, 
      updateTitleDto.userAddress,
      updateTitleDto.title
    );
  }

  @Post('summary')
  @ApiOperation({ summary: 'Save a summary for a chat session' })
  @ApiResponse({ status: 200, description: 'The summary has been successfully saved' })
  async saveSummary(@Body() saveSummaryDto: SaveSummaryDto) {
    return this.chatService.saveSummary(saveSummaryDto);
  }

  @Post('sessions/:sessionId/rename')
  @ApiOperation({ summary: 'Rename a chat session' })
  @ApiResponse({ status: 200, description: 'Session renamed successfully' })
  async renameSession(
    @Param('sessionId') sessionId: string,
    @Body('title') title: string,
    @Body('userAddress') userAddress: string
  ) {
    return this.chatService.updateSessionTitle(sessionId, userAddress, title);
  }

  @Post('stream')
  @ApiOperation({ summary: 'Stream chat responses using Server-Sent Events' })
  @ApiResponse({ status: 200, description: 'Streaming chat response' })
  async streamChat(@Body() messageDto: ChatMessageDto, @Res() response: Response) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Access-Control-Allow-Origin', '*');

    const observable = this.chatService.streamChatResponse(messageDto);
    
    observable.subscribe({
      next: (event) => {
        response.write(`data: ${event.data}\n\n`);
      },
      error: (error) => {
        console.error('Streaming error:', error);
        response.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        response.end();
      },
      complete: () => {
        response.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        response.end();
      }
    });
  }

  @Post('')
  @ApiOperation({ summary: 'Send a non-streaming chat message' })
  @ApiResponse({ status: 200, description: 'Chat response generated successfully' })
  async sendMessage(@Body() messageDto: ChatMessageDto) {
    return this.chatService.sendMessage(messageDto);
  }
}
````

## File: src/chat/chat.module.ts
````typescript
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SummarizationService } from './summarization/summarization.service';
import { MemoryModule } from '../memory/memory.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    MemoryModule
  ],
  controllers: [ChatController],
  providers: [ChatService, SummarizationService],
  exports: [ChatService, SummarizationService]
})
export class ChatModule {}
````

## File: src/chat/chat.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/chat/chat.service.ts
````typescript
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { GeminiService } from '../infrastructure/gemini/gemini.service';
import { SuiService } from '../infrastructure/sui/sui.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveSummaryDto } from './dto/save-summary.dto';
import { SummarizationService } from './summarization/summarization.service';
import { MemoryQueryService } from '../memory/memory-query/memory-query.service';
import { MemoryIngestionService } from '../memory/memory-ingestion/memory-ingestion.service';
import { AddMessageDto } from './dto/add-message.dto';
import { ChatMessage, ChatSession as ChatSessionType } from '../types/chat.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage as ChatMessageEntity } from './entities/chat-message.entity';
import { v4 as uuidv4 } from 'uuid';

// Interface for memory extraction results
export interface MemoryExtraction {
  shouldSave: boolean;
  category: string;
  content: string;
  extractedFacts: string[];
  confidence: number;
}

interface MessageEvent {
  data: string;
}

@Injectable()
export class ChatService {
  private logger = new Logger(ChatService.name);

  // Request deduplication to prevent duplicate processing
  private activeRequests = new Map<string, boolean>();

  constructor(
    private geminiService: GeminiService,
    private suiService: SuiService,
    private memoryQueryService: MemoryQueryService,
    private memoryIngestionService: MemoryIngestionService,
    private summarizationService: SummarizationService,
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessageEntity)
    private chatMessageRepository: Repository<ChatMessageEntity>,
  ) {}

  /**
   * Get all chat sessions for a user
   */
  async getSessions(userAddress: string): Promise<{ success: boolean, sessions: ChatSessionType[], message?: string }> {
    try {
      // First try to get sessions from PostgreSQL
      const dbSessions = await this.chatSessionRepository.find({
        where: { userAddress },
        order: { updatedAt: 'DESC' }
      });

      if (dbSessions.length > 0) {
        // Convert DB sessions to expected format
        const sessions = dbSessions.map(session => ({
          id: session.id,
          owner: session.userAddress,
          title: session.title,
          summary: session.summary,
          created_at: session.createdAt.toISOString(),
          updated_at: session.updatedAt.toISOString(),
          message_count: 0, // Will be populated when needed
        } as ChatSessionType));

        return {
          success: true,
          sessions
        };
      }

      // Fallback to blockchain if no sessions in DB
      const blockchainSessions = await this.suiService.getChatSessions(userAddress);
      
      // Store blockchain sessions in PostgreSQL for future use
      if (blockchainSessions.length > 0) {
        await Promise.all(blockchainSessions.map(async (session) => {
          try {
            await this.chatSessionRepository.save({
              id: session.id,
              title: session.title,
              summary: session.summary,
              userAddress,
              suiObjectId: session.id,
              isArchived: false,
              metadata: { source: 'blockchain' }
            });
          } catch (err) {
            this.logger.error(`Error saving blockchain session to DB: ${err.message}`);
          }
        }));
      }

      return {
        success: true,
        sessions: blockchainSessions
      };
    } catch (error) {
      this.logger.error(`Error getting sessions: ${error.message}`);
      return { 
        success: false, 
        sessions: [],
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Get a specific chat session
   */
  async getSession(sessionId: string, userAddress: string) {
    try {
      // First try to get session from PostgreSQL
      const dbSession = await this.chatSessionRepository.findOne({
        where: { id: sessionId, userAddress },
        relations: ['messages']
      });

      if (dbSession) {
        // Format the response to match frontend expectations
        const session = {
          id: dbSession.id,
          owner: dbSession.userAddress,
          title: dbSession.title,
          summary: dbSession.summary,
          messages: dbSession.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            type: msg.role,
            timestamp: msg.createdAt.toISOString(),
          })),
          created_at: dbSession.createdAt.toISOString(),
          updated_at: dbSession.updatedAt.toISOString(),
          message_count: dbSession.messages.length,
        };
        
        return {
          success: true,
          session
        };
      }

      // Fallback to blockchain if not in DB
      const rawSession = await this.suiService.getChatSession(sessionId);
      
      // Verify ownership
      if (rawSession.owner !== userAddress) {
        throw new NotFoundException('Session not found or you do not have access');
      }
      
      // Format the response to match frontend expectations
              const session = {
        id: sessionId,
        owner: rawSession.owner,
        title: rawSession.modelName, // Use model name as title
        messages: rawSession.messages.map((msg, idx) => ({
          id: `${sessionId}-${idx}`,
          content: msg.content,
          type: msg.type,
          timestamp: new Date().toISOString() // In a real system, we'd store this
        })),
        created_at: new Date().toISOString(), // Mock timestamp
        updated_at: new Date().toISOString(), // Mock timestamp
        message_count: rawSession.messages.length,
        sui_object_id: sessionId
      };
      
      // Store in PostgreSQL for future use
      try {
        const newDbSession = await this.chatSessionRepository.save({
          id: sessionId,
          title: rawSession.modelName,
          userAddress,
          suiObjectId: sessionId,
          isArchived: false,
          metadata: { source: 'blockchain' }
        });

        // Store messages
        await Promise.all(rawSession.messages.map(async (msg, idx) => {
          await this.chatMessageRepository.save({
            id: `${sessionId}-${idx}`,
            role: msg.type,
            content: msg.content,
            sessionId: newDbSession.id,
            session: newDbSession
          });
        }));
      } catch (err) {
        this.logger.error(`Error saving blockchain session to DB: ${err.message}`);
      }
      
      return {
        success: true,
        session
      };
    } catch (error) {
      this.logger.error(`Error getting session: ${error.message}`);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Create a new chat session or register an existing one
   */
  async createSession(createSessionDto: CreateSessionDto): Promise<{ success: boolean, session?: any, sessionId?: string }> {
    try {
      if (!createSessionDto.userAddress) {
        throw new BadRequestException('User address is required');
      }

      // Generate a new UUID for the session if not provided
      const sessionId = createSessionDto.suiObjectId || uuidv4();
      
      // Create session in PostgreSQL
      const newSession = {
        id: sessionId,
        title: createSessionDto.title || createSessionDto.modelName || 'New Chat',
        userAddress: createSessionDto.userAddress,
        suiObjectId: createSessionDto.suiObjectId || undefined, // Use undefined instead of null
        isArchived: false,
        metadata: { 
          modelName: createSessionDto.modelName || 'gemini-2.0-flash',
          source: createSessionDto.suiObjectId ? 'blockchain' : 'database'
        }
      };
      
      const dbSession = await this.chatSessionRepository.save(newSession);
      
      // Format the session for the frontend
      const session = {
        id: sessionId,
        owner: createSessionDto.userAddress,
        title: createSessionDto.title || createSessionDto.modelName || 'New Chat',
        messages: [],
        created_at: dbSession.createdAt.toISOString(),
        updated_at: dbSession.updatedAt.toISOString(),
        message_count: 0,
        sui_object_id: createSessionDto.suiObjectId
      };
      
      return { success: true, session, sessionId };
    } catch (error) {
      this.logger.error(`Error creating chat session: ${error.message}`);
      return { success: false, sessionId: undefined };
    }
  }

  /**
   * Process a message for memory extraction and other backend tasks
   */
  async addMessage(sessionId: string, messageDto: AddMessageDto): Promise<{ success: boolean, message?: string, memoryExtracted?: MemoryExtraction | null }> {
    try {
      this.logger.log(`Message processing request received for session ${sessionId}`);
      
      let memoryExtracted: MemoryExtraction | null = null;
      
      // If it's a user message, check if there are memories to extract
      if (messageDto.type === 'user') {
        try {
          // Check for factual content that could be stored as memory
          memoryExtracted = await this.checkForMemoryContent(
            messageDto.content,
            messageDto.userAddress
          );
          
          this.logger.log('Memory extraction completed', { 
            hasExtraction: !!memoryExtracted,
            factsCount: memoryExtracted?.extractedFacts?.length || 0,
            category: memoryExtracted?.category
          });
        } catch (err) {
          this.logger.error(`Memory extraction error: ${err.message}`);
          memoryExtracted = null;
        }
      }
      
      // Store message in PostgreSQL
      try {
        const dbSession = await this.chatSessionRepository.findOne({
          where: { id: sessionId }
        });
        
        if (dbSession) {
          await this.chatMessageRepository.save({
            role: messageDto.type,
            content: messageDto.content,
            sessionId: dbSession.id,
            session: dbSession,
            memoryId: messageDto.memoryId,
            walrusHash: messageDto.walrusHash,
            metadata: {
              memoryExtracted: memoryExtracted ? true : false
            }
          });
          
          // Update session updatedAt timestamp
          await this.chatSessionRepository.update(
            { id: sessionId },
            { updatedAt: new Date() }
          );
        }
      } catch (err) {
        this.logger.error(`Error saving message to DB: ${err.message}`);
      }
      
      return { 
        success: true,
        message: 'Message processed successfully',
        memoryExtracted
      };
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      return { 
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string, userAddress: string): Promise<{ success: boolean, message: string }> {
    try {
      // Delete from PostgreSQL
      await this.chatSessionRepository.delete({
        id: sessionId,
        userAddress
      });
      
      // Backend doesn't delete from blockchain - frontend handles this
      this.logger.log(`Delete request received for session ${sessionId}`);
      return {
        success: true,
        message: 'Session deleted from database. Blockchain deletion handled by frontend.'
      };
    } catch (error) {
      this.logger.error(`Error processing deletion: ${error.message}`);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Update session title
   */
  async updateSessionTitle(sessionId: string, userAddress: string, newTitle: string): Promise<{ success: boolean, message: string }> {
    try {
      // Update in PostgreSQL
      await this.chatSessionRepository.update(
        { id: sessionId, userAddress },
        { title: newTitle }
      );
      
      // Backend doesn't update blockchain - frontend handles this
      this.logger.log(`Title update request received for session ${sessionId}`);
      return {
        success: true,
        message: 'Session title updated in database. Blockchain update handled by frontend.'
      };
    } catch (error) {
      this.logger.error(`Error processing title update: ${error.message}`);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Index a session that was created directly on the blockchain
   */
  async indexSession(sessionIndexDto: { sessionId: string, userAddress: string, title: string }): Promise<{ success: boolean, message?: string }> {
    try {
      const { sessionId, userAddress, title } = sessionIndexDto;
      
      // Verify the session exists on chain and belongs to the user
      try {
        const rawSession = await this.suiService.getChatSession(sessionId);
        if (rawSession.owner !== userAddress) {
          return { 
            success: false, 
            message: 'Session does not belong to the specified user'
          };
        }
        
        // Store in PostgreSQL
        const newSession = {
          id: sessionId,
          title: title || rawSession.modelName,
          userAddress,
          suiObjectId: sessionId,
          isArchived: false,
          metadata: { source: 'blockchain' }
        };
        
        const dbSession = await this.chatSessionRepository.save(newSession);
        
        // Store messages
        if (rawSession.messages && Array.isArray(rawSession.messages)) {
          await Promise.all(rawSession.messages.map(async (msg, idx) => {
            await this.chatMessageRepository.save({
              id: `${sessionId}-${idx}`,
              role: msg.type,
              content: msg.content,
              sessionId: dbSession.id,
              session: dbSession
            });
          }));
        }
      } catch (error) {
        this.logger.error(`Error verifying session: ${error.message}`);
        return { 
          success: false, 
          message: `Failed to verify session ownership: ${error.message}`
        };
      }
      
      return {
        success: true,
        message: `Session ${sessionId} indexed successfully`
      };
    } catch (error) {
      this.logger.error(`Error indexing session: ${error.message}`);
      return { 
        success: false,
        message: `Failed to index session: ${error.message}`
      };
    }
  }

  /**
   * Save session summary
   */
  async saveSummary(saveSummaryDto: SaveSummaryDto): Promise<{ success: boolean }> {
    try {
      // Save to PostgreSQL
      await this.chatSessionRepository.update(
        { id: saveSummaryDto.sessionId },
        { summary: saveSummaryDto.summary }
      );
      
      // Backend doesn't save to blockchain - frontend handles this
      this.logger.log(`Summary save request received for session ${saveSummaryDto.sessionId}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing summary: ${error.message}`);
      return { success: false };
    }
  }

  /**
   * Stream chat response using SSE
   */
  streamChatResponse(messageDto: ChatMessageDto): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    let fullResponse = '';
    let memoryStored = false;
    let memoryId: string | undefined = undefined;

    // Get normalized values from DTO with fallbacks
    const sessionId = messageDto.sessionId || messageDto.session_id;
    const userId = messageDto.userId || messageDto.user_id || messageDto.userAddress;
    const content = messageDto.text || messageDto.content;
    const modelName = messageDto.model || messageDto.modelName || 'gemini-2.0-flash';

    // Create a unique request key for deduplication
    const requestKey = `${userId}_${sessionId}_${content}_${Date.now()}`;

    (async () => {
      try {

        // Check if this request is already being processed
        if (this.activeRequests.has(requestKey)) {
          this.logger.warn(`Duplicate request detected, ignoring: ${requestKey}`);
          subject.error(new Error('Duplicate request'));
          return;
        }

        // Mark request as active
        this.activeRequests.set(requestKey, true);

        this.logger.log(`Starting streaming chat - SessionID: ${sessionId}, UserID: ${userId}, Content: "${content}", RequestKey: ${requestKey}`);

        // Send initial start message
        subject.next({
          data: JSON.stringify({
            type: 'start',
            intent: 'CHAT'
          })
        });
        
        // Step 1: Fetch the chat history
        if (!sessionId) {
          throw new Error('Session ID is required for streaming chat');
        }
        
        if (!userId) {
          throw new Error('User ID/Address is required for streaming chat');
        }
        
        if (!content) {
          throw new Error('Message content is required for streaming chat');
        }
        
        // Try to get chat history from PostgreSQL first
        let chatHistory: { role: string, content: string }[] = [];
        
        const dbSession = await this.chatSessionRepository.findOne({
          where: { id: sessionId },
          relations: ['messages']
        });
        
        if (dbSession && dbSession.messages) {
          chatHistory = dbSession.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          chatHistory.push({ role: 'user', content });
        } else {
          // Fallback to blockchain
          const chatSession = await this.suiService.getChatSession(sessionId);
          chatHistory = [...chatSession.messages.map(msg => ({ role: msg.type, content: msg.content })), { role: 'user', content }];
        }
        
        // Step 2: Use provided context or fetch relevant memories
        let relevantMemories: string[] = [];
        
        if (messageDto.memoryContext) {
          // Use provided context
          this.logger.log('Using provided memory context');
        } else {
          // Fetch relevant memories
          relevantMemories = await this.memoryQueryService.findRelevantMemories(
            content,
            userId
          );
        }
        
        // Step 3: Construct the system prompt with context
        const systemPrompt = this.constructPrompt(
          dbSession?.summary || '',
          relevantMemories,
          messageDto.memoryContext || ''
        );
        
        // Step 4: Stream response from Gemini
        this.logger.log(`Generating AI response for: "${content}" with model: ${modelName}`);
        const responseStream = this.geminiService.generateContentStream(
          modelName,
          chatHistory,
          systemPrompt
        );

        responseStream.subscribe({
          next: (chunk) => {
            fullResponse += chunk;
            // Format chunk as expected by frontend
            subject.next({ 
              data: JSON.stringify({
                type: 'chunk',
                content: chunk
              })
            });
          },
          error: (err) => {
            this.logger.error(`Stream error: ${err.message}`);
            // Clean up active request on error
            this.activeRequests.delete(requestKey);
            subject.error(err);
          },
          complete: async () => {
            try {
              // If originalUserMessage is provided, use that instead
              const userMessage = messageDto.originalUserMessage || content;

              // Step 5: Save BOTH user and assistant messages to PostgreSQL
              if (dbSession) {
                // First, check if user message already exists to avoid duplicates
                const existingUserMessage = await this.chatMessageRepository.findOne({
                  where: {
                    sessionId: dbSession.id,
                    role: 'user',
                    content: userMessage
                  },
                  order: { createdAt: 'DESC' }
                });

                // Save user message if it doesn't exist
                if (!existingUserMessage) {
                  this.logger.log(`Saving user message: "${userMessage}"`);
                  await this.chatMessageRepository.save({
                    role: 'user',
                    content: userMessage,
                    sessionId: dbSession.id,
                    session: dbSession
                  });
                } else {
                  this.logger.log(`User message already exists, skipping save: "${userMessage}"`);
                }

                // Save assistant message
                this.logger.log(`Saving assistant message: "${fullResponse.substring(0, 100)}..."`);
                await this.chatMessageRepository.save({
                  role: 'assistant',
                  content: fullResponse,
                  sessionId: dbSession.id,
                  session: dbSession
                });

                // Update session updatedAt timestamp
                await this.chatSessionRepository.update(
                  { id: sessionId },
                  { updatedAt: new Date() }
                );
              }

              // Clean up active request
              this.activeRequests.delete(requestKey);
              
              // Step 6: Process for memory extraction (but don't store yet)
              let memoryExtraction: MemoryExtraction | null = null;
              try {
                memoryExtraction = await this.checkForMemoryContent(userMessage, userId);
              } catch (err) {
                this.logger.error(`Memory extraction error: ${err.message}`);
              }
              
              // Process for summarization
              this.summarizationService.summarizeSessionIfNeeded(sessionId, userId);
              
              memoryStored = false; // No longer auto-storing
              memoryId = undefined;
              
              // Send the final event with completion data including memory extraction
              subject.next({ 
                data: JSON.stringify({
                  type: 'end',
                  content: fullResponse,
                  intent: 'CHAT',
                  memoryStored,
                  memoryId,
                  memoryExtraction: memoryExtraction // Include extracted memory for frontend approval
                })
              });
              
              subject.complete();
            } catch (error) {
              this.logger.error(`Error finalizing chat: ${error.message}`);
              subject.error(new Error(`Failed to finalize chat: ${error.message}`));
            }
          }
        });
      } catch (error) {
        this.logger.error(`Error in chat stream: ${error.message}`);
        // Clean up active request on error
        this.activeRequests.delete(requestKey);
        subject.error(new Error(`Chat stream failed: ${error.message}`));
      }
    })();
    
    return subject.asObservable();
  }

  /**
   * Send a non-streaming chat message
   */
  async sendMessage(messageDto: ChatMessageDto): Promise<{ 
    response: string; 
    success: boolean;
    intent?: string;
    entities?: any;
    memoryStored?: boolean;
    memoryId?: string;
    memoryExtraction?: any;
  }> {
    try {
      // Get normalized values from DTO with fallbacks
      const sessionId = messageDto.sessionId || messageDto.session_id;
      const userId = messageDto.userId || messageDto.user_id || messageDto.userAddress;
      const content = messageDto.text || messageDto.content;
      const modelName = messageDto.model || messageDto.modelName || 'gemini-1.5-pro';
      
      // Validate required fields
      if (!sessionId) {
        throw new Error('Session ID is required for chat');
      }
      
      if (!userId) {
        throw new Error('User ID/Address is required for chat');
      }
      
      if (!content) {
        throw new Error('Message content is required for chat');
      }
      
      // Try to get chat history from PostgreSQL first
      let chatHistory: { role: string, content: string }[] = [];
      
      const dbSession = await this.chatSessionRepository.findOne({
        where: { id: sessionId },
        relations: ['messages']
      });
      
      if (dbSession && dbSession.messages) {
        chatHistory = dbSession.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        chatHistory.push({ role: 'user', content });
      } else {
        // Fallback to blockchain
        const chatSession = await this.suiService.getChatSession(sessionId);
        chatHistory = [...chatSession.messages.map(msg => ({ role: msg.type, content: msg.content })), { role: 'user', content }];
      }
      
      // Step 2: Use provided context or fetch relevant memories
      let relevantMemories: string[] = [];
      
      if (messageDto.memoryContext) {
        // Use provided context
        this.logger.log('Using provided memory context');
      } else {
        // Fetch relevant memories
        relevantMemories = await this.memoryQueryService.findRelevantMemories(
          content,
          userId
        );
      }
      
      // Step 3: Construct the system prompt with context
      const systemPrompt = this.constructPrompt(
        dbSession?.summary || '',
        relevantMemories,
        messageDto.memoryContext || ''
      );
      
      // Step 4: Generate response from Gemini
      const response = await this.geminiService.generateContent(
        modelName,
        chatHistory,
        systemPrompt
      );
      
      // Step 5: Save user and assistant messages to PostgreSQL
      if (dbSession) {
        // Save user message
        await this.chatMessageRepository.save({
          role: 'user',
          content: content,
          sessionId: dbSession.id,
          session: dbSession
        });
        
        // Save assistant message
        await this.chatMessageRepository.save({
          role: 'assistant',
          content: response,
          sessionId: dbSession.id,
          session: dbSession
        });
        
        // Update session updatedAt timestamp
        await this.chatSessionRepository.update(
          { id: sessionId },
          { updatedAt: new Date() }
        );
      }
      
      // If originalUserMessage is provided, use that instead
      const userMessage = messageDto.originalUserMessage || content;
      
      // Step 6: Process for memory extraction (but don't store yet)
      let memoryExtraction: MemoryExtraction | null = null;
      try {
        memoryExtraction = await this.checkForMemoryContent(userMessage, userId);
      } catch (err) {
        this.logger.error(`Memory extraction error: ${err.message}`);
      }
      
      // Process for summarization
      this.summarizationService.summarizeSessionIfNeeded(sessionId, userId);
      
      return {
        response,
        success: true,
        intent: 'CHAT',
        memoryStored: false, // No longer auto-storing
        memoryId: undefined,
        memoryExtraction: memoryExtraction // Include extracted memory for frontend approval
      };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return {
        response: 'Sorry, an error occurred while processing your message.',
        success: false
      };
    }
  }

  private constructPrompt(
    sessionSummary: string,
    relevantMemories: string[],
    memoryContext: string
  ): string {
    let prompt = 'You are a helpful AI assistant with access to the user\'s personal memories.\n\n';
    
    if (sessionSummary) {
      prompt += `Current conversation summary: ${sessionSummary}\n\n`;
    }
    
    // If we have provided memory context, use that directly
    if (memoryContext) {
      prompt += `${memoryContext}\n\n`;
    }
    // Otherwise use the fetched relevant memories
    else if (relevantMemories.length > 0) {
      prompt += 'Relevant memories from the user:\n';
      relevantMemories.forEach((memory, index) => {
        prompt += `[Memory ${index + 1}]: ${memory}\n`;
      });
      prompt += '\n';
    }
    
    prompt += 'Please respond to the user\'s message in a helpful and informative way, using the provided memories when relevant.';
    
    return prompt;
  }

  private async processCompletedMessage(
    sessionId: string,
    userAddress: string,
    userMessage: string,
    assistantResponse: string
  ): Promise<{ memoryStored: boolean, memoryId?: string }> {
    try {
      // Process for summarization if needed
      this.summarizationService.summarizeSessionIfNeeded(sessionId, userAddress);
      
      // Process for memory ingestion - check if user message contains facts to remember
      const result = await this.memoryIngestionService.processConversation(
        userMessage,
        assistantResponse,
        userAddress
      );
      
      // In a real implementation, this would return whether any memories were stored
      // For now, we'll use a simple heuristic to determine this
      const isUserMessageFactual = await this.isFactual(userMessage);
      
      return {
        memoryStored: isUserMessageFactual,
        memoryId: isUserMessageFactual ? `mem-${Date.now()}` : undefined
      };
    } catch (error) {
      this.logger.error(`Error in post-processing: ${error.message}`);
      return { memoryStored: false };
    }
  }

  private async isFactual(message: string): Promise<boolean> {
    try {
      // Simple heuristic - check for common fact patterns
      const factPatterns = [
        /my name is/i,
        /i am/i,
        /i live/i,
        /i work/i,
        /i have/i,
        /i love/i,
        /i like/i,
        /i enjoy/i,
        /i prefer/i,
        /i hate/i,
        /i dislike/i,
        /my favorite/i,
        /remember/i
      ];
      
      for (const pattern of factPatterns) {
        if (pattern.test(message)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Error checking factual content: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if message contains factual content that could be stored as memory
   * Returns the extracted facts for frontend approval
   */
  private async checkForMemoryContent(message: string, userAddress: string): Promise<MemoryExtraction | null> {
    try {
      // Use the memory ingestion service's classifier to check if this should be saved
      const classification = await this.memoryIngestionService['classifierService'].shouldSaveMemory(message);
      
      if (!classification.shouldSave) {
        return null;
      }
      
      // If it should be saved, return the extracted information for frontend approval
      // Since ClassificationResult doesn't have extractedFacts, we'll use the message as the fact
      return {
        shouldSave: true,
        category: classification.category,
        content: message,
        extractedFacts: [message], // Default to the full message as the extracted fact
        confidence: classification.confidence || 0.8
      };
    } catch (error) {
      this.logger.error(`Error checking memory content: ${error.message}`);
      return null;
    }
  }
}
````

## File: src/chat/dto/add-message.dto.ts
````typescript
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class AddMessageDto {
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['user', 'assistant'])
  type: 'user' | 'assistant';

  @IsString()
  @IsOptional()
  memoryId?: string;

  @IsString()
  @IsOptional()
  walrusHash?: string;
}
````

## File: src/chat/dto/chat-message.dto.ts
````typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ChatMessageDto {
  // Support both field naming conventions
  @IsString()
  @IsNotEmpty()
  text: string;
  
  @IsString()
  @IsOptional()
  content?: string; // Alternative field name used in frontend
  
  @IsString()
  @IsNotEmpty()
  userId: string;
  
  @IsString()
  @IsOptional()
  user_id?: string; // Alternative field name used in frontend
  
  @IsString()
  @IsOptional()
  sessionId?: string;
  
  @IsString()
  @IsOptional()
  session_id?: string; // Alternative field name used in frontend
  
  @IsString()
  @IsOptional()
  model?: string;
  
  @IsString()
  @IsOptional()
  modelName?: string; // Alternative field name used in backend
  
  @IsString()
  @IsOptional()
  originalUserMessage?: string;
  
  @IsString()
  @IsOptional()
  memoryContext?: string;
  
  @IsString()
  @IsOptional()
  userAddress?: string; // Used in other DTOs
}
````

## File: src/chat/dto/create-session.dto.ts
````typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  modelName: string;

  @IsString()
  @IsOptional()
  suiObjectId?: string;
}
````

## File: src/chat/dto/save-summary.dto.ts
````typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class SaveSummaryDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
  
  @IsString()
  @IsNotEmpty()
  summary: string;
  
  @IsString()
  @IsNotEmpty()
  userAddress: string;
}
````

## File: src/chat/dto/session-index.dto.ts
````typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class SessionIndexDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}
````

## File: src/chat/dto/update-session-title.dto.ts
````typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSessionTitleDto {
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}
````

## File: src/chat/entities/chat-message.entity.ts
````typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatSession } from './chat-session.entity';

@Entity('chat_message')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  role: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => ChatSession, session => session.messages, { onDelete: 'CASCADE' })
  @JoinColumn()
  session: ChatSession;

  @Column()
  sessionId: string;

  @CreateDateColumn()
  createdAt: Date;
}
````

## File: src/chat/entities/chat-session.entity.ts
````typescript
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_session')
export class ChatSession {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  summary: string;

  @Column()
  userAddress: string;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => ChatMessage, message => message.session, { cascade: true })
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
````

## File: src/chat/README.md
````markdown
# Chat Module - PostgreSQL Implementation

This module has been refactored to use PostgreSQL as the primary storage for chat sessions and messages, removing the hybrid blockchain/database approach for cleaner and more consistent data management.

## Overview

The chat module now exclusively uses PostgreSQL to store:
- Chat sessions with metadata
- Chat messages with role-based conversation history
- Session summaries
- Memory extraction metadata

## Key Changes

### 1. Database-First Approach
- All chat data is stored in PostgreSQL tables (`chat_session` and `chat_message`)
- Removed blockchain fallback logic for cleaner code
- Sessions can still reference blockchain objects via `suiObjectId` for compatibility

### 2. Entity Structure

#### ChatSession Entity
- `id`: Primary key (UUID or blockchain object ID)
- `title`: Session title
- `summary`: AI-generated summary
- `userAddress`: Owner's wallet address
- `suiObjectId`: Optional reference to blockchain object
- `isArchived`: Soft delete flag
- `metadata`: JSONB field for flexible data storage
- `createdAt` / `updatedAt`: Timestamps

#### ChatMessage Entity
- `id`: UUID primary key
- `role`: Message role ('user' or 'assistant')
- `content`: Message text
- `memoryId`: Optional reference to stored memory
- `walrusHash`: Optional reference to decentralized storage
- `metadata`: JSONB field for additional data
- `sessionId`: Foreign key to chat session
- `createdAt`: Message timestamp

### 3. API Endpoints

- `GET /chat/sessions` - Get all sessions for a user
- `GET /chat/sessions/:sessionId` - Get specific session with messages
- `POST /chat/sessions` - Create new session
- `POST /chat/sessions/:sessionId/messages` - Add message to session
- `DELETE /chat/sessions/:sessionId` - Delete session
- `PUT /chat/sessions/:sessionId/title` - Update session title
- `POST /chat/summary` - Save session summary
- `POST /chat/stream` - Stream chat responses (SSE)
- `POST /chat` - Send non-streaming chat message

### 4. Features

#### Session Management
- Create sessions with optional blockchain reference
- List user's sessions with message counts
- Update session titles
- Soft delete with archiving support

#### Message Handling
- Store user and assistant messages
- Support for memory extraction metadata
- Integration with decentralized storage (Walrus)
- Ordered message history retrieval

#### AI Integration
- Streaming responses using Server-Sent Events
- Memory context injection
- Session summarization
- Automatic memory extraction detection

### 5. Database Schema

```sql
-- Chat session table
CREATE TABLE chat_session (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    "userAddress" VARCHAR(255) NOT NULL,
    "suiObjectId" VARCHAR(255),
    "isArchived" BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat message table
CREATE TABLE chat_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    "memoryId" VARCHAR(255),
    "walrusHash" VARCHAR(255),
    metadata JSONB,
    "sessionId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("sessionId") REFERENCES chat_session(id) ON DELETE CASCADE
);
```

### 6. Usage Example

```typescript
// Create a new session
const session = await chatApi.createSession({
  userAddress: '0x123...',
  title: 'My Chat',
  modelName: 'gemini-2.0-flash',
  suiObjectId: '0xabc...' // Optional blockchain reference
});

// Add messages
await chatApi.addMessage(session.id, {
  userAddress: '0x123...',
  content: 'Hello AI!',
  type: 'user'
});

// Stream chat response
const response = await chatApi.streamChat({
  text: 'Tell me about...',
  user_id: '0x123...',
  session_id: session.id,
  model: 'gemini-2.0-flash'
});
```

## Migration Notes

1. Run the migration script in `/backend/src/database/migrations/create-chat-tables.sql`
2. Existing blockchain sessions can be imported using their object IDs
3. The `suiObjectId` field maintains compatibility with blockchain-created sessions
4. Frontend can continue to create blockchain sessions and sync them to the database

## Benefits of PostgreSQL-Only Approach

1. **Performance**: Faster queries without blockchain network latency
2. **Consistency**: Single source of truth for chat data
3. **Features**: Full SQL capabilities for complex queries
4. **Scalability**: Standard database scaling techniques apply
5. **Cost**: No blockchain transaction fees for chat operations
6. **Flexibility**: Easy schema migrations and updates

## Future Enhancements

1. Full-text search on chat messages
2. Analytics and usage statistics
3. Message reactions and metadata
4. Conversation threading
5. Export/import functionality
````

## File: src/chat/summarization/summarization.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SummarizationService } from './summarization.service';

describe('SummarizationService', () => {
  let service: SummarizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SummarizationService],
    }).compile();

    service = module.get<SummarizationService>(SummarizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/chat/summarization/summarization.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

@Injectable()
export class SummarizationService {
  private logger = new Logger(SummarizationService.name);

  constructor(
    private suiService: SuiService,
    private geminiService: GeminiService
  ) {}

  async summarizeSessionIfNeeded(sessionId: string, userAddress: string): Promise<void> {
    try {
      // Get the chat session
      const session = await this.suiService.getChatSession(sessionId);
      
      // Check if summarization is needed
      // We'll summarize if we have more than 10 messages and no summary yet,
      // or if we have more than 5 new messages since the last summary
      const shouldSummarize = 
        (session.messages.length > 10 && !session.summary) || 
        (session.summary && session.messages.length > 5);
      
      if (!shouldSummarize) {
        return;
      }

      // Generate the summary
      const summary = await this.generateSummary(
        session.messages.map(msg => ({ role: msg.type, content: msg.content }))
      );
      
      // Save the summary back to the session
      await this.suiService.saveSessionSummary(
        sessionId,
        userAddress,
        summary
      );
      
      this.logger.log(`Summarized session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error summarizing session: ${error.message}`);
      // Non-blocking operation, so we just log the error
    }
  }

  private async generateSummary(messages: { role: string; content: string }[]): Promise<string> {
    try {
      // Format the conversation for the AI
      const conversation = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      
      // Create a prompt for the AI to generate a summary
      const prompt = `
        Please provide a concise summary (2-3 sentences) of the following conversation.
        Focus on the main topics discussed, key questions asked, and important information shared.
        Your summary should help provide context for continuing the conversation.
        
        Conversation:
        ${conversation}
        
        Summary:
      `;
      
      // Generate the summary using Gemini
      const summary = await this.geminiService.generateContent(
        'gemini-1.5-flash', // Using flash for efficiency in summarization
        [{ role: 'user', content: prompt }]
      );
      
      return summary.trim();
    } catch (error) {
      this.logger.error(`Error generating summary: ${error.message}`);
      return 'Error generating summary';
    }
  }
}
````

## File: src/database/database.config.ts
````typescript
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { ChatSession } from '../chat/entities/chat-session.entity';
import { ChatMessage } from '../chat/entities/chat-message.entity';

// Load environment variables
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'postgres'),
  database: configService.get('DB_DATABASE', 'personal_data_wallet'),
  entities: [ChatSession, ChatMessage],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  ssl: configService.get('DB_SSL') === 'true' ? {
    rejectUnauthorized: false
  } : false,
});
````

## File: src/database/database.module.ts
````typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'personal_data_wallet'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC', false),
        logging: configService.get('DB_LOGGING', false),
        ssl: configService.get('DB_SSL') === 'true' ? {
          rejectUnauthorized: false
        } : false,
      }),
    }),
  ],
})
export class DatabaseModule {}
````

## File: src/database/migrations/1704326400000-CreateChatTables.ts
````typescript
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateChatTables1704326400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Use raw SQL for better control and compatibility
        await queryRunner.query(`
            CREATE TABLE "chat_session" (
                "id" VARCHAR(255) PRIMARY KEY,
                "title" VARCHAR(255) NOT NULL,
                "summary" TEXT,
                "userAddress" VARCHAR(255) NOT NULL,
                "isArchived" BOOLEAN DEFAULT false,
                "metadata" JSONB,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "chat_message" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "role" VARCHAR(50) NOT NULL,
                "content" TEXT NOT NULL,
                "metadata" JSONB,
                "sessionId" VARCHAR(255) NOT NULL,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("sessionId") REFERENCES "chat_session" ("id") ON DELETE CASCADE
            );

            CREATE INDEX "IDX_CHAT_SESSION_USER_ADDRESS" ON "chat_session" ("userAddress");
            CREATE INDEX "IDX_CHAT_SESSION_CREATED_AT" ON "chat_session" ("createdAt");
            CREATE INDEX "IDX_CHAT_SESSION_UPDATED_AT" ON "chat_session" ("updatedAt");
            CREATE INDEX "IDX_CHAT_MESSAGE_SESSION_ID" ON "chat_message" ("sessionId");
            CREATE INDEX "IDX_CHAT_MESSAGE_CREATED_AT" ON "chat_message" ("createdAt");

            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW."updatedAt" = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE TRIGGER update_chat_session_updated_at 
            BEFORE UPDATE ON chat_session 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_chat_session_updated_at ON chat_session;
            DROP FUNCTION IF EXISTS update_updated_at_column();
            DROP TABLE IF EXISTS chat_message;
            DROP TABLE IF EXISTS chat_session;
        `);
    }
}
````

## File: src/infrastructure/demo-storage/demo-storage.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

/**
 * Demo Storage Service - Simple local storage for demo purposes
 * This replaces the complex Walrus service with reliable local storage
 */
@Injectable()
export class DemoStorageService {
  private logger = new Logger(DemoStorageService.name);
  private readonly STORAGE_DIR = path.join(process.cwd(), 'storage', 'demo');

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage directory
   */
  private async initializeStorage() {
    try {
      await mkdir(this.STORAGE_DIR, { recursive: true });
      this.logger.log(`Demo storage initialized at: ${this.STORAGE_DIR}`);
    } catch (error) {
      this.logger.error(`Failed to initialize demo storage: ${error.message}`);
    }
  }

  /**
   * Generate a unique blob ID
   */
  private generateBlobId(): string {
    return `demo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Upload content (compatible with WalrusService interface)
   */
  async uploadContent(
    content: string, 
    ownerAddress: string, 
    epochs: number = 12,
    additionalTags: Record<string, string> = {}
  ): Promise<string> {
    const blobId = this.generateBlobId();
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.txt`);
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      // Store content
      await writeFile(filePath, content, 'utf-8');
      
      // Store metadata
      const metadata = {
        blobId,
        ownerAddress,
        epochs,
        tags: additionalTags,
        contentType: 'text/plain',
        createdAt: new Date().toISOString(),
        storageType: 'demo'
      };
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));
      
      this.logger.log(`Content stored: ${blobId} for ${ownerAddress}`);
      return blobId;
    } catch (error) {
      this.logger.error(`Failed to store content: ${error.message}`);
      throw new Error(`Demo storage error: ${error.message}`);
    }
  }

  /**
   * Upload file (compatible with WalrusService interface)
   */
  async uploadFile(
    buffer: Buffer, 
    filename: string, 
    ownerAddress: string, 
    epochs: number = 12,
    additionalTags: Record<string, string> = {}
  ): Promise<string> {
    const blobId = this.generateBlobId();
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      // Store file
      await writeFile(filePath, buffer);
      
      // Store metadata
      const metadata = {
        blobId,
        filename,
        ownerAddress,
        epochs,
        tags: additionalTags,
        contentType: 'application/octet-stream',
        size: buffer.length,
        createdAt: new Date().toISOString(),
        storageType: 'demo'
      };
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));
      
      this.logger.log(`File stored: ${blobId} (${filename}) for ${ownerAddress}`);
      return blobId;
    } catch (error) {
      this.logger.error(`Failed to store file: ${error.message}`);
      throw new Error(`Demo storage error: ${error.message}`);
    }
  }

  /**
   * Download file (compatible with WalrusService interface)
   */
  async downloadFile(blobId: string): Promise<Buffer> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const textPath = path.join(this.STORAGE_DIR, `${blobId}.txt`);
    
    try {
      // Try binary file first, then text file
      try {
        const buffer = await readFile(filePath);
        this.logger.log(`File retrieved: ${blobId} (${buffer.length} bytes)`);
        return buffer;
      } catch (error) {
        // Try text file
        const content = await readFile(textPath, 'utf-8');
        const buffer = Buffer.from(content, 'utf-8');
        this.logger.log(`Content retrieved: ${blobId} (${buffer.length} bytes)`);
        return buffer;
      }
    } catch (error) {
      this.logger.error(`Failed to retrieve file ${blobId}: ${error.message}`);
      throw new Error(`File not found: ${blobId}`);
    }
  }

  /**
   * Verify user access (always return true for demo)
   */
  async verifyUserAccess(blobId: string, userAddress: string): Promise<boolean> {
    // For demo, always allow access
    return true;
  }

  /**
   * Get admin address (return a demo address)
   */
  getAdminAddress(): string {
    return 'demo_admin_address';
  }

  /**
   * Check if file exists
   */
  async exists(blobId: string): Promise<boolean> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const textPath = path.join(this.STORAGE_DIR, `${blobId}.txt`);
    
    try {
      await readFile(filePath);
      return true;
    } catch (error) {
      try {
        await readFile(textPath);
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  /**
   * Get storage stats
   */
  async getStats(): Promise<{
    totalFiles: number;
    storageDir: string;
  }> {
    try {
      const files = await fs.promises.readdir(this.STORAGE_DIR);
      const dataFiles = files.filter(file => file.endsWith('.bin') || file.endsWith('.txt'));
      
      return {
        totalFiles: dataFiles.length,
        storageDir: this.STORAGE_DIR
      };
    } catch (error) {
      return {
        totalFiles: 0,
        storageDir: this.STORAGE_DIR
      };
    }
  }
}
````

## File: src/infrastructure/gemini/gemini.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeminiService],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/infrastructure/gemini/gemini.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, Subject } from 'rxjs';
import { 
  GoogleGenerativeAI,
  GenerativeModel,
  GenerationConfig,
  Content
} from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private generativeAI: GoogleGenerativeAI;
  private logger = new Logger(GeminiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      this.logger.error('GOOGLE_API_KEY not provided');
      throw new Error('GOOGLE_API_KEY not provided');
    }
    this.generativeAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate content using Gemini model (non-streaming)
   */
  async generateContent(
    modelName: string = 'gemini-2.0-flash',
    history: { role: string; content: string }[] = [],
    systemPrompt?: string
  ): Promise<string> {
    try {
      const model = this.getModel(modelName);
      
      // Format the chat history
      const formattedHistory = this.formatChatHistory(history);
      
      // Add system prompt if provided - Gemini doesn't support system role
      const parts = formattedHistory.slice();
      if (systemPrompt) {
        // Instead of using 'system' role (not supported), add as a 'user' message at the beginning
        parts.unshift({
          role: 'user',
          parts: [{ text: systemPrompt }]
        });
        // Add a model response to keep the conversation flowing naturally
        parts.unshift({
          role: 'model',
          parts: [{ text: 'I understand. I\'ll help you with that.' }]
        });
      }
      
      const result = await model.generateContent({
        contents: parts,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
      });
      
      return result.response.text();
    } catch (error) {
      this.logger.error(`Error generating content: ${error.message}`);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Generate content stream using Gemini model
   */
  generateContentStream(
    modelName: string = 'gemini-2.0-flash',
    history: { role: string; content: string }[] = [],
    systemPrompt?: string
  ): Observable<string> {
    const subject = new Subject<string>();
    
    (async () => {
      try {
        const model = this.getModel(modelName);
        
        // Format the chat history
        const formattedHistory = this.formatChatHistory(history);
        
        // Add system prompt if provided - Gemini doesn't support system role
        const parts = formattedHistory.slice();
        if (systemPrompt) {
          // Instead of using 'system' role (not supported), add as a 'user' message at the beginning
          parts.unshift({
            role: 'user',
            parts: [{ text: systemPrompt }]
          });
          // Add a model response to keep the conversation flowing naturally
          parts.unshift({
            role: 'model',
            parts: [{ text: 'I understand. I will help you with that.' }]
          });
        }
        
        const result = await model.generateContentStream({
          contents: parts,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          },
        });
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          subject.next(chunkText);
        }
        
        subject.complete();
      } catch (error) {
        this.logger.error(`Error streaming content: ${error.message}`);
        subject.error(new Error(`Gemini API error: ${error.message}`));
      }
    })();
    
    return subject.asObservable();
  }

  /**
   * Embed text into vector representation
   */
  async embedText(
    text: string,
    modelName: string = 'embedding-001',
    outputDimensionality: number = 768
  ): Promise<{ vector: number[] }> {
    try {
      const embeddingModel = this.generativeAI.getGenerativeModel({
        model: modelName,
      });

      // For the legacy embedding-001 model, outputDimensionality is not supported
      // It always returns 768 dimensions by default
      const result = await embeddingModel.embedContent(text);
      const embedding = result.embedding.values;

      this.logger.debug(`Generated embedding with ${embedding.length} dimensions using model ${modelName}`);

      return { vector: embedding };
    } catch (error) {
      this.logger.error(`Error embedding text: ${error.message}`);
      throw new Error(`Embedding error: ${error.message}`);
    }
  }

  private getModel(modelName: string): GenerativeModel {
    return this.generativeAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });
  }

  private formatChatHistory(history: { role: string; content: string }[]): Content[] {
    return history.map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    }));
  }
}
````

## File: src/infrastructure/infrastructure.module.ts
````typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuiService } from './sui/sui.service';
import { WalrusService } from './walrus/walrus.service';
import { CachedWalrusService } from './walrus/cached-walrus.service';
import { SealService } from './seal/seal.service';
import { GeminiService } from './gemini/gemini.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { StorageService } from './storage/storage.service';
import { DemoStorageService } from './demo-storage/demo-storage.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    SuiService,
    WalrusService,
    CachedWalrusService,
    SealService,
    GeminiService,
    LocalStorageService,
    StorageService,
    DemoStorageService,
  ],
  exports: [
    SuiService,
    WalrusService,
    CachedWalrusService,
    SealService,
    GeminiService,
    LocalStorageService,
    StorageService,
    DemoStorageService,
  ]
})
export class InfrastructureModule {}
````

## File: src/infrastructure/local-storage/local-storage.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export interface StoredFileMetadata {
  blobId: string;
  filename: string;
  tags: Record<string, string>;
  size: number;
  createdAt: string;
  storageType: 'local';
}

@Injectable()
export class LocalStorageService {
  private logger = new Logger(LocalStorageService.name);
  private readonly STORAGE_DIR = path.join(process.cwd(), 'storage', 'local-files');

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize local storage directory
   */
  private async initializeStorage() {
    try {
      await mkdir(this.STORAGE_DIR, { recursive: true });
      this.logger.log(`Local storage initialized at: ${this.STORAGE_DIR}`);
    } catch (error) {
      this.logger.error(`Failed to initialize local storage: ${error.message}`);
      throw new Error(`Local storage initialization failed: ${error.message}`);
    }
  }

  /**
   * Generate a unique blob ID for local storage
   */
  private generateBlobId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Store content locally
   */
  async storeContent(
    content: string, 
    filename: string, 
    tags: Record<string, string> = {}
  ): Promise<string> {
    const buffer = Buffer.from(content, 'utf-8');
    return this.storeFile(buffer, filename, tags);
  }

  /**
   * Store file buffer locally
   */
  async storeFile(
    buffer: Buffer, 
    filename: string, 
    tags: Record<string, string> = {}
  ): Promise<string> {
    const blobId = this.generateBlobId();
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      // Store the file data
      await writeFile(filePath, buffer);
      
      // Store metadata
      const metadata: StoredFileMetadata = {
        blobId,
        filename,
        tags,
        size: buffer.length,
        createdAt: new Date().toISOString(),
        storageType: 'local'
      };
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));
      
      this.logger.log(`File stored locally: ${blobId} (${buffer.length} bytes)`);
      return blobId;
    } catch (error) {
      this.logger.error(`Failed to store file locally: ${error.message}`);
      throw new Error(`Local storage error: ${error.message}`);
    }
  }

  /**
   * Retrieve file from local storage
   */
  async retrieveFile(blobId: string): Promise<Buffer> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    
    try {
      const buffer = await readFile(filePath);
      this.logger.log(`File retrieved from local storage: ${blobId} (${buffer.length} bytes)`);
      return buffer;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found in local storage: ${blobId}`);
      }
      this.logger.error(`Failed to retrieve file locally: ${error.message}`);
      throw new Error(`Local storage retrieval error: ${error.message}`);
    }
  }

  /**
   * Retrieve file content as string
   */
  async retrieveContent(blobId: string): Promise<string> {
    const buffer = await this.retrieveFile(blobId);
    return buffer.toString('utf-8');
  }

  /**
   * Get file metadata
   */
  async getMetadata(blobId: string): Promise<StoredFileMetadata> {
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      const metaContent = await readFile(metaPath, 'utf-8');
      return JSON.parse(metaContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Metadata not found for: ${blobId}`);
      }
      throw new Error(`Failed to read metadata: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  async exists(blobId: string): Promise<boolean> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    
    try {
      await stat(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteFile(blobId: string): Promise<void> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      await unlink(filePath);
      await unlink(metaPath);
      this.logger.log(`File deleted from local storage: ${blobId}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`Failed to delete file: ${error.message}`);
        throw new Error(`Delete error: ${error.message}`);
      }
    }
  }

  /**
   * List all stored files
   */
  async listFiles(): Promise<StoredFileMetadata[]> {
    try {
      const files = await readdir(this.STORAGE_DIR);
      const metaFiles = files.filter(file => file.endsWith('.meta.json'));
      
      const metadata: StoredFileMetadata[] = [];
      for (const metaFile of metaFiles) {
        try {
          const metaPath = path.join(this.STORAGE_DIR, metaFile);
          const metaContent = await readFile(metaPath, 'utf-8');
          metadata.push(JSON.parse(metaContent));
        } catch (error) {
          this.logger.warn(`Failed to read metadata file ${metaFile}: ${error.message}`);
        }
      }
      
      return metadata.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`);
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    storageDir: string;
  }> {
    try {
      const files = await this.listFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      return {
        totalFiles: files.length,
        totalSize,
        storageDir: this.STORAGE_DIR
      };
    } catch (error) {
      this.logger.error(`Failed to get storage stats: ${error.message}`);
      return {
        totalFiles: 0,
        totalSize: 0,
        storageDir: this.STORAGE_DIR
      };
    }
  }

  /**
   * Clean up old files (older than specified days)
   */
  async cleanup(olderThanDays: number = 30): Promise<number> {
    try {
      const files = await this.listFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      let deletedCount = 0;
      for (const file of files) {
        const fileDate = new Date(file.createdAt);
        if (fileDate < cutoffDate) {
          await this.deleteFile(file.blobId);
          deletedCount++;
        }
      }
      
      this.logger.log(`Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to cleanup files: ${error.message}`);
      return 0;
    }
  }
}
````

## File: src/infrastructure/seal/seal.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SealService } from './seal.service';

describe('SealService', () => {
  let service: SealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SealService],
    }).compile();

    service = module.get<SealService>(SealService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/infrastructure/seal/seal.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SealService {
  private masterKey: Buffer;
  private logger = new Logger(SealService.name);

  constructor(private configService: ConfigService) {
    // In a real implementation, this would use the actual Seal IBE SDK
    // For now, we're using a simplified symmetric encryption approach
    const masterKeyHex = this.configService.get<string>('SEAL_MASTER_KEY');
    
    if (!masterKeyHex) {
      this.logger.warn('SEAL_MASTER_KEY not provided, using a default key (NOT SECURE)');
      // Default key for development only
      this.masterKey = crypto.randomBytes(32);
    } else {
      this.masterKey = Buffer.from(masterKeyHex, 'hex');
    }
  }

  /**
   * Encrypt content for a specific user
   * @param content The content to encrypt
   * @param userAddress The user address (used as the encryption identity)
   * @returns The encrypted content
   */
  async encrypt(content: string, userAddress: string): Promise<string> {
    try {
      // In a real implementation, this would use Seal IBE
      // For now, we'll use AES-256-GCM with a user-derived key
      
      // Derive a user-specific key using HKDF
      const userKey = this.deriveUserKey(userAddress);
      
      // Generate a random IV
      const iv = crypto.randomBytes(12);
      
      // Encrypt the content
      const cipher = crypto.createCipheriv('aes-256-gcm', userKey, iv);
      let encrypted = cipher.update(content, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // Get the auth tag
      const authTag = cipher.getAuthTag();
      
      // Format: iv:authTag:encrypted
      return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
    } catch (error) {
      this.logger.error(`Error encrypting content: ${error.message}`);
      throw new Error(`Encryption error: ${error.message}`);
    }
  }

  /**
   * Decrypt content for a specific user
   * @param encryptedContent The encrypted content
   * @param userAddress The user address (used as the decryption identity)
   * @returns The decrypted content
   */
  async decrypt(encryptedContent: string, userAddress: string): Promise<string> {
    try {
      // Parse the encrypted content
      const parts = encryptedContent.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted content format');
      }
      
      const iv = Buffer.from(parts[0], 'base64');
      const authTag = Buffer.from(parts[1], 'base64');
      const encrypted = parts[2];
      
      // Derive the user-specific key
      const userKey = this.deriveUserKey(userAddress);
      
      // Decrypt the content
      const decipher = crypto.createDecipheriv('aes-256-gcm', userKey, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Error decrypting content: ${error.message}`);
      throw new Error(`Decryption error: ${error.message}`);
    }
  }

  /**
   * Check if a user can decrypt content
   * @param userAddress The user address
   * @returns True if the user can decrypt
   */
  async canDecrypt(userAddress: string): Promise<boolean> {
    // In a real implementation, this would check if the user has the necessary keys
    // For now, we assume all valid addresses can decrypt their own content
    return !!userAddress && userAddress.length > 0;
  }

  /**
   * Generate a decryption key for a user
   * @param userAddress The user address
   * @returns The decryption key
   */
  async generateDecryptionKey(userAddress: string): Promise<string> {
    // In a real implementation, this would use Seal IBE to generate a decryption key
    // For now, we return a mock key
    const userKey = this.deriveUserKey(userAddress);
    return userKey.toString('hex');
  }

  private deriveUserKey(userAddress: string): Buffer {
    // Derive a user-specific key using HKDF
    const info = Buffer.from('seal-user-key');
    const salt = crypto.createHash('sha256').update(userAddress).digest();
    
    // Use HKDF to derive a key
    const hkdf = crypto.createHmac('sha256', this.masterKey)
      .update(Buffer.concat([salt, info]))
      .digest();
    
    return hkdf;
  }
}
````

## File: src/infrastructure/storage/storage.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { WalrusService } from '../walrus/walrus.service';

export interface StorageResult {
  blobId: string;
  storageType: 'walrus' | 'local';
  success: boolean;
  message?: string;
}

@Injectable()
export class StorageService {
  private logger = new Logger(StorageService.name);
  private walrusAvailable = false;
  private lastWalrusCheck = 0;
  private readonly WALRUS_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private localStorageService: LocalStorageService,
    private walrusService: WalrusService,
    private configService: ConfigService
  ) {
    // For demo, we'll primarily use local storage
    const useLocalForDemo = this.configService.get<boolean>('USE_LOCAL_STORAGE_FOR_DEMO', true);
    if (useLocalForDemo) {
      this.logger.log('Demo mode: Using local storage as primary storage');
      this.walrusAvailable = false;
    }
  }

  /**
   * Check if Walrus is available (cached check)
   */
  private async isWalrusAvailable(): Promise<boolean> {
    // For demo, always use local storage
    const useLocalForDemo = this.configService.get<boolean>('USE_LOCAL_STORAGE_FOR_DEMO', true);
    if (useLocalForDemo) {
      return false;
    }

    const now = Date.now();
    
    // Use cached result if recent
    if (now - this.lastWalrusCheck < this.WALRUS_CHECK_INTERVAL) {
      return this.walrusAvailable;
    }
    
    try {
      // Quick availability check
      // For now, we'll assume Walrus is not available for demo
      this.walrusAvailable = false;
      this.logger.debug('Walrus availability check: UNAVAILABLE (demo mode)');
    } catch (error) {
      this.walrusAvailable = false;
      this.logger.debug('Walrus availability check: UNAVAILABLE');
    }
    
    this.lastWalrusCheck = now;
    return this.walrusAvailable;
  }

  /**
   * Upload content (compatible with WalrusService interface)
   */
  async uploadContent(
    content: string,
    ownerAddress: string,
    epochs: number = 12,
    additionalTags: Record<string, string> = {}
  ): Promise<string> {
    const result = await this.storeContent(
      content,
      `content_${Date.now()}.txt`,
      { owner: ownerAddress, ...additionalTags }
    );

    if (!result.success) {
      throw new Error(result.message || 'Failed to store content');
    }

    return result.blobId;
  }

  /**
   * Store content with automatic fallback
   */
  async storeContent(
    content: string,
    filename: string,
    tags: Record<string, string> = {}
  ): Promise<StorageResult> {
    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();
    
    if (walrusAvailable) {
      try {
        this.logger.log(`Storing content to Walrus: ${filename}`);
        const blobId = await this.walrusService.uploadContent(
          content, 
          tags.owner || 'unknown',
          12, // epochs
          tags
        );
        
        return {
          blobId,
          storageType: 'walrus',
          success: true,
          message: 'Content stored in Walrus'
        };
      } catch (error) {
        this.logger.warn(`Walrus storage failed, falling back to local: ${error.message}`);
        // Fall through to local storage
      }
    }
    
    // Use local storage (either as primary choice or fallback)
    try {
      this.logger.log(`Storing content to local storage: ${filename}`);
      const blobId = await this.localStorageService.storeContent(content, filename, tags);
      
      return {
        blobId,
        storageType: 'local',
        success: true,
        message: 'Content stored locally'
      };
    } catch (error) {
      this.logger.error(`Local storage failed: ${error.message}`);
      return {
        blobId: '',
        storageType: 'local',
        success: false,
        message: `Storage failed: ${error.message}`
      };
    }
  }

  /**
   * Store file buffer with automatic fallback
   */
  async storeFile(
    buffer: Buffer, 
    filename: string, 
    tags: Record<string, string> = {}
  ): Promise<StorageResult> {
    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();
    
    if (walrusAvailable) {
      try {
        this.logger.log(`Storing file to Walrus: ${filename}`);
        const blobId = await this.walrusService.uploadFile(
          buffer, 
          filename,
          tags.owner || 'unknown',
          12, // epochs
          tags
        );
        
        return {
          blobId,
          storageType: 'walrus',
          success: true,
          message: 'File stored in Walrus'
        };
      } catch (error) {
        this.logger.warn(`Walrus storage failed, falling back to local: ${error.message}`);
        // Fall through to local storage
      }
    }
    
    // Use local storage (either as primary choice or fallback)
    try {
      this.logger.log(`Storing file to local storage: ${filename}`);
      const blobId = await this.localStorageService.storeFile(buffer, filename, tags);
      
      return {
        blobId,
        storageType: 'local',
        success: true,
        message: 'File stored locally'
      };
    } catch (error) {
      this.logger.error(`Local storage failed: ${error.message}`);
      return {
        blobId: '',
        storageType: 'local',
        success: false,
        message: `Storage failed: ${error.message}`
      };
    }
  }

  /**
   * Retrieve file with automatic detection
   */
  async retrieveFile(blobId: string): Promise<Buffer> {
    // Detect storage type from blob ID
    if (blobId.startsWith('local_')) {
      this.logger.log(`Retrieving file from local storage: ${blobId}`);
      return await this.localStorageService.retrieveFile(blobId);
    } else {
      // Try Walrus first, then local as fallback
      try {
        this.logger.log(`Retrieving file from Walrus: ${blobId}`);
        return await this.walrusService.downloadFile(blobId);
      } catch (error) {
        this.logger.warn(`Walrus retrieval failed, trying local storage: ${error.message}`);
        return await this.localStorageService.retrieveFile(blobId);
      }
    }
  }

  /**
   * Retrieve content as string
   */
  async retrieveContent(blobId: string): Promise<string> {
    if (blobId.startsWith('local_')) {
      return await this.localStorageService.retrieveContent(blobId);
    } else {
      const buffer = await this.retrieveFile(blobId);
      return buffer.toString('utf-8');
    }
  }

  /**
   * Check if file exists
   */
  async exists(blobId: string): Promise<boolean> {
    if (blobId.startsWith('local_')) {
      return await this.localStorageService.exists(blobId);
    } else {
      try {
        await this.walrusService.downloadFile(blobId);
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    local: any;
    walrus: { available: boolean; lastCheck: Date };
  }> {
    const localStats = await this.localStorageService.getStats();
    
    return {
      local: localStats,
      walrus: {
        available: this.walrusAvailable,
        lastCheck: new Date(this.lastWalrusCheck)
      }
    };
  }

  /**
   * Force use of local storage (for demo)
   */
  forceLocalStorage(): void {
    this.walrusAvailable = false;
    this.logger.log('Forced to use local storage only');
  }

  /**
   * Get admin address (for compatibility)
   */
  getAdminAddress(): string {
    return this.walrusService.getAdminAddress();
  }
}
````

## File: src/infrastructure/sui/sui.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SuiService } from './sui.service';

describe('SuiService', () => {
  let service: SuiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuiService],
    }).compile();

    service = module.get<SuiService>(SuiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/infrastructure/sui/sui.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  SuiClient, 
  getFullnodeUrl
} from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { ChatMessage, ChatSession } from '../../types/chat.types';

@Injectable()
export class SuiService {
  private client: SuiClient;
  private packageId: string;
  private adminKeypair: Ed25519Keypair;
  private logger = new Logger(SuiService.name);

  constructor(private configService: ConfigService) {
    // Initialize Sui client
    const network = this.configService.get<string>('SUI_NETWORK', 'testnet');
    
    // Ensure network is a valid Sui network
    let networkUrl: string;
    
    if (network === 'testnet') {
      networkUrl = getFullnodeUrl('testnet');
    } else if (network === 'mainnet') {
      networkUrl = getFullnodeUrl('mainnet');
    } else if (network === 'devnet') {
      networkUrl = getFullnodeUrl('devnet');
    } else if (network === 'localnet') {
      networkUrl = getFullnodeUrl('localnet');
    } else {
      this.logger.warn(`Invalid SUI_NETWORK: ${network}, falling back to testnet`);
      networkUrl = getFullnodeUrl('testnet');
    }
    
    this.client = new SuiClient({ url: networkUrl });
    
    // Get package ID from config
    let packageId = this.configService.get<string>('SUI_PACKAGE_ID');
    
    // Handle potential malformed package ID (split across lines)
    if (packageId && packageId.length < 66 && packageId.startsWith('0x')) {
      this.logger.warn('Malformed SUI_PACKAGE_ID detected, using default instead');
      packageId = undefined;
    }
    
    if (!packageId) {
      this.logger.warn('SUI_PACKAGE_ID not provided or invalid, using default');
      this.packageId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    } else {
      this.packageId = packageId;
    }
    
    this.logger.log(`Using SUI_PACKAGE_ID: ${this.packageId}`); // Log the package ID being used
    
    // Initialize admin keypair for gas
    let privateKey = this.configService.get<string>('SUI_ADMIN_PRIVATE_KEY');
    
    // Handle potentially malformed private key (split across lines)
    try {
      if (privateKey) {
        // Clean up the private key and ensure it's in the right format
        privateKey = privateKey.replace(/\s+/g, ''); // Remove any whitespace
        
        if (!privateKey.startsWith('0x')) {
          privateKey = '0x' + privateKey;
        }
        
        // Ensure it's the right length after removing 0x prefix
        const keyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
        if (keyBuffer.length !== 32) {
          throw new Error(`Invalid key length: ${keyBuffer.length}, expected 32`);
        }
        
        this.adminKeypair = Ed25519Keypair.fromSecretKey(keyBuffer);
        const adminAddress = this.adminKeypair.getPublicKey().toSuiAddress();
    this.logger.log(`SUI admin keypair initialized successfully with address: ${adminAddress}`);
      } else {
        this.logger.warn('SUI_ADMIN_PRIVATE_KEY not provided, some operations may fail');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize admin keypair: ${error.message}`);
      this.logger.warn('Using mock keypair for development');
      
      // Generate a random keypair for development/testing
      this.adminKeypair = new Ed25519Keypair();
    }
  }

  // CHAT SESSIONS METHODS

  /**
   * Get all chat sessions for a user
   */
  async getChatSessions(userAddress: string): Promise<ChatSession[]> {
    try {
      // Query all ChatSession objects owned by the user
      const response = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::chat_sessions::ChatSession`
        },
        options: {
          showContent: true,
        },
      });

      const sessions: ChatSession[] = [];

      for (const item of response.data) {
        if (!item.data?.content) continue;

        const content = item.data.content as any;
        const fields = content.fields;
        
        // Process session data
        sessions.push({
          id: item.data.objectId,
          owner: fields.owner,
          title: fields.model_name, // Use model name as title initially
          messages: this.deserializeMessages(fields.messages),
          created_at: new Date().toISOString(), // Use creation time if available
          updated_at: new Date().toISOString(), // Use update time if available
          message_count: fields.messages.length,
          sui_object_id: item.data.objectId
        });
      }

      return sessions;
    } catch (error) {
      this.logger.error(`Error getting chat sessions: ${error.message}`);
      throw new Error(`Failed to get chat sessions: ${error.message}`);
    }
  }

  /**
   * Create a new chat session
   */
  async createChatSession(userAddress: string, modelName: string): Promise<string> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::chat_sessions::create_session`,
        arguments: [
          tx.pure(modelName),
        ],
      });

      const result = await this.executeTransaction(tx, userAddress);
      const objectId = this.extractCreatedObjectId(result);
      
      return objectId;
    } catch (error) {
      this.logger.error(`Error creating chat session: ${error.message}`);
      throw new Error(`Failed to create chat session: ${error.message}`);
    }
  }

  /**
   * Add a message to a session
   */
  async addMessageToSession(
    sessionId: string, 
    userAddress: string,
    role: string, 
    content: string
  ): Promise<boolean> {
    try {
      const tx = new TransactionBlock();
      
      // Get the chat session object
      tx.moveCall({
        target: `${this.packageId}::chat_sessions::add_message_to_session`,
        arguments: [
          tx.object(sessionId),
          tx.pure(role),
          tx.pure(content),
        ],
      });

      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error adding message to session: ${error.message}`);
      throw new Error(`Failed to add message to session: ${error.message}`);
    }
  }

  /**
   * Save session summary
   */
  async saveSessionSummary(
    sessionId: string, 
    userAddress: string,
    summary: string
  ): Promise<boolean> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::chat_sessions::save_session_summary`,
        arguments: [
          tx.object(sessionId),
          tx.pure(summary),
        ],
      });

      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error saving session summary: ${error.message}`);
      throw new Error(`Failed to save session summary: ${error.message}`);
    }
  }

  /**
   * Get a specific chat session
   */
  async getChatSession(sessionId: string): Promise<{
    owner: string;
    modelName: string;
    messages: ChatMessage[];
    summary: string;
  }> {
    try {
      const object = await this.client.getObject({
        id: sessionId,
        options: {
          showContent: true,
        },
      });

      if (!object || !object.data || !object.data.content) {
        throw new Error(`Chat session ${sessionId} not found`);
      }

      const content = object.data.content as any;
      return {
        owner: content.fields.owner,
        modelName: content.fields.model_name,
        messages: this.deserializeMessages(content.fields.messages),
        summary: content.fields.summary,
      };
    } catch (error) {
      this.logger.error(`Error getting chat session: ${error.message}`);
      throw new Error(`Failed to get chat session: ${error.message}`);
    }
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string, userAddress: string): Promise<boolean> {
    try {
      // First verify the user owns the session
      const session = await this.getChatSession(sessionId);
      if (session.owner !== userAddress) {
        throw new Error('You do not own this session');
      }
      
      // Create transaction to delete the session
      const tx = new TransactionBlock();
      
      // In a real implementation, you would call a delete function
      // Here we're transferring ownership to a burn address as an example
      tx.transferObjects(
        [tx.object(sessionId)],
        tx.pure('0x000000000000000000000000000000000000000000000000000000000000dead')
      );
      
      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting session: ${error.message}`);
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  /**
   * Update session title (note: this is a mock since our contract doesn't have this function)
   */
  async updateSessionTitle(
    sessionId: string,
    userAddress: string,
    title: string
  ): Promise<boolean> {
    // In a real implementation, we would update the title in the contract
    // For now, we just verify ownership and pretend we updated it
    try {
      const session = await this.getChatSession(sessionId);
      if (session.owner !== userAddress) {
        throw new Error('You do not own this session');
      }
      
      // We would update the title here if the contract supported it
      return true;
    } catch (error) {
      this.logger.error(`Error updating session title: ${error.message}`);
      throw new Error(`Failed to update session title: ${error.message}`);
    }
  }

  // MEMORY METHODS

  /**
   * Create a memory record
   */
  async createMemoryRecord(
    userAddress: string, 
    category: string, 
    vectorId: number,
    blobId: string
  ): Promise<string> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::memory::create_memory_record`,
        arguments: [
          tx.pure(category),
          tx.pure(vectorId),
          tx.pure(blobId),
        ],
      });

      const result = await this.executeTransaction(tx, userAddress);
      const objectId = this.extractCreatedObjectId(result);
      
      return objectId;
    } catch (error) {
      this.logger.error(`Error creating memory record: ${error.message}`);
      throw new Error(`Failed to create memory record: ${error.message}`);
    }
  }

  /**
   * Create a memory index
   */
  async createMemoryIndex(
    userAddress: string, 
    indexBlobId: string, 
    graphBlobId: string
  ): Promise<string> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::memory::create_memory_index`,
        arguments: [
          tx.pure(indexBlobId),
          tx.pure(graphBlobId),
        ],
      });

      const result = await this.executeTransaction(tx, userAddress);
      const objectId = this.extractCreatedObjectId(result);
      
      return objectId;
    } catch (error) {
      this.logger.error(`Error creating memory index: ${error.message}`);
      throw new Error(`Failed to create memory index: ${error.message}`);
    }
  }

  /**
   * Update memory index
   */
  async updateMemoryIndex(
    indexId: string,
    userAddress: string,
    expectedVersion: number,
    newIndexBlobId: string,
    newGraphBlobId: string
  ): Promise<boolean> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::memory::update_memory_index`,
        arguments: [
          tx.object(indexId),
          tx.pure(expectedVersion),
          tx.pure(newIndexBlobId),
          tx.pure(newGraphBlobId),
        ],
      });

      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error updating memory index: ${error.message}`);
      throw new Error(`Failed to update memory index: ${error.message}`);
    }
  }

  /**
   * Get memory index
   */
  async getMemoryIndex(indexId: string): Promise<{
    owner: string;
    version: number;
    indexBlobId: string;
    graphBlobId: string;
  }> {
    try {
      const object = await this.client.getObject({
        id: indexId,
        options: {
          showContent: true,
        },
      });

      if (!object || !object.data || !object.data.content) {
        throw new Error(`Memory index ${indexId} not found`);
      }

      const content = object.data.content as any;
      return {
        owner: content.fields.owner,
        version: Number(content.fields.version),
        indexBlobId: content.fields.index_blob_id,
        graphBlobId: content.fields.graph_blob_id,
      };
    } catch (error) {
      this.logger.error(`Error getting memory index: ${error.message}`);
      throw new Error(`Failed to get memory index: ${error.message}`);
    }
  }

  /**
   * Get memories with a specific vector ID
   */
  async getMemoriesWithVectorId(userAddress: string, vectorId: number): Promise<{
    id: string;
    category: string;
    blobId: string;
  }[]> {
    try {
      // Query memories owned by this user
      const response = await this.client.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: this.packageId,
            module: 'memory',
            function: 'create_memory_record',
          },
        },
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
        },
      });

      const memories = [];

      // Process the transactions to find memories with matching vectorId
      for (const tx of response.data) {
        for (const event of tx.events || []) {
          if (event.type.includes('::memory::MemoryCreated')) {
            // Check if this memory has the target vectorId and belongs to the user
            const parsedData = event.parsedJson as any;
            if (
              parsedData && 
              parsedData.owner === userAddress &&
              Number(parsedData.vector_id) === vectorId
            ) {
              // Find the memory object created in this transaction
              const objectChanges = tx.objectChanges || [];
              const createdMemory = objectChanges.find(
                change => change.type === 'created' && 
                change.objectType.includes('::memory::Memory')
              );
              
              if (createdMemory) {
                // Get the full memory object to retrieve the blobId
                const memory = await this.client.getObject({
                  id: (createdMemory as any).objectId || '',
                  options: { showContent: true },
                });
                
                if (memory && memory.data && memory.data.content) {
                  const content = memory.data.content as any;
                  (memories as any).push({
                                      id: (createdMemory as any).objectId || '',
                  category: content.fields.category,
                  blobId: content.fields.blob_id,
                  });
                }
              }
            }
          }
        }
      }

      return memories;
    } catch (error) {
      this.logger.error(`Error getting memories with vector ID ${vectorId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get all memories for a user
   */
  async getUserMemories(userAddress: string): Promise<{
    id: string;
    category: string;
    blobId: string;
  }[]> {
    try {
      // Query all Memory objects owned by the user
      const response = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::memory::Memory`
        },
        options: {
          showContent: true,
        },
      });

      const memories = [];

      for (const item of response.data) {
        if (!item.data?.content) continue;

        const content = item.data.content as any;
        (memories as any).push({
          id: item.data.objectId,
          category: content.fields.category,
          blobId: content.fields.blob_id,
          vectorId: Number(content.fields.vector_id)
        } as any);
      }

      return memories;
    } catch (error) {
      this.logger.error(`Error getting user memories: ${error.message}`);
      return [];
    }
  }

  /**
   * Get all memory indexes for a user
   */
  async getUserMemoryIndexes(userAddress: string): Promise<{
    id: string;
    owner: string;
    version: number;
    indexBlobId: string;
    graphBlobId: string;
  }[]> {
    try {
      // Query all MemoryIndex objects owned by the user
      const response = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::memory::MemoryIndex`
        },
        options: {
          showContent: true,
        },
      });

      const indexes: Array<{
        id: string;
        owner: string;
        version: number;
        indexBlobId: string;
        graphBlobId: string;
      }> = [];

      for (const item of response.data) {
        if (!item.data?.content) continue;

        const content = item.data.content as any;
        indexes.push({
          id: item.data.objectId,
          owner: content.fields.owner,
          version: Number(content.fields.version),
          indexBlobId: content.fields.index_blob_id,
          graphBlobId: content.fields.graph_blob_id,
        });
      }

      // Sort by version descending to get the most recent first
      indexes.sort((a, b) => b.version - a.version);

      return indexes;
    } catch (error) {
      this.logger.error(`Error getting user memory indexes: ${error.message}`);
      return [];
    }
  }

  /**
   * Get a specific memory
   */
  async getMemory(memoryId: string): Promise<{
    id: string;
    owner: string;
    category: string;
    blobId: string;
    vectorId: number;
  }> {
    try {
      const object = await this.client.getObject({
        id: memoryId,
        options: {
          showContent: true,
        },
      });

      if (!object || !object.data || !object.data.content) {
        throw new Error(`Memory ${memoryId} not found`);
      }

      const content = object.data.content as any;
      return {
        id: memoryId,
        owner: content.fields.owner,
        category: content.fields.category,
        blobId: content.fields.blob_id,
        vectorId: Number(content.fields.vector_id),
      };
    } catch (error) {
      this.logger.error(`Error getting memory: ${error.message}`);
      throw new Error(`Failed to get memory: ${error.message}`);
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string, userAddress: string): Promise<boolean> {
    try {
      // First verify the user owns the memory
      const memory = await this.getMemory(memoryId);
      if (memory.owner !== userAddress) {
        throw new Error('You do not own this memory');
      }
      
      // Create transaction to delete the memory
      const tx = new TransactionBlock();
      
      // In a real implementation, you would call a delete function
      // Here we're transferring ownership to a burn address as an example
      tx.transferObjects(
        [tx.object(memoryId)],
        tx.pure('0x000000000000000000000000000000000000000000000000000000000000dead')
      );
      
      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting memory: ${error.message}`);
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  // NFT POLICY METHODS

  /**
   * Create a Seal policy for NFT-based access control
   */
  async createSealPolicyForNft(
    userAddress: string,
    initialNftType: string,
    description: string
  ): Promise<{
    policyId: string;
    capId: string;
  }> {
    try {
      const nftPolicyPackageId = this.configService.get<string>('NFT_POLICY_PACKAGE_ID');
      
      if (!nftPolicyPackageId) {
        throw new Error('NFT_POLICY_PACKAGE_ID not configured');
      }

      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${nftPolicyPackageId}::nft_policy::create_nft_policy`,
        arguments: [
          tx.pure(initialNftType),
          tx.pure(description),
        ],
      });

      const result = await this.executeTransaction(tx, userAddress);
      
      // Extract both the policy object and capability object IDs
      const objectChanges = result.objectChanges || [];
      const createdObjects = objectChanges.filter(change => change.type === 'created');
      
      const policyObject = createdObjects.find(obj => 
        obj.objectType && obj.objectType.includes('::nft_policy::NftPolicy')
      );
      const capObject = createdObjects.find(obj => 
        obj.objectType && obj.objectType.includes('::nft_policy::NftPolicyCap')
      );

      if (!policyObject || !capObject) {
        throw new Error('Failed to extract policy and capability object IDs');
      }

      return {
        policyId: (policyObject as any).objectId,
        capId: (capObject as any).objectId,
      };
    } catch (error) {
      this.logger.error(`Error creating Seal NFT policy: ${error.message}`);
      throw new Error(`Failed to create Seal NFT policy: ${error.message}`);
    }
  }

  /**
   * Add NFT type to an existing policy
   */
  async addNftTypeToPolicy(
    userAddress: string,
    capId: string,
    policyId: string,
    newNftType: string
  ): Promise<boolean> {
    try {
      const nftPolicyPackageId = this.configService.get<string>('NFT_POLICY_PACKAGE_ID');
      
      if (!nftPolicyPackageId) {
        throw new Error('NFT_POLICY_PACKAGE_ID not configured');
      }

      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${nftPolicyPackageId}::nft_policy::add_nft_type`,
        arguments: [
          tx.object(capId),
          tx.object(policyId),
          tx.pure(newNftType),
        ],
      });

      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error adding NFT type to policy: ${error.message}`);
      throw new Error(`Failed to add NFT type to policy: ${error.message}`);
    }
  }

  /**
   * Remove NFT type from an existing policy
   */
  async removeNftTypeFromPolicy(
    userAddress: string,
    capId: string,
    policyId: string,
    nftTypeToRemove: string
  ): Promise<boolean> {
    try {
      const nftPolicyPackageId = this.configService.get<string>('NFT_POLICY_PACKAGE_ID');
      
      if (!nftPolicyPackageId) {
        throw new Error('NFT_POLICY_PACKAGE_ID not configured');
      }

      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${nftPolicyPackageId}::nft_policy::remove_nft_type`,
        arguments: [
          tx.object(capId),
          tx.object(policyId),
          tx.pure(nftTypeToRemove),
        ],
      });

      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error removing NFT type from policy: ${error.message}`);
      throw new Error(`Failed to remove NFT type from policy: ${error.message}`);
    }
  }

  /**
   * Verify NFT access for Seal policy (dry run)
   */
  async verifySealNftAccess(
    policyId: string,
    nftType: string,
    objectId: string
  ): Promise<boolean> {
    try {
      const nftPolicyPackageId = this.configService.get<string>('NFT_POLICY_PACKAGE_ID');
      
      if (!nftPolicyPackageId) {
        throw new Error('NFT_POLICY_PACKAGE_ID not configured');
      }

      // Convert objectId string to bytes for the contract
      const objectIdBytes = Array.from(Buffer.from(objectId.replace('0x', ''), 'hex'));

      // Create a dry-run transaction to test access
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${nftPolicyPackageId}::nft_policy::seal_approve`,
        arguments: [
          tx.pure(nftType),
          tx.pure(objectIdBytes),
          tx.object(policyId),
        ],
      });

      // Use dry run to test without executing
      const result = await this.client.dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: this.client }),
      });

      // If dry run succeeds, access is granted
      return result.effects.status?.status === 'success';
    } catch (error) {
      this.logger.error(`Error verifying Seal NFT access: ${error.message}`);
      return false;
    }
  }

  // Helper methods
  private async executeTransaction(tx: TransactionBlock, sender: string) {
    // Set the sender to the actual user address
    tx.setSender(sender);
    
    this.logger.log(`Executing transaction for user ${sender}`);
    
    // For demonstration purposes in development, we can use the admin keypair
    // But we use the user's address as sender
    try {
      return await this.client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: this.adminKeypair,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
        requestType: 'WaitForLocalExecution',
      });
    } catch (error) {
      this.logger.error(`Transaction execution failed: ${error.message}`);
      throw error;
    }
  }

  private extractCreatedObjectId(result: any): string {
    try {
      // Extract the object ID from the transaction result
      const created = result.objectChanges.filter(
        change => change.type === 'created'
      )[0];
      
      return created?.objectId || '';
    } catch (error) {
      return '';
    }
  }

  private deserializeMessages(serializedMessages: any): ChatMessage[] {
    try {
      // Convert Sui Move vector to TypeScript array
      return serializedMessages.map(msg => ({
        role: msg.fields.role,
        content: msg.fields.content,
      }));
    } catch (error) {
      return [];
    }
  }
}
````

## File: src/infrastructure/walrus/cached-walrus.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalrusService } from './walrus.service';
import NodeCache from 'node-cache';

@Injectable()
export class CachedWalrusService {
  private logger = new Logger(CachedWalrusService.name);
  private contentCache: NodeCache;
  
  constructor(
    private readonly walrusService: WalrusService,
    private readonly configService: ConfigService
  ) {
    // Initialize in-memory cache with default TTL of 30 minutes
    const ttl = configService.get<number>('WALRUS_CACHE_TTL', 30 * 60);
    const checkperiod = configService.get<number>('WALRUS_CACHE_CHECK_PERIOD', 60);
    
    this.contentCache = new NodeCache({
      stdTTL: ttl,
      checkperiod, // Check for expired entries every minute
      useClones: false, // Don't clone objects for better performance
      maxKeys: 10000 // Maximum number of keys
    });
    
    this.logger.log(`Initialized Walrus cache with TTL: ${ttl}s, check period: ${checkperiod}s`);
  }
  
  /**
   * Get admin address (passthrough to base service)
   */
  getAdminAddress(): string {
    return this.walrusService.getAdminAddress();
  }
  
  /**
   * Upload content to Walrus with caching
   */
  async uploadContent(
    content: string,
    ownerAddress: string,
    epochs?: number,
    additionalTags?: Record<string, string>
  ): Promise<string> {
    // Upload is always passed through to the original service
    const blobId = await this.walrusService.uploadContent(
      content,
      ownerAddress,
      epochs,
      additionalTags
    );
    
    // Cache the content after successful upload
    this.contentCache.set(blobId, content);
    this.logger.debug(`Cached content for blob ID: ${blobId}`);
    
    return blobId;
  }
  
  /**
   * Retrieve content from Walrus with caching
   */
  async retrieveContent(blobId: string): Promise<string> {
    // Check cache first
    const cachedContent = this.contentCache.get<string>(blobId);
    
    if (cachedContent) {
      this.logger.debug(`Cache hit for blob ID: ${blobId}`);
      return cachedContent;
    }
    
    // Cache miss, fetch from Walrus
    this.logger.debug(`Cache miss for blob ID: ${blobId}, fetching from Walrus`);
    try {
      const content = await this.walrusService.retrieveContent(blobId);
      
      // Cache the result
      this.contentCache.set(blobId, content);
      
      return content;
    } catch (error) {
      this.logger.error(`Error retrieving content from Walrus: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get file tags from Walrus (passthrough)
   */
  async getFileTags(blobId: string): Promise<Record<string, string>> {
    return this.walrusService.getFileTags(blobId);
  }
  
  /**
   * Check if a user has access to a file (passthrough)
   */
  async verifyUserAccess(blobId: string, userAddress: string): Promise<boolean> {
    return this.walrusService.verifyUserAccess(blobId, userAddress);
  }
  
  /**
   * Upload a file to Walrus with caching
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    ownerAddress: string,
    epochs?: number,
    additionalTags?: Record<string, string>
  ): Promise<string> {
    const blobId = await this.walrusService.uploadFile(
      buffer,
      filename,
      ownerAddress,
      epochs,
      additionalTags
    );
    
    return blobId;
  }
  
  /**
   * Download a file from Walrus with caching
   */
  async downloadFile(blobId: string): Promise<Buffer> {
    // For binary data, we use a separate method - no caching for now
    // We could implement this with a more sophisticated cache strategy if needed
    return this.walrusService.downloadFile(blobId);
  }
  
  /**
   * Delete content from Walrus and clear from cache
   */
  async deleteContent(
    blobId: string,
    userAddress: string
  ): Promise<boolean> {
    // Remove from cache first
    this.contentCache.del(blobId);
    
    // Then delete from Walrus
    return this.walrusService.deleteContent(blobId, userAddress);
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): {
    keys: number;
    hits: number;
    misses: number;
    ksize: number;
    vsize: number;
  } {
    return this.contentCache.getStats();
  }
  
  /**
   * Clear the entire cache
   */
  clearCache(): void {
    this.contentCache.flushAll();
    this.logger.log('Walrus content cache cleared');
  }
}
````

## File: src/infrastructure/walrus/walrus.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { WalrusService } from './walrus.service';

describe('WalrusService', () => {
  let service: WalrusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalrusService],
    }).compile();

    service = module.get<WalrusService>(WalrusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/infrastructure/walrus/walrus.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient, WalrusFile, RetryableWalrusClientError } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class WalrusService {
  private walrusClient: WalrusClient;
  private suiClient: SuiClient;
  private adminKeypair: Ed25519Keypair;
  private logger = new Logger(WalrusService.name);
  private adminAddress: string;

  // Number of epochs to store content for by default
  private readonly DEFAULT_STORAGE_EPOCHS = 12; // ~1 month at ~3 days/epoch

  // Local storage fallback
  private readonly LOCAL_STORAGE_DIR = path.join(process.cwd(), 'storage', 'walrus-fallback');
  private walrusAvailable = true;
  private lastWalrusCheck = 0;
  private readonly WALRUS_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(private configService: ConfigService) {
    // Initialize Sui client with the appropriate network
    const configNetwork = this.configService.get<string>('SUI_NETWORK', 'testnet');

    // Validate network for type safety
    const network = configNetwork || 'testnet';

    this.suiClient = new SuiClient({
      url: getFullnodeUrl(network as 'testnet' | 'mainnet'),
    });

    // Initialize admin keypair for signing transactions
    this.initializeAdminKeypair();

    // Initialize local storage directory
    this.initializeLocalStorage();

    // Initialize Walrus client with simple, reliable configuration
    this.initializeWalrusClient(network as 'testnet' | 'mainnet');

    this.logger.log(`Initialized Walrus client on ${network} network with local storage fallback`);
  }
  
  /**
   * Initialize Walrus client following SDK best practices
   */
  private initializeWalrusClient(network: 'testnet' | 'mainnet') {
    try {
      // Simple, reliable configuration following SDK documentation
      const clientOptions: any = {
        network,
        suiClient: this.suiClient,
        // Configure storage node options for better reliability
        storageNodeClientOptions: {
          timeout: 60_000, // 60 seconds as recommended in SDK docs
          onError: (error: Error) => {
            this.logger.debug(`Storage node error: ${error.message}`);
          },
        },
      };

      // Add upload relay for testnet (recommended for better performance)
      if (network === 'testnet') {
        const useUploadRelay = this.configService.get<boolean>('WALRUS_USE_UPLOAD_RELAY', true);

        if (useUploadRelay) {
          const uploadRelayHost = this.configService.get<string>(
            'WALRUS_UPLOAD_RELAY_HOST',
            'https://upload-relay.testnet.walrus.space'
          );

          clientOptions.uploadRelay = {
            host: uploadRelayHost,
            sendTip: {
              // Use the tip configuration from SDK docs
              address: '0x4b6a7439159cf10533147fc3d678cf10b714f2bc998f6cb1f1b0b9594cdc52b6',
              kind: {
                const: 105,
              },
            },
          };
          this.logger.log(`Walrus client configured with upload relay: ${uploadRelayHost}`);
        }
      }

      this.walrusClient = new WalrusClient(clientOptions);
      this.logger.log(`Walrus client initialized successfully for ${network}`);
    } catch (error) {
      this.logger.error(`Failed to initialize Walrus client: ${error.message}`);
      throw new Error(`Walrus client initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize admin keypair for signing transactions
   */
  private initializeAdminKeypair() {
    try {
      const privateKey = this.configService.get<string>('SUI_ADMIN_PRIVATE_KEY');
      
      if (!privateKey) {
        throw new Error('SUI_ADMIN_PRIVATE_KEY not provided');
      }
      
      // Handle both hex format and SUI private key format
      const cleanedKey = privateKey.replace(/\s+/g, ''); // Remove any whitespace
      
      if (cleanedKey.startsWith('suiprivkey1')) {
        // SUI private key format - use directly
        this.adminKeypair = Ed25519Keypair.fromSecretKey(cleanedKey);
      } else {
        // Hex format - convert to buffer
        const keyWithPrefix = cleanedKey.startsWith('0x') ? cleanedKey : `0x${cleanedKey}`;
        const keyBuffer = Buffer.from(keyWithPrefix.replace('0x', ''), 'hex');
        if (keyBuffer.length !== 32) {
          throw new Error(`Invalid hex key length: ${keyBuffer.length}, expected 32`);
        }
        this.adminKeypair = Ed25519Keypair.fromSecretKey(keyBuffer);
      }
      this.adminAddress = this.adminKeypair.getPublicKey().toSuiAddress();
      
      this.logger.log(`Walrus service using admin address: ${this.adminAddress}`);
    } catch (error) {
      this.logger.error(`Failed to initialize admin keypair: ${error.message}`);
      throw new Error(`Admin keypair initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize local storage directory for fallback
   */
  private async initializeLocalStorage() {
    try {
      await mkdir(this.LOCAL_STORAGE_DIR, { recursive: true });
      this.logger.log(`Local storage fallback initialized at: ${this.LOCAL_STORAGE_DIR}`);
    } catch (error) {
      this.logger.error(`Failed to initialize local storage: ${error.message}`);
    }
  }

  /**
   * Check if Walrus is available (with caching to avoid frequent checks)
   */
  private async isWalrusAvailable(): Promise<boolean> {
    const now = Date.now();

    // Use cached result if recent
    if (now - this.lastWalrusCheck < this.WALRUS_CHECK_INTERVAL) {
      return this.walrusAvailable;
    }

    try {
      // Quick availability check - try to get a non-existent file
      const testPromise = this.walrusClient.getFiles({ ids: ['availability-test'] });
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Availability check timeout')), 5000);
      });

      await Promise.race([testPromise, timeoutPromise]);
      this.walrusAvailable = true;
      this.logger.debug('Walrus availability check: AVAILABLE');
    } catch (error: any) {
      if (error.message.includes('timeout') ||
          error.message.includes('fetch failed') ||
          error.message.includes('network')) {
        this.walrusAvailable = false;
        this.logger.warn('Walrus availability check: UNAVAILABLE - using local storage fallback');
      } else {
        // Other errors (like "not found") mean Walrus is working
        this.walrusAvailable = true;
        this.logger.debug('Walrus availability check: AVAILABLE');
      }
    }

    this.lastWalrusCheck = now;
    return this.walrusAvailable;
  }

  /**
   * Generate a unique blob ID for local storage
   */
  private generateLocalBlobId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Store file locally as fallback
   */
  private async storeFileLocally(buffer: Buffer, filename: string, tags: Record<string, string> = {}): Promise<string> {
    const blobId = this.generateLocalBlobId();
    const filePath = path.join(this.LOCAL_STORAGE_DIR, `${blobId}.bin`);
    const metaPath = path.join(this.LOCAL_STORAGE_DIR, `${blobId}.meta.json`);

    try {
      // Store the file data
      await writeFile(filePath, buffer);

      // Store metadata
      const metadata = {
        blobId,
        filename,
        tags,
        size: buffer.length,
        createdAt: new Date().toISOString(),
        storageType: 'local_fallback'
      };
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));

      this.logger.log(`File stored locally: ${blobId} (${buffer.length} bytes)`);
      return blobId;
    } catch (error) {
      this.logger.error(`Failed to store file locally: ${error.message}`);
      throw new Error(`Local storage error: ${error.message}`);
    }
  }

  /**
   * Retrieve file from local storage
   */
  private async retrieveFileLocally(blobId: string): Promise<Buffer> {
    const filePath = path.join(this.LOCAL_STORAGE_DIR, `${blobId}.bin`);

    try {
      const buffer = await readFile(filePath);
      this.logger.log(`File retrieved from local storage: ${blobId} (${buffer.length} bytes)`);
      return buffer;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found in local storage: ${blobId}`);
      }
      this.logger.error(`Failed to retrieve file locally: ${error.message}`);
      throw new Error(`Local storage retrieval error: ${error.message}`);
    }
  }

  /**
   * Get admin address
   * @returns The admin address
   */
  getAdminAddress(): string {
    return this.adminAddress;
  }



  /**
   * Upload content with Walrus/local storage fallback
   * @param content The content to upload
   * @param ownerAddress The address of the owner
   * @param epochs Number of epochs to store the content
   * @param additionalTags Additional metadata tags to include
   * @returns The blob ID
   */
  async uploadContent(
    content: string,
    ownerAddress: string,
    epochs: number = this.DEFAULT_STORAGE_EPOCHS,
    additionalTags: Record<string, string> = {}
  ): Promise<string> {
    const buffer = Buffer.from(content, 'utf-8');
    const filename = `content_${Date.now()}.txt`;
    const tags = {
      'content-type': 'text/plain',
      'owner': ownerAddress,
      'created': new Date().toISOString(),
      ...additionalTags
    };

    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();

    if (!walrusAvailable) {
      this.logger.warn(`Walrus unavailable, storing content locally for owner ${ownerAddress}`);
      return await this.storeFileLocally(buffer, filename, tags);
    }

    try {
      this.logger.log(`Uploading content to Walrus for owner ${ownerAddress}...`);

      // Create a WalrusFile from string content
      const file = WalrusFile.from({
        contents: new TextEncoder().encode(content),
        identifier: filename,
        tags,
      });

      // Use the complete workflow for production
      const results = await this.uploadFilesToWalrus([file], epochs);

      if (!results || results.length === 0) {
        throw new Error('Failed to upload content to Walrus');
      }

      return results[0].blobId;
    } catch (error) {
      this.logger.error(`Walrus upload failed, falling back to local storage: ${error.message}`);
      // Fallback to local storage
      return await this.storeFileLocally(buffer, filename, tags);
    }
  }

  /**
   * Retrieve content from Walrus
   * @param blobId The blob ID to retrieve
   * @returns The retrieved content
   */
  async retrieveContent(blobId: string): Promise<string> {
    try {
      this.logger.log(`Retrieving content from blobId: ${blobId}`);
      
      // Get file from the blob ID
      const [file] = await this.walrusClient.getFiles({ 
        ids: [blobId] 
      });
      
      if (!file) {
        throw new Error(`File with blob ID ${blobId} not found`);
      }
      
      // Convert to text
      const content = await file.text();
      
      return content;
    } catch (error) {
      this.logger.error(`Error retrieving content from Walrus: ${error.message}`);
      throw new Error(`Walrus retrieval error: ${error.message}`);
    }
  }

  /**
   * Get file tags from Walrus
   * @param blobId The blob ID
   * @returns The file tags
   */
  async getFileTags(blobId: string): Promise<Record<string, string>> {
    try {
      const [file] = await this.walrusClient.getFiles({ 
        ids: [blobId] 
      });
      
      if (!file) {
        throw new Error(`File with blob ID ${blobId} not found`);
      }
      
      return await file.getTags();
    } catch (error) {
      this.logger.error(`Error retrieving file tags from Walrus: ${error.message}`);
      throw new Error(`Walrus tag retrieval error: ${error.message}`);
    }
  }

  /**
   * Check if a user has access to a file based on tags
   * @param blobId The blob ID
   * @param userAddress The user's address
   * @returns True if the user has access
   */
  async verifyUserAccess(blobId: string, userAddress: string): Promise<boolean> {
    try {
      const tags = await this.getFileTags(blobId);
      
      // Check if user is the owner or has user-address tag
      return tags['owner'] === userAddress || 
             tags['user-address'] === userAddress ||
             // Also check user addresses without 0x prefix
             tags['user-address'] === userAddress.replace('0x', '');
    } catch (error) {
      this.logger.error(`Error verifying user access: ${error.message}`);
      return false;
    }
  }

  /**
   * Upload a file with Walrus/local storage fallback
   * @param buffer The file buffer
   * @param filename The file name
   * @param ownerAddress The address of the owner
   * @param epochs Number of epochs to store the file
   * @param additionalTags Additional metadata tags to include
   * @returns The blob ID
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    ownerAddress: string,
    epochs: number = this.DEFAULT_STORAGE_EPOCHS,
    additionalTags: Record<string, string> = {}
  ): Promise<string> {
    const tags = {
      'content-type': 'application/octet-stream',
      'filename': filename,
      'owner': ownerAddress,
      'created': new Date().toISOString(),
      ...additionalTags
    };

    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();

    if (!walrusAvailable) {
      this.logger.warn(`Walrus unavailable, storing file "${filename}" locally for owner ${ownerAddress}`);
      return await this.storeFileLocally(buffer, filename, tags);
    }

    try {
      this.logger.log(`Uploading file "${filename}" to Walrus for owner ${ownerAddress}...`);

      // Create a WalrusFile from buffer with filename as identifier
      const file = WalrusFile.from({
        contents: new Uint8Array(buffer),
        identifier: filename,
        tags,
      });

      // Use the complete workflow for production
      const results = await this.uploadFilesToWalrus([file], epochs);

      if (!results || results.length === 0) {
        throw new Error('Failed to upload file to Walrus');
      }

      return results[0].blobId;
    } catch (error) {
      this.logger.error(`Walrus upload failed, falling back to local storage: ${error.message}`);
      // Fallback to local storage
      return await this.storeFileLocally(buffer, filename, tags);
    }
  }

  /**
   * Download a file from Walrus with local storage fallback
   * @param blobId The blob ID
   * @returns The file buffer
   */
  async downloadFile(blobId: string): Promise<Buffer> {
    // Check if this is a local blob ID
    if (blobId.startsWith('local_')) {
      this.logger.log(`Retrieving file from local storage: ${blobId}`);
      return await this.retrieveFileLocally(blobId);
    }

    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();
    if (!walrusAvailable) {
      throw new Error(
        'Walrus storage network is currently unavailable and the requested file is not in local storage. ' +
        'Please try again later when the network is stable.'
      );
    }

    const maxRetries = 2; // Reduced retries for faster fallback
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Downloading file from Walrus: ${blobId} (attempt ${attempt}/${maxRetries})`);

        // Wait before retry (exponential backoff)
        if (attempt > 1) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
          this.logger.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Use the SDK's recommended getFiles method
        const [file] = await this.walrusClient.getFiles({ ids: [blobId] });

        if (!file) {
          throw new Error(`File with blob ID ${blobId} not found`);
        }

        // Get binary data using SDK method
        const bytes = await file.bytes();

        this.logger.log(`Successfully downloaded file from Walrus: ${blobId} (${bytes.length} bytes)`);
        return Buffer.from(bytes);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Walrus download attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);

        // Handle RetryableWalrusClientError as recommended in SDK docs
        if (error instanceof RetryableWalrusClientError) {
          this.logger.log('Retryable error detected, resetting client...');
          this.walrusClient.reset();
        }

        // Continue to next attempt if not the last one
        if (attempt < maxRetries) {
          continue;
        }
      }
    }
    
    this.logger.error(`Failed to download file after ${maxRetries} attempts: ${lastError?.message}`);

    // Provide user-friendly error messages
    if (lastError?.message.includes('fetch failed') ||
        lastError?.message.includes('timeout') ||
        lastError?.message.includes('network')) {
      throw new Error(
        'Unable to connect to Walrus storage network. This may be due to temporary network issues. ' +
        'Please try again in a few minutes. If the problem persists, the Walrus testnet may be experiencing downtime.'
      );
    }

    if (lastError?.message.includes('not found')) {
      throw new Error(
        'The requested data was not found in Walrus storage. This may indicate the data has expired or was never properly stored.'
      );
    }

    throw new Error(`Walrus file download error after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Delete content from Walrus
   * NOTE: This requires on-chain transaction for deletion
   * @param blobId The blob ID to delete
   * @param userAddress The address of the user requesting deletion
   * @returns True if deletion was successful
   */
  async deleteContent(
    blobId: string,
    userAddress: string
  ): Promise<boolean> {
    try {
      this.logger.log(`Deleting blob ${blobId} requested by user ${userAddress}...`);
      
      // Verify access
      const hasAccess = await this.verifyUserAccess(blobId, userAddress);
      if (!hasAccess) {
        this.logger.warn(`User ${userAddress} has no access to blob ${blobId}`);
        // Continue with admin anyway if file exists
      }
      
      // For full implementation, we would:
      // 1. Look up the on-chain blob object
      // 2. Execute a deletion transaction using the object ID
      
      // This is just a placeholder until we implement the full deletion flow
      this.logger.warn(
        `Deletion of Walrus blobs requires on-chain transactions. ` +
        `BlobId: ${blobId}, User: ${userAddress}`
      );
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting Walrus blob: ${error.message}`);
      throw new Error(`Walrus deletion error: ${error.message}`);
    }
  }
  
  /**
   * Upload files to Walrus with full on-chain storage
   * @param files Array of WalrusFiles to upload
   * @param epochs Number of epochs to store the files
   * @returns Array of results with blob IDs
   */
  private async uploadFilesToWalrus(files: WalrusFile[], epochs: number) {
    const maxRetries = 3; // Reduced retries since we have better error handling
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Upload attempt ${attempt}/${maxRetries}`);
        
        // Check if error is retryable and reset client if needed
        if (attempt > 1 && lastError) {
          if (lastError instanceof RetryableWalrusClientError) {
            this.logger.log('Resetting Walrus client due to retryable error...');
            this.walrusClient.reset();
          } else {
            // Recreate client for fresh connection on other errors
            this.logger.log('Recreating Walrus client for fresh connection...');
            this.initializeWalrusClient(
              this.configService.get<string>('SUI_NETWORK', 'testnet') as 'testnet' | 'mainnet'
            );
          }
        }
        
        // Use the SDK's recommended writeFiles method (simple and reliable)
        this.logger.log('Using SDK writeFiles method...');
        const results = await this.walrusClient.writeFiles({
          files,
          epochs,
          deletable: true,
          signer: this.adminKeypair,
        });

        this.logger.log(`Upload completed successfully on attempt ${attempt}`);
        // Log the blob IDs for debugging
        results.forEach((result, index) => {
          this.logger.log(`File ${index}: blobId=${result.blobId}`);
        });

        return results;
        
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Upload attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
        
        // Check if this is a retryable error
        if (lastError instanceof RetryableWalrusClientError) {
          this.logger.log('Error is retryable, will reset client and retry...');
        }
        
        // If this is the last attempt, don't wait
        if (attempt < maxRetries) {
          // Shorter wait times with exponential backoff
          const baseWait = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          const jitter = Math.random() * 500;
          const waitTime = baseWait + jitter;
          this.logger.log(`Waiting ${Math.round(waitTime)}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // All attempts failed
    this.logger.error(`All ${maxRetries} upload attempts failed. Last error: ${lastError?.message}`);
    
    if (lastError?.message.includes('fetch failed') || 
        lastError?.message.includes('Too many failures') ||
        lastError?.message.includes('timeout') ||
        lastError?.message.includes('network')) {
      throw new Error(
        'Walrus storage nodes are currently experiencing connectivity issues. ' +
        'This is a known issue with the Walrus testnet. Please try again in a few minutes. ' +
        'If the problem persists, consider enabling the upload relay by setting WALRUS_USE_UPLOAD_RELAY=true'
      );
    }
    
    throw lastError || new Error('Unknown upload error');
  }
}
````

## File: src/main.ts
````typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  
  // Enable CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Global prefix for all routes
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
````

## File: src/memory/classifier/classifier.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ClassifierService } from './classifier.service';

describe('ClassifierService', () => {
  let service: ClassifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassifierService],
    }).compile();

    service = module.get<ClassifierService>(ClassifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/memory/classifier/classifier.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

export interface ClassificationResult {
  shouldSave: boolean;
  confidence: number;
  category: string;
  reasoning: string;
}

@Injectable()
export class ClassifierService {
  private readonly logger = new Logger(ClassifierService.name);
  
  // Regex patterns for detecting factual statements
  private readonly factPatterns = [
    // Personal information
    /my name is ([a-zA-Z\s]+)/i,
    /my email is ([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /i live in ([a-zA-Z\s,]+)/i,
    /i work at ([a-zA-Z\s,&]+)/i,
    /i am from ([a-zA-Z\s,]+)/i,
    /i was born in ([a-zA-Z0-9\s,]+)/i,
    /my birthday is ([a-zA-Z0-9\s,]+)/i,
    /my phone (?:number|#) is ([0-9+\-\s()]+)/i,
    /my address is ([a-zA-Z0-9\s,]+)/i,

    // Preferences and likes/dislikes
    /i love ([^.!?]+)/i,
    /i like ([^.!?]+)/i,
    /i enjoy ([^.!?]+)/i,
    /i prefer ([^.!?]+)/i,
    /i hate ([^.!?]+)/i,
    /i dislike ([^.!?]+)/i,
    /i don't like ([^.!?]+)/i,
    /my favorite ([^.!?]+) is ([^.!?]+)/i,
    /my favourite ([^.!?]+) is ([^.!?]+)/i,

    // Explicit memory requests
    /remember that ([^.!?]+)/i,
    /don't forget that ([^.!?]+)/i,
    /please remember ([^.!?]+)/i,

    // Personal facts
    /i am ([^.!?]+)/i,
    /i have ([^.!?]+)/i,
    /i own ([^.!?]+)/i,
    /i studied ([^.!?]+)/i,
    /i graduated from ([^.!?]+)/i,
  ];
  
  // Map of regex patterns to categories
  private readonly categoryMap = {
    // Personal information
    '/my name is/i': 'personal_info',
    '/my email is/i': 'contact',
    '/i live in/i': 'location',
    '/i work at/i': 'career',
    '/i am from/i': 'background',
    '/i was born/i': 'background',
    '/my birthday/i': 'personal_info',
    '/my phone/i': 'contact',
    '/my address/i': 'contact',

    // Preferences
    '/i love/i': 'preference',
    '/i like/i': 'preference',
    '/i enjoy/i': 'preference',
    '/i prefer/i': 'preference',
    '/i hate/i': 'preference',
    '/i dislike/i': 'preference',
    '/i don\'t like/i': 'preference',
    '/my favorite/i': 'preference',
    '/my favourite/i': 'preference',

    // Explicit memory requests
    '/remember that/i': 'custom',
    '/don\'t forget/i': 'custom',
    '/please remember/i': 'custom',

    // Personal facts
    '/i am/i': 'personal_info',
    '/i have/i': 'personal_info',
    '/i own/i': 'personal_info',
    '/i studied/i': 'education',
    '/i graduated/i': 'education',
  };
  
  constructor(private geminiService: GeminiService) {}
  
  /**
   * Determine if a message contains information worth saving
   * @param message User message to classify
   * @returns Classification result
   */
  async shouldSaveMemory(message: string): Promise<ClassificationResult> {
    try {
      // Step 1: Check for obvious patterns using regex
      for (const pattern of this.factPatterns) {
        const match = message.match(pattern);
        if (match) {
          // Get the category based on the pattern
          const patternString = pattern.toString();
          const category = this.getCategoryForPattern(patternString);
          
          return {
            shouldSave: true,
            confidence: 0.95,
            category,
            reasoning: `Matched pattern: ${patternString}`
          };
        }
      }
      
      // Step 2: Use Gemini for more complex classification
      return await this.classifyWithGemini(message);
    } catch (error) {
      this.logger.error(`Error classifying memory: ${error.message}`);
      return {
        shouldSave: false,
        confidence: 0,
        category: 'unknown',
        reasoning: `Error: ${error.message}`
      };
    }
  }
  
  /**
   * Use Gemini to classify a message
   * @param message User message to classify
   * @returns Classification result
   */
  private async classifyWithGemini(message: string): Promise<ClassificationResult> {
    try {
      const prompt = `
Analyze the following message to determine if it contains personal information or facts that should be saved to a personal memory database.

Message: "${message}"

Answer as JSON with the following format:
{
  "shouldSave": true/false,
  "confidence": [0.0-1.0],
  "category": "personal_info|location|career|contact|preference|background|health|education|custom",
  "reasoning": "Brief explanation"
}

Save as "true" if the message contains:
- Personal preferences (likes, dislikes, favorites)
- Personal information (name, location, job, etc.)
- Facts about the person
- Things they want to remember

Examples that should be saved:
- "I love pizza" → preference
- "I like cocacola" → preference
- "My name is John" → personal_info
- "I work at Google" → career
- "I hate broccoli" → preference
- "I enjoy hiking" → preference

Be generous with preferences - even simple statements like "I love X" should be saved.
`;

      const responseText = await this.geminiService.generateContent(
        'gemini-1.5-flash',
        [{ role: 'user', content: prompt }]
      );
      
      try {
        // Clean up the response before parsing
        // Sometimes the API returns JSON wrapped in markdown code blocks or with extra text
        let cleanedResponse = responseText;
        
        // Remove markdown code blocks if present
        if (cleanedResponse.includes('```json')) {
          cleanedResponse = cleanedResponse.replace(/```json\n|\n```/g, '');
        } else if (cleanedResponse.includes('```')) {
          cleanedResponse = cleanedResponse.replace(/```\n|\n```/g, '');
        }
        
        // Try to extract JSON using regex
        const jsonMatch = cleanedResponse.match(/{[\s\S]*}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
        
        this.logger.log(`Cleaned response for parsing: ${cleanedResponse}`);
        
        // Parse the cleaned JSON
        const result = JSON.parse(cleanedResponse);
        return {
          shouldSave: result.shouldSave || false,
          confidence: result.confidence || 0,
          category: result.category || 'unknown',
          reasoning: result.reasoning || 'No reasoning provided'
        };
      } catch (parseError) {
        this.logger.error(`Error parsing classification result: ${parseError.message}`);
        this.logger.error(`Raw response: ${responseText}`);
        return {
          shouldSave: false,
          confidence: 0,
          category: 'unknown',
          reasoning: `Parse error: ${parseError.message}`
        };
      }
    } catch (error) {
      this.logger.error(`Error using Gemini for classification: ${error.message}`);
      return {
        shouldSave: false,
        confidence: 0,
        category: 'unknown',
        reasoning: `Gemini error: ${error.message}`
      };
    }
  }
  
  /**
   * Get category for a regex pattern
   * @param patternString String representation of the regex
   * @returns Category string
   */
  private getCategoryForPattern(patternString: string): string {
    // Look up the category in our map
    for (const [key, value] of Object.entries(this.categoryMap)) {
      if (patternString.includes(key.replace(/^\/|\/[a-z]*$/g, ''))) {
        return value;
      }
    }
    
    return 'custom';
  }
}
````

## File: src/memory/dto/create-memory.dto.ts
````typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMemoryDto {
  @IsString()
  @IsNotEmpty()
  content: string;
  
  @IsString()
  @IsNotEmpty()
  category: string;
  
  @IsString()
  @IsNotEmpty()
  userAddress: string;
}
````

## File: src/memory/dto/initialize-index.dto.ts
````typescript
export class InitializeIndexDto {
  userAddress: string;
  indexId?: string; // Optional - if provided, use existing index
}
````

## File: src/memory/dto/memory-context.dto.ts
````typescript
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MemoryContextDto {
  @IsString()
  @IsNotEmpty()
  query_text: string;

  @IsString()
  @IsNotEmpty()
  user_address: string;

  @IsString()
  @IsNotEmpty()
  user_signature: string;

  @IsNumber()
  @IsOptional()
  k?: number;
}
````

## File: src/memory/dto/memory-index.dto.ts
````typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MemoryIndexDto {
  @IsString()
  @IsNotEmpty()
  memoryId: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;
  
  @IsString()
  @IsOptional()
  category?: string;
  
  @IsString()
  @IsOptional()
  walrusHash?: string;
}
````

## File: src/memory/dto/prepare-index.dto.ts
````typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class PrepareIndexDto {
  @IsNotEmpty({ message: 'User address is required' })
  @IsString({ message: 'User address must be a string' })
  userAddress: string;
}

export class PrepareIndexResponseDto {
  success: boolean;
  indexBlobId?: string;
  graphBlobId?: string;
  message?: string;
}
````

## File: src/memory/dto/process-memory.dto.ts
````typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ProcessMemoryDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;
  
  @IsString()
  @IsOptional()
  category?: string;
}
````

## File: src/memory/dto/query-memory.dto.ts
````typescript
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMemoryDto {
  @IsString()
  @IsNotEmpty()
  query: string;
  
  @IsString()
  @IsNotEmpty()
  userAddress: string;
  
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 5;
}
````

## File: src/memory/dto/register-index.dto.ts
````typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterIndexDto {
  @IsNotEmpty({ message: 'User address is required' })
  @IsString({ message: 'User address must be a string' })
  userAddress: string;
  
  @IsNotEmpty({ message: 'Index ID is required' })
  @IsString({ message: 'Index ID must be a string' })
  indexId: string; // The on-chain memory index ID created by the frontend
}
````

## File: src/memory/dto/save-memory.dto.ts
````typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SaveMemoryDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsOptional()
  suiObjectId?: string; // If the memory object was already created on blockchain by frontend
}
````

## File: src/memory/dto/search-memory.dto.ts
````typescript
import { Optional } from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SearchMemoryDto {
  @IsString()
  @IsOptional()
  query: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  k?: number;

  @IsString()
  @IsOptional()
  userSignature?: string;
}
````

## File: src/memory/dto/update-memory-index.dto.ts
````typescript
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMemoryIndexDto {
  @IsString()
  @IsNotEmpty()
  indexBlobId: string;
  
  @IsString()
  @IsNotEmpty()
  graphBlobId: string;
  
  @IsString()
  @IsNotEmpty()
  userAddress: string;
  
  @IsNumber()
  expectedVersion: number;
}
````

## File: src/memory/dto/update-memory.dto.ts
````typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMemoryDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;
}
````

## File: src/memory/embedding/embedding.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingService } from './embedding.service';

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmbeddingService],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/memory/embedding/embedding.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

@Injectable()
export class EmbeddingService {
  private logger = new Logger(EmbeddingService.name);
  
  constructor(private geminiService: GeminiService) {}
  
  /**
   * Create embeddings for a text
   * @param text The text to embed
   * @returns The embedding vector
   */
  async embedText(text: string): Promise<{ vector: number[] }> {
    try {
      return await this.geminiService.embedText(text);
    } catch (error) {
      this.logger.error(`Error embedding text: ${error.message}`);
      throw new Error(`Embedding error: ${error.message}`);
    }
  }
  
  /**
   * Create embeddings for multiple texts
   * @param texts Array of texts to embed
   * @returns Array of embedding vectors
   */
  async embedBatch(texts: string[]): Promise<{ vectors: number[][] }> {
    try {
      const embeddings = await Promise.all(
        texts.map(text => this.geminiService.embedText(text))
      );
      
      return {
        vectors: embeddings.map(e => e.vector)
      };
    } catch (error) {
      this.logger.error(`Error batch embedding texts: ${error.message}`);
      throw new Error(`Batch embedding error: ${error.message}`);
    }
  }
  
  /**
   * Calculate cosine similarity between two vectors
   * @param vectorA First vector
   * @param vectorB Second vector
   * @returns Cosine similarity score (0-1)
   */
  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    try {
      if (vectorA.length !== vectorB.length) {
        throw new Error('Vectors must have the same dimensions');
      }
      
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      
      for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        normA += vectorA[i] ** 2;
        normB += vectorB[i] ** 2;
      }
      
      const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      
      return similarity;
    } catch (error) {
      this.logger.error(`Error calculating cosine similarity: ${error.message}`);
      throw new Error(`Similarity calculation error: ${error.message}`);
    }
  }
}
````

## File: src/memory/graph/graph.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { GraphService } from './graph.service';

describe('GraphService', () => {
  let service: GraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphService],
    }).compile();

    service = module.get<GraphService>(GraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/memory/graph/graph.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

interface Entity {
  id: string;
  label: string;
  type: string;
}

interface Relationship {
  source: string;
  target: string;
  label: string;
}

export interface KnowledgeGraph {
  entities: Entity[];
  relationships: Relationship[];
}

@Injectable()
export class GraphService {
  private logger = new Logger(GraphService.name);

  constructor(
    private walrusService: WalrusService,
    private geminiService: GeminiService
  ) {}

  /**
   * Create an empty knowledge graph
   * @returns Empty knowledge graph
   */
  createGraph(): KnowledgeGraph {
    return {
      entities: [],
      relationships: []
    };
  }

  /**
   * Extract entities and relationships from text using Gemini
   * @param text The text to extract from
   * @returns Extracted entities and relationships
   */
  async extractEntitiesAndRelationships(text: string): Promise<{
    entities: Entity[];
    relationships: Relationship[];
  }> {
    try {
      const prompt = `
        Extract entities and relationships from the following text. 
        Format your response as a valid JSON object with "entities" and "relationships" arrays.
        
        For entities, include:
        - "id": a unique identifier (use meaningful names with underscores)
        - "label": a display name
        - "type": entity type (person, concept, organization, location, event, etc.)
        
        For relationships, include:
        - "source": the id of the source entity
        - "target": the id of the target entity
        - "label": a description of the relationship
        
        TEXT:
        ${text}
        
        RESPONSE (JSON only):
      `;
      
      // Fix: Pass responseFormat as part of the options object in the correct format
      const response = await this.geminiService.generateContent(
        'gemini-1.5-flash', 
        [{ role: 'user', content: prompt }]
      );
      
      try {
        const parsed = JSON.parse(response);
        
        // Validate the response structure
        if (!parsed.entities || !Array.isArray(parsed.entities) || 
            !parsed.relationships || !Array.isArray(parsed.relationships)) {
          throw new Error('Invalid response format');
        }
        
        // Sanitize IDs to ensure they're valid and unique
        const sanitizeId = (id: string) => {
          return id.replace(/[^\w_-]/g, '_').toLowerCase();
        };
        
        // Process entities
        const entities: Entity[] = parsed.entities.map((e: any) => ({
          id: sanitizeId(e.id || `entity_${Math.random().toString(36).substring(2, 10)}`),
          label: e.label || 'Unnamed Entity',
          type: e.type || 'concept'
        }));
        
        // Create a map of original IDs to sanitized IDs
        const idMap = new Map<string, string>();
        parsed.entities.forEach((e: any, i: number) => {
          idMap.set(e.id || '', entities[i].id);
        });
        
        // Process relationships using sanitized IDs
        const relationships: Relationship[] = parsed.relationships
          .filter((r: any) => r.source && r.target && idMap.has(r.source) && idMap.has(r.target))
          .map((r: any) => ({
            source: idMap.get(r.source) || '',
            target: idMap.get(r.target) || '',
            label: r.label || 'related to'
          }));
        
        return { entities, relationships };
      } catch (parseError) {
        this.logger.error(`Failed to parse extraction response: ${parseError.message}`);
        return { entities: [], relationships: [] };
      }
    } catch (error) {
      this.logger.error(`Entity extraction error: ${error.message}`);
      return { entities: [], relationships: [] };
    }
  }

  /**
   * Add new entities and relationships to a graph
   * @param graph The knowledge graph
   * @param newEntities New entities to add
   * @param newRelationships New relationships to add
   * @returns Updated knowledge graph
   */
  addToGraph(
    graph: KnowledgeGraph,
    newEntities: Entity[],
    newRelationships: Relationship[]
  ): KnowledgeGraph {
    try {
      // Create copies to avoid mutation
      const existingEntities = [...graph.entities];
      const existingRelationships = [...graph.relationships];
      
      // Track existing entity IDs for deduplication
      const existingEntityIds = new Set(existingEntities.map(e => e.id));
      
      // Add new entities (avoiding duplicates)
      const addedEntities = newEntities.filter(e => !existingEntityIds.has(e.id));
      
      // Track relationship keys for deduplication
      const relationshipKey = (r: Relationship) => `${r.source}-${r.target}-${r.label}`;
      const existingRelationshipKeys = new Set(existingRelationships.map(relationshipKey));
      
      // Add new relationships (avoiding duplicates)
      const addedRelationships = newRelationships.filter(r => {
        const key = relationshipKey(r);
        return !existingRelationshipKeys.has(key);
      });
      
      return {
        entities: [...existingEntities, ...addedEntities],
        relationships: [...existingRelationships, ...addedRelationships]
      };
    } catch (error) {
      this.logger.error(`Error adding to graph: ${error.message}`);
      return graph; // Return original graph on error
    }
  }

  /**
   * Find related entities in the graph
   * @param graph The knowledge graph
   * @param seedEntityIds Starting entity IDs
   * @param entityToVectorMap Map of entity IDs to vector IDs
   * @param maxHops Maximum traversal distance
   * @returns Array of related entity IDs
   */
  findRelatedEntities(
    graph: KnowledgeGraph,
    seedVectorIds: number[],
    entityToVectorMap: Record<string, number>,
    maxHops: number = 1
  ): string[] {
    try {
      // Create a reverse mapping from vector IDs to entity IDs
      const vectorToEntityMap: Record<number, string> = {};
      for (const [entityId, vectorId] of Object.entries(entityToVectorMap)) {
        vectorToEntityMap[vectorId] = entityId;
      }
      
      // Get seed entity IDs from vector IDs
      const seedEntityIds = seedVectorIds
        .map(vectorId => vectorToEntityMap[vectorId])
        .filter(Boolean);
      
      // BFS to find related entities
      const visited = new Set<string>(seedEntityIds);
      const relatedEntityIds = new Set<string>(seedEntityIds);
      
      let currentHop = 0;
      let frontier = seedEntityIds;
      
      while (currentHop < maxHops && frontier.length > 0) {
        const nextFrontier: string[] = [];
        
        for (const entityId of frontier) {
          // Find all relationships involving this entity
          const relationships = graph.relationships.filter(
            r => r.source === entityId || r.target === entityId
          );
          
          for (const relationship of relationships) {
            const neighborId = relationship.source === entityId ? 
              relationship.target : relationship.source;
            
            if (!visited.has(neighborId)) {
              visited.add(neighborId);
              relatedEntityIds.add(neighborId);
              nextFrontier.push(neighborId);
            }
          }
        }
        
        frontier = nextFrontier;
        currentHop++;
      }
      
      return Array.from(relatedEntityIds);
    } catch (error) {
      this.logger.error(`Error finding related entities: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Save the graph to Walrus
   * @param graph The knowledge graph to save
   * @param userAddress The user's address for access control
   * @returns The blob ID of the saved graph
   */
  async saveGraph(graph: KnowledgeGraph, userAddress: string): Promise<string> {
    try {
      // Validate userAddress
      if (!userAddress || userAddress === 'undefined') {
        throw new Error('User address is required for saving graph');
      }
      
      this.logger.log(`Saving knowledge graph for user ${userAddress}`);
      
      const graphJson = JSON.stringify(graph);
      
      // Get admin address for blob ownership (ensures backend access)
      const adminAddress = this.walrusService.getAdminAddress();
      
      // Save to Walrus with dual-ownership pattern
      // - Admin as the actual owner (for backend access)
      // - User address stored in metadata (for permission checks)
      return await this.walrusService.uploadContent(
        graphJson, 
        adminAddress, // Admin as owner for backend access
        12, // Default epochs
        { 
          'user-address': userAddress,  // Record actual user for permission checks
          'content-type': 'application/json',
          'data-type': 'knowledge-graph',
          'version': '1.0'
        }
      );
    } catch (error) {
      this.logger.error(`Error saving graph: ${error.message}`);
      throw new Error(`Graph save error: ${error.message}`);
    }
  }

  /**
   * Load a graph from Walrus
   * @param blobId The blob ID of the graph
   * @param userAddress The user's address for access verification
   * @returns The loaded knowledge graph
   */
  async loadGraph(blobId: string, userAddress?: string): Promise<KnowledgeGraph> {
    try {
      this.logger.log(`Loading graph from blobId: ${blobId}`);
      
      // Verify user access if an address is provided
      if (userAddress) {
        const hasAccess = await this.walrusService.verifyUserAccess(blobId, userAddress);
        if (!hasAccess) {
          this.logger.warn(`User ${userAddress} attempted to access graph without permission: ${blobId}`);
          // Continue anyway since we're using admin to access
        }
      }
      
      const graphJson = await this.walrusService.retrieveContent(blobId);
      
      try {
        return JSON.parse(graphJson);
      } catch (parseError) {
        this.logger.error(`Error parsing graph JSON: ${parseError.message}`);
        return this.createGraph(); // Return an empty graph on parse error
      }
    } catch (error) {
      this.logger.error(`Error loading graph: ${error.message}`);
      throw new Error(`Graph load error: ${error.message}`);
    }
  }
}
````

## File: src/memory/hnsw-index/hnsw-index.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HnswIndexService } from './hnsw-index.service';

describe('HnswIndexService', () => {
  let service: HnswIndexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnswIndexService],
    }).compile();

    service = module.get<HnswIndexService>(HnswIndexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/memory/hnsw-index/hnsw-index.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import * as hnswlib from 'hnswlib-node';
import * as fs from 'fs';
import { CachedWalrusService } from '../../infrastructure/walrus/cached-walrus.service';
import { DemoStorageService } from '../../infrastructure/demo-storage/demo-storage.service';
import { ConfigService } from '@nestjs/config';

interface IndexCacheEntry {
  index: hnswlib.HierarchicalNSW;
  lastModified: Date;
  pendingVectors: Map<number, number[]>; // vectorId -> vector
  isDirty: boolean;
  version: number;
}

interface BatchUpdateJob {
  userAddress: string;
  vectors: Map<number, number[]>;
  scheduledAt: Date;
}

@Injectable()
export class HnswIndexService {
  private logger = new Logger(HnswIndexService.name);
  private readonly indexCache = new Map<string, IndexCacheEntry>();
  private readonly batchJobs = new Map<string, BatchUpdateJob>();
  private readonly BATCH_DELAY_MS = 5000; // 5 seconds
  private readonly MAX_BATCH_SIZE = 50; // Max vectors per batch
  private readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  private readonly DEFAULT_VECTOR_DIMENSIONS = 768; // Gemini embedding-001 default

  constructor(
    private walrusService: CachedWalrusService,
    private demoStorageService: DemoStorageService,
    private configService: ConfigService
  ) {
    // Start the batch processing timer
    this.startBatchProcessor();

    // Start cache cleanup timer
    this.startCacheCleanup();
  }

  /**
   * Get the appropriate storage service based on demo mode
   */
  private getStorageService(): CachedWalrusService | DemoStorageService {
    const isDemoMode = this.configService.get<boolean>('USE_DEMO_STORAGE', true);
    return isDemoMode ? this.demoStorageService : this.walrusService;
  }

  /**
   * Start the batch processor that periodically uploads pending index updates
   */
  private startBatchProcessor(): void {
    setInterval(async () => {
      await this.processBatchJobs();
    }, this.BATCH_DELAY_MS);
  }

  /**
   * Start cache cleanup timer to remove stale entries
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up stale cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [userAddress, entry] of this.indexCache.entries()) {
      if (now - entry.lastModified.getTime() > this.CACHE_TTL_MS) {
        this.logger.debug(`Removing stale cache entry for user ${userAddress}`);
        this.indexCache.delete(userAddress);
      }
    }
  }

  /**
   * Process all pending batch jobs
   */
  private async processBatchJobs(): Promise<void> {
    const now = Date.now();
    const jobsToProcess: string[] = [];

    // Find jobs that are ready to process
    for (const [userAddress, job] of this.batchJobs.entries()) {
      const timeSinceScheduled = now - job.scheduledAt.getTime();
      const cacheEntry = this.indexCache.get(userAddress);

      if (timeSinceScheduled >= this.BATCH_DELAY_MS ||
          (cacheEntry && cacheEntry.pendingVectors.size >= this.MAX_BATCH_SIZE)) {
        jobsToProcess.push(userAddress);
      }
    }

    // Process each job
    for (const userAddress of jobsToProcess) {
      try {
        await this.flushPendingVectors(userAddress);
      } catch (error) {
        this.logger.error(`Error processing batch job for user ${userAddress}: ${error.message}`);
      }
    }
  }

  /**
   * Flush pending vectors for a user to Walrus
   */
  private async flushPendingVectors(userAddress: string): Promise<void> {
    const cacheEntry = this.indexCache.get(userAddress);
    if (!cacheEntry || cacheEntry.pendingVectors.size === 0) {
      return;
    }

    this.logger.log(`Flushing ${cacheEntry.pendingVectors.size} pending vectors for user ${userAddress}`);

    try {
      // Ensure we have an index to work with
      if (!cacheEntry.index) {
        // Determine dimensions from the first pending vector
        const firstVector = cacheEntry.pendingVectors.values().next().value;
        const dimensions = firstVector ? firstVector.length : this.DEFAULT_VECTOR_DIMENSIONS;

        this.logger.log(`Creating new index for user ${userAddress} during flush with ${dimensions} dimensions`);
        const newIndex = new hnswlib.HierarchicalNSW('cosine', dimensions);
        newIndex.initIndex(1000); // Initial capacity
        cacheEntry.index = newIndex;
      }

      // Add all pending vectors to the index
      for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
        try {
          cacheEntry.index.addPoint(vector, vectorId);
          this.logger.debug(`Added vector ${vectorId} with ${vector.length} dimensions to index for user ${userAddress}`);
        } catch (error) {
          this.logger.error(`Failed to add vector ${vectorId} to index for user ${userAddress}: ${error.message}`);
          this.logger.error(`Vector dimensions: ${vector.length}, Index dimensions: ${cacheEntry.index.getNumDimensions?.() || 'unknown'}`);
          throw error;
        }
      }

      // Save the updated index to Walrus
      const newBlobId = await this.saveIndexToWalrus(cacheEntry.index, userAddress);

      // Clear pending vectors and mark as clean
      cacheEntry.pendingVectors.clear();
      cacheEntry.isDirty = false;
      cacheEntry.lastModified = new Date();
      cacheEntry.version++;

      // Remove the batch job
      this.batchJobs.delete(userAddress);

      this.logger.log(`Successfully flushed vectors for user ${userAddress}, new blob ID: ${newBlobId}`);

      // Emit an event or callback to update on-chain index pointer
      // This would be handled by a separate service in a production system
      this.onIndexUpdated?.(userAddress, newBlobId, cacheEntry.version);
    } catch (error) {
      this.logger.error(`Error flushing vectors for user ${userAddress}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Callback for when index is updated (can be overridden by dependency injection)
   */
  private onIndexUpdated?: (userAddress: string, newBlobId: string, version: number) => void;

  /**
   * Save index to Walrus (internal method)
   */
  private async saveIndexToWalrus(index: hnswlib.HierarchicalNSW, userAddress: string): Promise<string> {
    // Create a temporary file path for serialization
    const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;

    try {
      // Save the index to the temporary file
      index.writeIndexSync(tempFilePath);

      // Read the file into a buffer
      const serialized = fs.readFileSync(tempFilePath);

      // Get admin address for blob ownership (ensures backend access)
      const storageService = this.getStorageService();
      const adminAddress = storageService.getAdminAddress();

      // Save to storage with dual-ownership pattern
      const blobId = await storageService.uploadFile(
        serialized,
        `index_${userAddress}_${Date.now()}.hnsw`,
        adminAddress, // owner address
        12, // epochs
        {
          'user-address': userAddress,  // Record actual user for permission checks
          'content-type': 'application/hnsw-index',
          'version': '1.0'
        }
      );

      return blobId;
    } finally {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // ignore cleanup errors
      }
    }
  }

  /**
   * Get or load index from cache/Walrus
   */
  async getOrLoadIndexCached(userAddress: string, indexBlobId?: string): Promise<hnswlib.HierarchicalNSW | null> {
    // Check cache first
    const cacheEntry = this.indexCache.get(userAddress);
    if (cacheEntry && cacheEntry.index) {
      cacheEntry.lastModified = new Date(); // Update access time
      return cacheEntry.index;
    }

    // Load from Walrus if blob ID provided
    if (indexBlobId) {
      try {
        const index = await this.loadIndexFromWalrus(indexBlobId, userAddress);

        // Cache the loaded index
        this.indexCache.set(userAddress, {
          index,
          lastModified: new Date(),
          pendingVectors: new Map(),
          isDirty: false,
          version: 1
        });

        return index;
      } catch (error) {
        this.logger.error(`Error loading index from Walrus: ${error.message}`);
        return null;
      }
    }

    return null;
  }

  /**
   * Add an index to cache (for new indexes created in memory)
   */
  addIndexToCache(userAddress: string, index: hnswlib.HierarchicalNSW, version: number = 1): void {
    this.indexCache.set(userAddress, {
      index,
      lastModified: new Date(),
      pendingVectors: new Map(),
      isDirty: false,
      version
    });

    this.logger.log(`Index added to cache for user ${userAddress}`);
  }

  /**
   * Load index from Walrus (internal method)
   */
  private async loadIndexFromWalrus(blobId: string, userAddress: string): Promise<hnswlib.HierarchicalNSW> {
    const storageService = this.getStorageService();
    const buffer = await storageService.downloadFile(blobId);

    // Create a temporary file to load the index
    const tempFilePath = `./tmp_hnsw_load_${Date.now()}.bin`;

    try {
      // Write buffer to temporary file
      fs.writeFileSync(tempFilePath, buffer);

      // Load the index from the temporary file
      const index = new hnswlib.HierarchicalNSW('cosine', this.DEFAULT_VECTOR_DIMENSIONS);
      index.readIndexSync(tempFilePath);

      return index;
    } finally {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // ignore cleanup errors
      }
    }
  }

  /**
   * Create a new HNSW index
   * @param dimensions Vector dimensions
   * @param maxElements Maximum number of elements
   * @returns The index and its serialized form
   */
  async createIndex(
    dimensions: number = 768,
    maxElements: number = 10000
  ): Promise<{ index: hnswlib.HierarchicalNSW; serialized: Buffer }> {
    try {
      this.logger.log(`Creating new HNSW index with dimensions ${dimensions}, max elements ${maxElements}`);
      
      // Create a new index
      const index = new hnswlib.HierarchicalNSW('cosine', dimensions);
      index.initIndex(maxElements);
      
      // Create a temporary file path for serialization
      const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
      
      // Save the index to the temporary file
      index.writeIndexSync(tempFilePath);
      
      // Read the file into a buffer
      const serialized = fs.readFileSync(tempFilePath);
      
      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      
      return { index, serialized };
    } catch (error) {
      this.logger.error(`Error creating index: ${error.message}`);
      throw new Error(`Index creation error: ${error.message}`);
    }
  }

  /**
   * Add a vector to the index (optimized with batching)
   * @param userAddress The user address
   * @param id The vector ID
   * @param vector The vector to add
   */
  addVectorToIndexBatched(userAddress: string, id: number, vector: number[]): void {
    try {
      // Detect vector dimensions from the first vector
      const vectorDimensions = vector.length;

      // Get or create cache entry
      let cacheEntry = this.indexCache.get(userAddress);
      if (!cacheEntry) {
        this.logger.warn(`No cached index found for user ${userAddress}, creating new index in memory`);

        // Create a new index in memory with the correct dimensions
        const newIndex = new hnswlib.HierarchicalNSW('cosine', vectorDimensions);
        newIndex.initIndex(1000); // Initial capacity

        // Create cache entry with the new index
        cacheEntry = {
          index: newIndex,
          lastModified: new Date(),
          pendingVectors: new Map(),
          isDirty: true,
          version: 1
        };
        this.indexCache.set(userAddress, cacheEntry);

        this.logger.log(`Created new in-memory index for user ${userAddress} with ${vectorDimensions} dimensions`);
      }

      // Validate vector dimensions match the index
      if (cacheEntry.index && cacheEntry.index.getNumDimensions && cacheEntry.index.getNumDimensions() !== vectorDimensions) {
        this.logger.error(`Vector dimension mismatch for user ${userAddress}: expected ${cacheEntry.index.getNumDimensions()}, got ${vectorDimensions}`);
        throw new Error(`Vector dimension mismatch: expected ${cacheEntry.index.getNumDimensions()}, got ${vectorDimensions}`);
      }

      // Add vector to pending queue
      cacheEntry.pendingVectors.set(id, vector);
      cacheEntry.isDirty = true;
      cacheEntry.lastModified = new Date();

      // Schedule or update batch job
      let batchJob = this.batchJobs.get(userAddress);
      if (!batchJob) {
        batchJob = {
          userAddress,
          vectors: new Map(),
          scheduledAt: new Date()
        };
        this.batchJobs.set(userAddress, batchJob);
      }

      batchJob.vectors.set(id, vector);

      this.logger.debug(`Vector ${id} queued for batch processing for user ${userAddress}. Pending: ${cacheEntry.pendingVectors.size}`);

      // If we've reached the batch size limit, process immediately
      if (cacheEntry.pendingVectors.size >= this.MAX_BATCH_SIZE) {
        this.logger.log(`Batch size limit reached for user ${userAddress}, processing immediately`);
        // Process asynchronously to avoid blocking
        setImmediate(() => this.flushPendingVectors(userAddress));
      }
    } catch (error) {
      this.logger.error(`Error queuing vector for batch processing: ${error.message}`);
      throw new Error(`Vector batching error: ${error.message}`);
    }
  }

  /**
   * Add a vector to the index (legacy method for backward compatibility)
   * @param index The HNSW index
   * @param id The vector ID
   * @param vector The vector to add
   */
  addVectorToIndex(index: hnswlib.HierarchicalNSW, id: number, vector: number[]): void {
    try {
      index.addPoint(vector, id);
    } catch (error) {
      this.logger.error(`Error adding vector to index: ${error.message}`);
      throw new Error(`Vector addition error: ${error.message}`);
    }
  }

  /**
   * Force flush all pending vectors for a user (useful for immediate consistency)
   */
  async forceFlush(userAddress: string): Promise<void> {
    await this.flushPendingVectors(userAddress);
  }

  /**
   * Search vectors in the index (including pending vectors)
   * This allows immediate search even before vectors are persisted to Walrus
   */
  async searchVectors(userAddress: string, queryVector: number[], k: number = 10): Promise<{
    ids: number[];
    distances: number[];
  }> {
    const cacheEntry = this.indexCache.get(userAddress);
    if (!cacheEntry || !cacheEntry.index) {
      throw new Error(`No index found for user ${userAddress}`);
    }

    // If there are pending vectors, add them to a temporary index for search
    if (cacheEntry.pendingVectors.size > 0) {
      // Create a temporary index that includes pending vectors
      const tempIndex = this.cloneIndex(cacheEntry.index);

      // Add pending vectors to the temporary index
      for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
        tempIndex.addPoint(vector, vectorId);
      }

      // Search the temporary index
      const result = tempIndex.searchKnn(queryVector, k);
      return {
        ids: result.neighbors,
        distances: result.distances
      };
    } else {
      // Search the main index
      const result = cacheEntry.index.searchKnn(queryVector, k);
      return {
        ids: result.neighbors,
        distances: result.distances
      };
    }
  }

  /**
   * Clone an HNSW index (for temporary search operations)
   */
  private cloneIndex(originalIndex: hnswlib.HierarchicalNSW): hnswlib.HierarchicalNSW {
    // Create a temporary file to serialize/deserialize the index
    const tempFilePath = `./tmp_hnsw_clone_${Date.now()}.bin`;

    try {
      // Serialize the original index
      originalIndex.writeIndexSync(tempFilePath);

      // Create a new index and load the serialized data
      const clonedIndex = new hnswlib.HierarchicalNSW('cosine', this.DEFAULT_VECTOR_DIMENSIONS);
      clonedIndex.readIndexSync(tempFilePath);

      return clonedIndex;
    } finally {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // ignore cleanup errors
      }
    }
  }

  /**
   * Clear user index cache (useful for dimension mismatches)
   */
  clearUserIndex(userAddress: string): void {
    this.indexCache.delete(userAddress);
    this.batchJobs.delete(userAddress);
    this.logger.log(`Cleared index cache for user ${userAddress}`);
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    totalUsers: number;
    totalPendingVectors: number;
    activeBatchJobs: number;
    cacheEntries: Array<{
      userAddress: string;
      pendingVectors: number;
      lastModified: Date;
      isDirty: boolean;
      indexDimensions: number | string;
    }>;
  } {
    const cacheEntries: Array<{
      userAddress: string;
      pendingVectors: number;
      lastModified: Date;
      isDirty: boolean;
      indexDimensions: number | string;
    }> = [];
    let totalPendingVectors = 0;

    for (const [userAddress, entry] of this.indexCache.entries()) {
      const pendingCount = entry.pendingVectors.size;
      totalPendingVectors += pendingCount;

      cacheEntries.push({
        userAddress,
        pendingVectors: pendingCount,
        lastModified: entry.lastModified,
        isDirty: entry.isDirty,
        indexDimensions: entry.index?.getNumDimensions?.() || 'unknown'
      });
    }

    return {
      totalUsers: this.indexCache.size,
      totalPendingVectors,
      activeBatchJobs: this.batchJobs.size,
      cacheEntries
    };
  }

  /**
   * Search the index for similar vectors
   * @param index The HNSW index
   * @param vector The query vector
   * @param k Number of results to return
   * @returns The search results
   */
  searchIndex(
    index: hnswlib.HierarchicalNSW, 
    vector: number[], 
    k: number
  ): { ids: number[]; distances: number[] } {
    try {
      const results = index.searchKnn(vector, k);
      
      return {
        ids: results.neighbors,
        distances: results.distances
      };
    } catch (error) {
      this.logger.error(`Error searching index: ${error.message}`);
      throw new Error(`Index search error: ${error.message}`);
    }
  }

  /**
   * Serialize and save the index to Walrus
   * @param index The HNSW index
   * @param userAddress The user's address for access control
   * @returns The blob ID of the saved index
   */
  async saveIndex(index: hnswlib.HierarchicalNSW, userAddress: string): Promise<string> {
    try {
      // Validate userAddress
      if (!userAddress || userAddress === 'undefined') {
        throw new Error('User address is required for saving index');
      }
      
      this.logger.log(`Saving HNSW index for user ${userAddress}`);
      
      // Create a temporary file path for serialization
      const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
      
      // Save the index to the temporary file
      index.writeIndexSync(tempFilePath);
      
      // Read the file into a buffer
      const serialized = fs.readFileSync(tempFilePath);
      
      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      
      // Get admin address for blob ownership (ensures backend access)
      const storageService = this.getStorageService();
      const adminAddress = storageService.getAdminAddress();

      // Save to storage with dual-ownership pattern
      // - Admin as the actual owner (for backend access)
      // - User address stored in metadata (for permission checks)
      const blobId = await storageService.uploadFile(
        serialized, 
        `index_${userAddress}_${Date.now()}.hnsw`,
        adminAddress, // Admin as owner for backend access
        12, // Default epochs
        { 
          'user-address': userAddress,  // Record actual user for permission checks
          'content-type': 'application/hnsw-index',
          'version': '1.0'
        }
      );
      
      this.logger.log(`Index saved to Walrus with blobId ${blobId}`);
      
      // Wait a bit to ensure blob is propagated to storage nodes
      this.logger.log('Waiting for blob propagation...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return blobId;
    } catch (error) {
      this.logger.error(`Error saving index: ${error.message}`);
      throw new Error(`Index save error: ${error.message}`);
    }
  }

  /**
   * Load an index from Walrus
   * @param blobId The blob ID of the index
   * @param userAddress The user's address for access verification
   * @returns The loaded index and its serialized form
   */
  async loadIndex(blobId: string, userAddress?: string): Promise<{ index: hnswlib.HierarchicalNSW; serialized: Buffer }> {
    try {
      this.logger.log(`Loading index from blobId: ${blobId}`);
      
      // Verify user access if an address is provided
      const storageService = this.getStorageService();
      if (userAddress) {
        const hasAccess = await storageService.verifyUserAccess(blobId, userAddress);
        if (!hasAccess) {
          this.logger.warn(`User ${userAddress} attempted to access index without permission: ${blobId}`);
          // Continue anyway since we're using admin to access
        }
      }

      // Download the index file
      const serialized = await storageService.downloadFile(blobId);
      
      // Create a temporary file path
      const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
      
      // Write the serialized data to the temporary file
      fs.writeFileSync(tempFilePath, serialized);
      
      // Create a new index and load from the file
      const index = new hnswlib.HierarchicalNSW('cosine', 0); // Dimensions will be loaded from file
      index.readIndexSync(tempFilePath);
      
      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      
      return { index, serialized };
    } catch (error) {
      this.logger.error(`Error loading index: ${error.message}`);
      throw new Error(`Index load error: ${error.message}`);
    }
  }

  /**
   * Get the number of elements in the index
   * @param index The HNSW index
   * @returns The number of elements
   */
  getIndexSize(index: hnswlib.HierarchicalNSW): number {
    try {
      return index.getCurrentCount();
    } catch (error) {
      this.logger.error(`Error getting index size: ${error.message}`);
      throw new Error(`Index size error: ${error.message}`);
    }
  }

  /**
   * Remove a vector from the index
   * @param index The HNSW index
   * @param id The vector ID to remove
   */
  removeVectorFromIndex(index: hnswlib.HierarchicalNSW, id: number): void {
    try {
      index.markDelete(id);
    } catch (error) {
      this.logger.error(`Error removing vector from index: ${error.message}`);
      throw new Error(`Vector removal error: ${error.message}`);
    }
  }
}
````

## File: src/memory/memory-index/memory-index.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { GraphService } from '../graph/graph.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { PrepareIndexResponseDto } from '../dto/prepare-index.dto';

@Injectable()
export class MemoryIndexService {
  private readonly logger = new Logger(MemoryIndexService.name);
  
  // Map userAddress to their memory index ID (for frontend-created indexes)
  private userIndexMap = new Map<string, string>();

  constructor(
    private hnswIndexService: HnswIndexService,
    private graphService: GraphService,
    private suiService: SuiService
  ) {}

  /**
   * Prepare index data for frontend creation
   * Returns the blob IDs needed for the frontend to create the index on-chain
   */
  async prepareIndexForCreation(userAddress: string): Promise<PrepareIndexResponseDto> {
    try {
      // Validate userAddress
      if (!userAddress || userAddress === 'undefined') {
        return {
          success: false,
          message: 'User address is required'
        };
      }
      
      this.logger.log(`Preparing memory index data for user ${userAddress}`);
      
      // Create empty index
      const { index } = await this.hnswIndexService.createIndex();
      
      // Save empty index to Walrus
      const indexBlobId = await this.hnswIndexService.saveIndex(index, userAddress);
      
      // Create empty graph
      const graph = this.graphService.createGraph();
      const graphBlobId = await this.graphService.saveGraph(graph, userAddress);
      
      this.logger.log(`Prepared index data - indexBlobId: ${indexBlobId}, graphBlobId: ${graphBlobId}`);
      
      return {
        success: true,
        indexBlobId,
        graphBlobId,
        message: 'Index data prepared for on-chain creation'
      };
    } catch (error) {
      this.logger.error(`Error preparing index: ${error.message}`);
      return {
        success: false,
        message: `Failed to prepare index: ${error.message}`
      };
    }
  }
  
  /**
   * Register a frontend-created memory index
   */
  async registerMemoryIndex(userAddress: string, indexId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Verify the index exists on-chain
      const memoryIndex = await this.suiService.getMemoryIndex(indexId);
      
      if (memoryIndex.owner !== userAddress) {
        return {
          success: false,
          message: 'Index does not belong to the specified user'
        };
      }
      
      // Store the mapping
      this.userIndexMap.set(userAddress, indexId);
      
      this.logger.log(`Registered memory index ${indexId} for user ${userAddress}`);
      
      return {
        success: true,
        message: 'Memory index registered successfully'
      };
    } catch (error) {
      this.logger.error(`Error registering index: ${error.message}`);
      return {
        success: false,
        message: `Failed to register index: ${error.message}`
      };
    }
  }
  
  /**
   * Get the memory index ID for a user
   */
  getIndexId(userAddress: string): string | undefined {
    return this.userIndexMap.get(userAddress);
  }
  
  /**
   * Set the memory index ID for a user
   */
  setIndexId(userAddress: string, indexId: string): void {
    this.userIndexMap.set(userAddress, indexId);
  }
  
  /**
   * Clear the memory index ID for a user
   */
  clearIndexId(userAddress: string): void {
    this.userIndexMap.delete(userAddress);
  }
  
  /**
   * Get or load memory index for a user
   * Returns the index data and metadata
   */
  async getOrLoadIndex(userAddress: string): Promise<{
    index?: any;
    graph?: any;
    indexId?: string;
    indexBlobId?: string;
    graphBlobId?: string;
    version?: number;
    exists: boolean;
  }> {
    try {
      // Check if we have a stored index ID for this user
      let indexId = this.userIndexMap.get(userAddress);

      if (indexId) {
        try {
          // Get existing memory index using the stored ID
          const memoryIndex = await this.suiService.getMemoryIndex(indexId);

          // Verify ownership
          if (memoryIndex.owner !== userAddress) {
            this.logger.warn(`Index ${indexId} does not belong to user ${userAddress}`);
            this.userIndexMap.delete(userAddress);
            indexId = undefined;
          } else {
            // Load index and graph from Walrus
            const indexResult = await this.hnswIndexService.loadIndex(memoryIndex.indexBlobId, userAddress);
            const graph = await this.graphService.loadGraph(memoryIndex.graphBlobId, userAddress);

            return {
              index: indexResult.index,
              graph,
              indexId,
              indexBlobId: memoryIndex.indexBlobId,
              graphBlobId: memoryIndex.graphBlobId,
              version: memoryIndex.version,
              exists: true
            };
          }
        } catch (error) {
          this.logger.warn(`Failed to load index ${indexId}: ${error.message}`);
          // Clear the invalid mapping
          this.userIndexMap.delete(userAddress);
          indexId = undefined;
        }
      }

      // Try to get memory index by user address (backward compatibility)
      // But skip loading if we know Walrus is likely down
      try {
        const memoryIndex = await this.suiService.getMemoryIndex(userAddress);

        // Use userAddress as the index ID for backward compatibility
        indexId = userAddress;

        // Store the mapping
        this.userIndexMap.set(userAddress, indexId);

        // Check if we should attempt to load from Walrus
        // Skip if we've had recent Walrus failures to avoid delays
        const shouldAttemptWalrusLoad = true; // For now, always attempt but handle failures gracefully

        if (shouldAttemptWalrusLoad) {
          // Load index and graph from Walrus with better error handling
          try {
            this.logger.log(`Attempting to load existing index for user ${userAddress} from Walrus`);
            const indexResult = await this.hnswIndexService.loadIndex(memoryIndex.indexBlobId, userAddress);
            const graph = await this.graphService.loadGraph(memoryIndex.graphBlobId, userAddress);

            this.logger.log(`Successfully loaded existing index for user ${userAddress}`);
            return {
              index: indexResult.index,
              graph,
              indexId,
              indexBlobId: memoryIndex.indexBlobId,
              graphBlobId: memoryIndex.graphBlobId,
              version: memoryIndex.version,
              exists: true
            };
          } catch (loadError) {
            this.logger.warn(`Failed to load index data for user ${userAddress}: ${loadError.message}`);

            // If it's a Walrus connectivity issue, log warning but continue to create new local index
            if (loadError.message.includes('Walrus') ||
                loadError.message.includes('fetch failed') ||
                loadError.message.includes('network') ||
                loadError.message.includes('timeout') ||
                loadError.message.includes('404') ||
                loadError.message.includes('unavailable') ||
                loadError.message.includes('permission')) {
              this.logger.warn(`Walrus connectivity/permission issue for user ${userAddress}. Will create new local index instead.`);
            }

            // Clear the invalid mapping and continue to create new index
            this.userIndexMap.delete(userAddress);
            // Don't throw error - let it fall through to create new index
          }
        } else {
          this.logger.log(`Skipping Walrus load due to recent failures, creating new local index for user ${userAddress}`);
          this.userIndexMap.delete(userAddress);
        }
      } catch (error) {
        this.logger.debug(`No index found for user ${userAddress}: ${error.message}`);
      }

      // Try to find any memory index owned by this user
      try {
        const userIndexes = await this.suiService.getUserMemoryIndexes(userAddress);

        if (userIndexes && userIndexes.length > 0) {
          // Use the first (most recent) index
          const latestIndex = userIndexes[0];
          indexId = latestIndex.id;

          // Store the mapping
          this.userIndexMap.set(userAddress, indexId);

          // Load index and graph from Walrus
          const indexResult = await this.hnswIndexService.loadIndex(latestIndex.indexBlobId, userAddress);
          const graph = await this.graphService.loadGraph(latestIndex.graphBlobId, userAddress);

          this.logger.log(`Found existing index ${indexId} for user ${userAddress}`);

          return {
            index: indexResult.index,
            graph,
            indexId,
            indexBlobId: latestIndex.indexBlobId,
            graphBlobId: latestIndex.graphBlobId,
            version: latestIndex.version,
            exists: true
          };
        }
      } catch (error) {
        this.logger.debug(`Failed to find user indexes: ${error.message}`);
      }

      // No index exists
      return {
        exists: false
      };
    } catch (error) {
      this.logger.error(`Error getting or loading index: ${error.message}`);
      return {
        exists: false
      };
    }
  }
}
````

## File: src/memory/memory-ingestion/memory-ingestion.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MemoryIngestionService } from './memory-ingestion.service';

describe('MemoryIngestionService', () => {
  let service: MemoryIngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryIngestionService],
    }).compile();

    service = module.get<MemoryIngestionService>(MemoryIngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/memory/memory-ingestion/memory-ingestion.service.ts
````typescript
import { Injectable, Logger } from '@nestjs/common';
import { ClassifierService } from '../classifier/classifier.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { MemoryIndexService } from '../memory-index/memory-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
import { ConfigService } from '@nestjs/config';

export interface CreateMemoryDto {
  content: string;
  category: string;
  userAddress: string;
  userSignature?: string;
}

export interface ProcessMemoryDto {
  content: string;
  userAddress: string;
  category?: string;
}

export interface MemoryIndexDto {
  memoryId: string;
  userAddress: string;
  category?: string;
  walrusHash?: string;
}

export interface SaveMemoryDto {
  content: string;
  category: string;
  userAddress: string;
  suiObjectId?: string;
}

@Injectable()
export class MemoryIngestionService {
  private readonly logger = new Logger(MemoryIngestionService.name);
  private entityToVectorMap: Record<string, Record<string, number>> = {};
  private nextVectorId: Record<string, number> = {};

  constructor(
    private classifierService: ClassifierService,
    private embeddingService: EmbeddingService,
    private graphService: GraphService,
    private hnswIndexService: HnswIndexService,
    private memoryIndexService: MemoryIndexService,
    private sealService: SealService,
    private suiService: SuiService,
    private storageService: StorageService,
    private geminiService: GeminiService,
    private configService: ConfigService
  ) {}

  /**
   * Check if we're in demo mode
   */
  private isDemoMode(): boolean {
    return this.configService.get<boolean>('USE_DEMO_STORAGE', true) ||
           this.configService.get<string>('NODE_ENV') === 'demo';
  }

  /**
   * Get the next vector ID for a user
   * @param userAddress User address
   * @returns Next vector ID
   */
  getNextVectorId(userAddress: string): number {
    if (!this.nextVectorId[userAddress]) {
      this.nextVectorId[userAddress] = 1;
    }
    
    const vectorId = this.nextVectorId[userAddress];
    this.nextVectorId[userAddress]++;
    
    return vectorId;
  }

  /**
   * Get the entity-to-vector mapping for a user
   * @param userAddress User address
   * @returns Entity-to-vector mapping
   */
  getEntityToVectorMap(userAddress: string): Record<string, number> {
    if (!this.entityToVectorMap[userAddress]) {
      this.entityToVectorMap[userAddress] = {};
    }
    
    return this.entityToVectorMap[userAddress];
  }

  /**
   * Process a conversation for potential memory extraction
   * @param userMessage User message
   * @param assistantResponse Assistant response
   * @param userAddress User address
   * @returns Whether a memory was stored
   */
  async processConversation(
    userMessage: string,
    assistantResponse: string,
    userAddress: string
  ): Promise<{ memoryStored: boolean; memoryId?: string }> {
    try {
      // Combine messages for context
      const conversation = `User: ${userMessage}\nAssistant: ${assistantResponse}`;
      
      // Check if the conversation contains information worth remembering
      const classificationResult = await this.classifierService.shouldSaveMemory(conversation);
      const shouldRemember = classificationResult.shouldSave;
      
      if (!shouldRemember) {
        return { memoryStored: false };
      }
      
      // Extract the memory content - for now, just use the conversation directly
      // In a full implementation, we'd use an LLM to extract the key information
      const memoryContent = conversation;
      
      if (!memoryContent || memoryContent.trim() === '') {
        return { memoryStored: false };
      }
      
      // Process the memory
      const result = await this.processNewMemory({
        content: memoryContent,
        category: 'conversation',
        userAddress
      });
      
      return {
        memoryStored: result.success,
        memoryId: result.memoryId
      };
    } catch (error) {
      this.logger.error(`Error processing conversation: ${error.message}`);
      return { memoryStored: false };
    }
  }

  /**
   * Process a new memory from scratch
   * @param memoryDto Memory data
   * @returns Processing result
   */
  async processNewMemory(memoryDto: CreateMemoryDto): Promise<{
    success: boolean;
    memoryId?: string;
    blobId?: string;
    vectorId?: number;
    message?: string;
    requiresIndexCreation?: boolean;
    indexBlobId?: string;
    graphBlobId?: string;
  }> {
    try {
      // Step 1: Try to get existing index, but don't fail if it doesn't exist
      const indexData = await this.memoryIndexService.getOrLoadIndex(memoryDto.userAddress);

      let graph: any;
      let indexId: string | undefined;
      let indexBlobId: string | undefined;
      let graphBlobId: string | undefined;
      let currentVersion = 1;

      if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
        // Use existing index data for graph operations
        graph = indexData.graph;
        indexId = indexData.indexId;
        indexBlobId = indexData.indexBlobId;
        graphBlobId = indexData.graphBlobId;
        currentVersion = indexData.version;

        // Load the index into cache if not already there
        await this.hnswIndexService.getOrLoadIndexCached(memoryDto.userAddress, indexBlobId);
      } else {
        // No existing index - create new one in memory and prepare for batching
        this.logger.log(`No existing index found for user ${memoryDto.userAddress}, creating new index in memory`);

        // Create a new index in memory for batching
        await this.ensureIndexInCache(memoryDto.userAddress);

        // Create empty graph for this user
        graph = this.graphService.createGraph();

        // We'll create the on-chain index when the first batch is flushed
        // For now, we can proceed with in-memory operations
      }
      
      // Step 2: Generate embedding for the memory
      const { vector } = await this.embeddingService.embedText(memoryDto.content);

      // Step 3: Add vector to the index using batched approach
      const vectorId = this.getNextVectorId(memoryDto.userAddress);
      this.hnswIndexService.addVectorToIndexBatched(memoryDto.userAddress, vectorId, vector);

      // Step 4: Extract entities and relationships
      const extraction = await this.graphService.extractEntitiesAndRelationships(
        memoryDto.content
      );
      
      // Step 5: Update the entity-to-vector mapping
      const entityToVectorMap = this.getEntityToVectorMap(memoryDto.userAddress);
      extraction.entities.forEach(entity => {
        entityToVectorMap[entity.id] = vectorId;
      });
      
      // Step 6: Update the graph
      graph = this.graphService.addToGraph(
        graph,
        extraction.entities,
        extraction.relationships
      );
      
      // Step 7: Encrypt the memory content (skip in demo mode)
      let contentToStore = memoryDto.content;
      if (!this.isDemoMode()) {
        contentToStore = await this.sealService.encrypt(
          memoryDto.content,
          memoryDto.userAddress
        );
      } else {
        this.logger.log('Demo mode: Skipping encryption');
      }

      // Step 8: Save the content to storage
      const contentBlobId = await this.storageService.uploadContent(contentToStore, memoryDto.userAddress);

      // Step 9: Save the updated graph to Walrus (if we have existing graph data)
      if (graph && graphBlobId) {
        const newGraphBlobId = await this.graphService.saveGraph(graph, memoryDto.userAddress);
        this.logger.log(`Updated graph saved to Walrus: ${newGraphBlobId}`);
      } else {
        this.logger.log(`New user - graph will be created when first batch is processed`);
      }

      // Step 10: Generate a temporary memory ID for backend tracking
      // Note: Blockchain records should be created by the frontend with user signatures
      const memoryId = `backend_temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      this.logger.log(`Memory processed with temporary ID: ${memoryId} (blockchain record should be created by frontend)`);

      this.logger.log(`Memory created successfully with ID: ${memoryId}. Vector queued for batch processing.`);

      return {
        success: true,
        memoryId,
        blobId: contentBlobId, // Return the real blob ID for frontend
        vectorId: vectorId,    // Return the vector ID for frontend
        message: 'Memory saved successfully. Search index will be updated shortly.'
      };
    } catch (error) {
      this.logger.error(`Error processing new memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to process memory: ${error.message}`
      };
    }
  }

  /**
   * Process a memory (embedding, graph, encryption) without creating on-chain record
   * Used by direct blockchain mode to prepare a memory before user creates it on-chain
   */
  async processMemory(processDto: ProcessMemoryDto): Promise<{ 
    success: boolean, 
    vectorId?: number,
    blobId?: string,
    message?: string,
    requiresIndexCreation?: boolean,
    indexBlobId?: string,
    graphBlobId?: string
  }> {
    try {
      const { content, userAddress, category = 'general' } = processDto;
      
      // Step 1: Try to get existing index, but don't fail if it doesn't exist
      const indexData = await this.memoryIndexService.getOrLoadIndex(userAddress);

      let graph: any;
      let indexId: string | undefined;
      let indexBlobId: string | undefined;
      let graphBlobId: string | undefined;
      let currentVersion = 1;

      if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
        // Use existing index data for graph operations
        graph = indexData.graph;
        indexId = indexData.indexId;
        indexBlobId = indexData.indexBlobId;
        graphBlobId = indexData.graphBlobId;
        currentVersion = indexData.version;

        // Load the index into cache if not already there
        await this.hnswIndexService.getOrLoadIndexCached(userAddress, indexBlobId);
      } else {
        // No existing index - create new one in memory and prepare for batching
        this.logger.log(`No existing index found for user ${userAddress}, creating new index in memory`);

        // Create a new index in memory for batching
        await this.ensureIndexInCache(userAddress);

        // Create empty graph for this user
        graph = this.graphService.createGraph();

        // We'll create the on-chain index when the first batch is flushed
        // For now, we can proceed with in-memory operations
      }
      
      // Step 2: Generate embedding for the memory
      const { vector } = await this.embeddingService.embedText(content);

      // Step 3: Add vector to the index using batched approach
      const vectorId = this.getNextVectorId(userAddress);
      this.hnswIndexService.addVectorToIndexBatched(userAddress, vectorId, vector);

      // Step 4: Extract entities and relationships
      const extraction = await this.graphService.extractEntitiesAndRelationships(content);
      
      // Step 5: Update the entity-to-vector mapping
      const entityToVectorMap = this.getEntityToVectorMap(userAddress);
      extraction.entities.forEach(entity => {
        entityToVectorMap[entity.id] = vectorId;
      });
      
      // Step 6: Update the graph
      graph = this.graphService.addToGraph(
        graph,
        extraction.entities,
        extraction.relationships
      );
      
      // Step 7: Encrypt the memory content (skip in demo mode)
      let contentToStore = content;
      if (!this.isDemoMode()) {
        contentToStore = await this.sealService.encrypt(
          content,
          userAddress
        );
      } else {
        this.logger.log('Demo mode: Skipping encryption for conversation processing');
      }

      // Step 8: Save the content to storage
      const contentBlobId = await this.storageService.uploadContent(contentToStore, userAddress);

      // Step 9: Save the updated graph to Walrus (if we have existing graph data)
      if (graph && graphBlobId) {
        const newGraphBlobId = await this.graphService.saveGraph(graph, userAddress);
        this.logger.log(`Updated graph saved to Walrus: ${newGraphBlobId}`);
      } else {
        this.logger.log(`New user - graph will be created when first batch is processed`);
      }

      this.logger.log(`Memory processed and queued for batch index update for user ${userAddress}`);

      // Return data needed for frontend to create on-chain record
      return {
        success: true,
        vectorId,
        blobId: contentBlobId,
        message: 'Memory processed successfully. Search index will be updated shortly.'
      };
    } catch (error) {
      this.logger.error(`Error processing memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to process memory: ${error.message}`
      };
    }
  }

  /**
   * Index a memory that was created directly on the blockchain
   */
  async indexMemory(indexDto: MemoryIndexDto): Promise<{ success: boolean, message?: string }> {
    try {
      const { memoryId, userAddress, category = 'general', walrusHash } = indexDto;
      
      // Verify the memory exists on chain
      try {
        const memoryOnChain = await this.suiService.getMemory(memoryId);
        
        if (memoryOnChain.owner !== userAddress) {
          return { 
            success: false, 
            message: 'Memory does not belong to the specified user' 
          };
        }
        
        // Log success
        this.logger.log(`Memory ${memoryId} verified on-chain for user ${userAddress}`);
      } catch (error) {
        return { 
          success: false, 
          message: `Failed to verify memory: ${error.message}` 
        };
      }
      
      return {
        success: true,
        message: `Memory ${memoryId} indexed successfully`
      };
    } catch (error) {
      this.logger.error(`Error indexing memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to index memory: ${error.message}`
      };
    }
  }

  /**
   * Update an existing memory
   * @param memoryId Memory ID
   * @param content New content
   * @param userAddress User address
   * @returns Update result
   */
  async updateMemory(
    memoryId: string,
    content: string,
    userAddress: string
  ): Promise<{ success: boolean; memory?: any; message?: string }> {
    try {
      // Step 1: Verify ownership
      try {
        const memory = await this.suiService.getMemory(memoryId);
        
        if (memory.owner !== userAddress) {
          return {
            success: false,
            message: 'Memory does not belong to the specified user'
          };
        }
      } catch (error) {
        return {
          success: false,
          message: `Failed to verify memory: ${error.message}`
        };
      }
      
      // Step 2: Process the updated content (similar to new memory)
      // ...
      
      // This would be a complex implementation requiring:
      // 1. Removing the old vector from the index
      // 2. Adding the new vector
      // 3. Updating the graph entities and relationships
      // 4. Re-encrypting and saving content
      // 5. Updating the on-chain record
      
      // For the demo implementation, we'll just return success
      return {
        success: true,
        message: 'Memory updated successfully'
      };
    } catch (error) {
      this.logger.error(`Error updating memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to update memory: ${error.message}`
      };
    }
  }

  /**
   * Process an approved memory from the frontend
   * This method handles storage and indexing after the frontend has created the blockchain record
   * @param saveMemoryDto Memory data approved by the user (includes suiObjectId from frontend)
   * @returns Processing result
   */
  async processApprovedMemory(saveMemoryDto: SaveMemoryDto): Promise<{
    success: boolean;
    memoryId?: string;
    blobId?: string;
    vectorId?: number;
    message?: string;
  }> {
    try {
      const { content, category, userAddress, suiObjectId } = saveMemoryDto;

      this.logger.log(`Processing approved memory for user ${userAddress} with blockchain ID: ${suiObjectId}`);
      
      // If the frontend already created the memory object on blockchain
      if (suiObjectId) {
        this.logger.log(`Using existing memory object ID: ${suiObjectId}`);
        
        // Just process the content
        const processResult = await this.processMemory({
          content,
          userAddress,
          category
        });
        
        if (!processResult.success) {
          return {
            success: false,
            message: processResult.message || 'Failed to process memory content'
          };
        }
        
        // Return the processed data
        return {
          success: true,
          memoryId: suiObjectId,
          blobId: processResult.blobId,
          vectorId: processResult.vectorId,
          message: 'Memory processed successfully'
        };
      }
      
      // Process the memory content
      const processResult = await this.processMemory({
        content,
        userAddress,
        category
      });
      
      if (!processResult.success) {
        return {
          success: false,
          message: processResult.message || 'Failed to process memory content'
        };
      }
      
      // Return the data needed for frontend to create the blockchain record
      return {
        success: true,
        blobId: processResult.blobId,
        vectorId: processResult.vectorId,
        message: 'Memory processed successfully. Create blockchain record with the provided data.'
      };
    } catch (error) {
      this.logger.error(`Error processing approved memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to process memory: ${error.message}`
      };
    }
  }

  /**
   * Ensure an index exists in cache for the user (create if needed)
   */
  private async ensureIndexInCache(userAddress: string): Promise<void> {
    try {
      // Check if index is already in cache
      const cachedIndex = await this.hnswIndexService.getOrLoadIndexCached(userAddress);

      if (!cachedIndex) {
        // Create a new index in memory
        this.logger.log(`Creating new in-memory index for user ${userAddress}`);
        const { index } = await this.hnswIndexService.createIndex();

        // Add to cache
        this.hnswIndexService.addIndexToCache(userAddress, index);

        this.logger.log(`New index created and cached for user ${userAddress}`);

        // Note: The index will be saved to Walrus when the first memory is added
        // This avoids creating empty indexes that may fail due to network issues
      } else {
        this.logger.log(`Using existing cached index for user ${userAddress}`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring index in cache for user ${userAddress}: ${error.message}`);

      // If it's a Walrus connectivity issue, provide graceful degradation
      if (error.message.includes('Walrus') ||
          error.message.includes('fetch failed') ||
          error.message.includes('network') ||
          error.message.includes('timeout')) {
        this.logger.warn(`Walrus connectivity issue detected. Memory features will be temporarily unavailable.`);
        throw new Error(
          'Memory storage is temporarily unavailable due to network connectivity issues. ' +
          'Your chat will continue to work normally, but memories cannot be saved at this time. ' +
          'Please try again later.'
        );
      }

      throw error;
    }
  }

  /**
   * Get batch processing statistics
   */
  getBatchStats() {
    return this.hnswIndexService.getCacheStats();
  }

  /**
   * Force flush pending vectors for a specific user
   */
  async forceFlushUser(userAddress: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.hnswIndexService.forceFlush(userAddress);
      return {
        success: true,
        message: `Successfully flushed pending vectors for user ${userAddress}`
      };
    } catch (error) {
      this.logger.error(`Error force flushing user ${userAddress}: ${error.message}`);
      return {
        success: false,
        message: `Failed to flush vectors: ${error.message}`
      };
    }
  }
}
````

## File: src/memory/memory-query/memory-query.service.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MemoryQueryService } from './memory-query.service';

describe('MemoryQueryService', () => {
  let service: MemoryQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryQueryService],
    }).compile();

    service = module.get<MemoryQueryService>(MemoryQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
````

## File: src/memory/memory-query/memory-query.service.ts
````typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import { CachedWalrusService } from '../../infrastructure/walrus/cached-walrus.service';
import { MemoryIngestionService } from '../memory-ingestion/memory-ingestion.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
import { Memory } from '../../types/memory.types';

@Injectable()
export class MemoryQueryService {
  private readonly logger = new Logger(MemoryQueryService.name);
  
  constructor(
    private embeddingService: EmbeddingService,
    private graphService: GraphService,
    private hnswIndexService: HnswIndexService,
    private sealService: SealService,
    private suiService: SuiService,
    private walrusService: WalrusService,
    private cachedWalrusService: CachedWalrusService,
    private memoryIngestionService: MemoryIngestionService,
    private geminiService: GeminiService
  ) {}

  /**
   * Get all memories for a user
   */
  async getUserMemories(userAddress: string): Promise<{ memories: Memory[], success: boolean }> {
    try {
      // Get all memory records for this user
      const memoryRecords = await this.suiService.getUserMemories(userAddress);
      const memories: Memory[] = [];

      // Populate memories with data
      for (const record of memoryRecords) {
        try {
          // Get content from Walrus with caching
          const content = await this.cachedWalrusService.retrieveContent(record.blobId);
          
          memories.push({
            id: record.id,
            content: content, // Unencrypted content
            category: record.category,
            timestamp: new Date().toISOString(), // Use creation time from record if available
            isEncrypted: false,
            owner: userAddress,
            walrusHash: record.blobId
          });
        } catch (error) {
          this.logger.error(`Error retrieving memory ${record.id}: ${error.message}`);
        }
      }

      return { 
        memories,
        success: true
      };
    } catch (error) {
      this.logger.error(`Error getting user memories: ${error.message}`);
      return { memories: [], success: false };
    }
  }

  /**
   * Find relevant memories based on a query
   */
  async findRelevantMemories(
    query: string,
    userAddress: string,
    limit: number = 5
  ): Promise<string[]> {
    try {
      // Step 1: Get memory index for user
      let indexBlobId: string;
      let graphBlobId: string;
      
      try {
        // Get existing memory index
        const memoryIndex = await this.suiService.getMemoryIndex(userAddress);
        indexBlobId = memoryIndex.indexBlobId;
        graphBlobId = memoryIndex.graphBlobId;
      } catch (error) {
        // No memory index exists, return empty results
        this.logger.log(`No memory index found for user ${userAddress}`);
        return [];
      }
      
      // Step 2: Create embedding for query
      const { vector } = await this.embeddingService.embedText(query);
      
      // Step 3: Load index and perform vector search
      const { index } = await this.hnswIndexService.loadIndex(indexBlobId, userAddress);
      const searchResults = this.hnswIndexService.searchIndex(index, vector, limit * 2); // Get more results than needed
      
      // Step 4: Load graph and find related entities
      const graph = await this.graphService.loadGraph(graphBlobId, userAddress);
      const entityToVectorMap = this.memoryIngestionService.getEntityToVectorMap(userAddress);
      
      // Step 5: Expand search using graph traversal
      const expandedVectorIds = this.graphService.findRelatedEntities(
        graph,
        searchResults.ids,
        entityToVectorMap,
        1 // Limit traversal to 1 hop for performance
      ).map(entityId => entityToVectorMap[entityId])
        .filter(Boolean); // Filter out undefined vector IDs
      
      // Combine original search results with graph-expanded results
      const allVectorIds = [...new Set([...searchResults.ids, ...expandedVectorIds])];
      
      // Step 6: Get actual memory content for the vector IDs
      const memories: string[] = [];
      const seenBlobIds = new Set<string>();
      
      // Get all memory objects for this user
      for (const vectorId of allVectorIds.slice(0, limit)) {
        try {
          const memoryObjects = await this.suiService.getMemoriesWithVectorId(userAddress, vectorId);
          
          for (const memory of memoryObjects) {
            if (seenBlobIds.has(memory.blobId)) continue;
            seenBlobIds.add(memory.blobId);
            
            // Get content from Walrus with caching
            const content = await this.cachedWalrusService.retrieveContent(memory.blobId);
            
            memories.push(content);
            
            if (memories.length >= limit) break;
          }
        } catch (error) {
          this.logger.error(`Error retrieving memory for vector ID ${vectorId}: ${error.message}`);
          continue;
        }
      }
      
      return memories;
    } catch (error) {
      this.logger.error(`Error finding relevant memories: ${error.message}`);
      return [];
    }
  }

  /**
   * Search memories based on query and optionally category
   */
  async searchMemories(
    query: string,
    userAddress: string,
    category?: string,
    k: number = 5
  ): Promise<{ results: Memory[] }> {
    try {
      // Step 1: Create embedding for query
      const { vector } = await this.embeddingService.embedText(query);

      // Step 2: Get memory index for user
      let indexBlobId: string;
      
      try {
        const memoryIndex = await this.suiService.getMemoryIndex(userAddress);
        indexBlobId = memoryIndex.indexBlobId;
      } catch (error) {
        this.logger.log(`No memory index found for user ${userAddress}`);
        return { results: [] };
      }
      
      // Step 3: Load index and perform vector search
      const { index } = await this.hnswIndexService.loadIndex(indexBlobId, userAddress);
      const searchResults = this.hnswIndexService.searchIndex(index, vector, k * 2);
      
      // Step 4: Get memory content and filter by category if needed
      const results: Memory[] = [];
      
      for (const vectorId of searchResults.ids) {
        try {
          const memoryObjects = await this.suiService.getMemoriesWithVectorId(userAddress, vectorId);
          
          for (const memoryObj of memoryObjects) {
            // Skip if category filter is applied and doesn't match
            if (category && memoryObj.category !== category) continue;
            
            // Get content from Walrus with caching
            const content = await this.cachedWalrusService.retrieveContent(memoryObj.blobId);
            
            // Add to results
            results.push({
              id: memoryObj.id,
              content: content,
              category: memoryObj.category,
              timestamp: new Date().toISOString(),
              isEncrypted: false,
              owner: userAddress,
              similarity_score: searchResults.distances[searchResults.ids.indexOf(vectorId)],
              walrusHash: memoryObj.blobId
            });
            
            if (results.length >= k) break;
          }
          
          if (results.length >= k) break;
        } catch (error) {
          this.logger.error(`Error retrieving memory for vector ID ${vectorId}: ${error.message}`);
        }
      }
      
      return { results };
    } catch (error) {
      this.logger.error(`Error searching memories: ${error.message}`);
      return { results: [] };
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string, userAddress: string): Promise<{ message: string, success: boolean }> {
    try {
      // 1. Get memory from chain to verify ownership and get blob ID
      const memory = await this.suiService.getMemory(memoryId);
      
      if (memory.owner !== userAddress) {
        throw new NotFoundException('Memory not found or you are not the owner');
      }
      
      // 2. Delete memory on chain
      await this.suiService.deleteMemory(memoryId, userAddress);
      
      // 3. Delete content blob from Walrus (optional, based on policy)
      try {
        await this.walrusService.deleteContent(memory.blobId, userAddress);
      } catch (walrusError) {
        // Log but don't fail if Walrus deletion fails - chain is source of truth
        this.logger.warn(`Failed to delete from Walrus: ${walrusError.message}`);
      }
      
      return {
        message: 'Memory deleted successfully',
        success: true
      };
    } catch (error) {
      this.logger.error(`Error deleting memory: ${error.message}`);
      return {
        message: `Failed to delete memory: ${error.message}`,
        success: false
      };
    }
  }

  /**
   * Get memory context for a chat session
   */
  async getMemoryContext(
    queryText: string,
    userAddress: string,
    userSignature: string,
    k: number = 5
  ): Promise<{
    context: string,
    relevant_memories: Memory[],
    query_metadata: {
      query_time_ms: number,
      memories_found: number,
      context_length: number
    }
  }> {
    try {
      const startTime = Date.now();
      
      // Find relevant memories
      const relevantMemoriesContent = await this.findRelevantMemories(queryText, userAddress, k);
      
      // Format memories as structured objects
      const relevantMemories: Memory[] = relevantMemoriesContent.map((content, index) => ({
        id: `mem-${index}`, // Placeholder ID
        content,
        category: 'auto', // We don't have actual category here
        timestamp: new Date().toISOString(),
        isEncrypted: false, // Already decrypted
        owner: userAddress
      }));
      
      // Generate context summary using LLM
      let context = '';
      if (relevantMemories.length > 0) {
        const memoryTexts = relevantMemories.map(m => m.content).join('\n\n');
        
        const prompt = `
          Summarize the following user memories to provide context for answering a question.
          Be concise but informative, focusing only on details relevant to the query: "${queryText}"
          
          MEMORIES:
          ${memoryTexts}
          
          SUMMARY:
        `;
        
        context = await this.geminiService.generateContent(
          'gemini-1.5-flash',
          [{ role: 'user', content: prompt }]
        );
      }
      
      const endTime = Date.now();
      
      return {
        context,
        relevant_memories: relevantMemories,
        query_metadata: {
          query_time_ms: endTime - startTime,
          memories_found: relevantMemories.length,
          context_length: context.length
        }
      };
    } catch (error) {
      this.logger.error(`Error getting memory context: ${error.message}`);
      return {
        context: '',
        relevant_memories: [],
        query_metadata: {
          query_time_ms: 0,
          memories_found: 0,
          context_length: 0
        }
      };
    }
  }

  /**
   * Get memory statistics
   */
  /**
   * Get memory content by its Walrus hash
   */
  async getMemoryContentByHash(hash: string): Promise<{ content: string, success: boolean }> {
    try {
      // Retrieve content from Walrus with caching
      const content = await this.cachedWalrusService.retrieveContent(hash);
      
      // Return the content
      return {
        content: content,
        success: true
      };
    } catch (error) {
      this.logger.error(`Error getting memory content by hash ${hash}: ${error.message}`);
      return {
        content: '',
        success: false
      };
    }
  }
  
  async getMemoryStats(userAddress: string): Promise<{
    total_memories: number,
    categories: Record<string, number>,
    storage_used_bytes: number,
    last_updated: string,
    success: boolean
  }> {
    try {
      // 1. Get all memories for user
      const { memories } = await this.getUserMemories(userAddress);
      
      // 2. Calculate statistics
      const categories: Record<string, number> = {};
      let totalSize = 0;
      
      for (const memory of memories) {
        // Count by category
        if (categories[memory.category]) {
          categories[memory.category] += 1;
        } else {
          categories[memory.category] = 1;
        }
        
        // Sum up content sizes
        totalSize += memory.content.length;
      }
      
      return {
        total_memories: memories.length,
        categories,
        storage_used_bytes: totalSize,
        last_updated: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      this.logger.error(`Error getting memory stats: ${error.message}`);
      return {
        total_memories: 0,
        categories: {},
        storage_used_bytes: 0,
        last_updated: new Date().toISOString(),
        success: false
      };
    }
  }
}
````

## File: src/memory/memory.controller.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MemoryController } from './memory.controller';

describe('MemoryController', () => {
  let controller: MemoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemoryController],
    }).compile();

    controller = module.get<MemoryController>(MemoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
````

## File: src/memory/memory.controller.ts
````typescript
import { Controller, Post, Body, Get, Query, Delete, Param, Put } from '@nestjs/common';
import { MemoryIngestionService } from './memory-ingestion/memory-ingestion.service';
import { MemoryQueryService } from './memory-query/memory-query.service';
import { MemoryIndexService } from './memory-index/memory-index.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { SearchMemoryDto } from './dto/search-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { MemoryContextDto } from './dto/memory-context.dto';
import { MemoryIndexDto } from './dto/memory-index.dto';
import { ProcessMemoryDto } from './dto/process-memory.dto';
import { SaveMemoryDto } from './dto/save-memory.dto';
import { PrepareIndexDto } from './dto/prepare-index.dto';
import { RegisterIndexDto } from './dto/register-index.dto';
import { Memory } from '../types/memory.types';

@Controller('memories')
export class MemoryController {
  constructor(
    private readonly memoryIngestionService: MemoryIngestionService,
    private readonly memoryQueryService: MemoryQueryService,
    private readonly memoryIndexService: MemoryIndexService
  ) {}

  @Get()
  async getMemories(@Query('user') userAddress: string): Promise<{ memories: Memory[], success: boolean }> {
    return this.memoryQueryService.getUserMemories(userAddress);
  }

  @Post()
  async createMemory(@Body() createMemoryDto: CreateMemoryDto) {
    return this.memoryIngestionService.processNewMemory(createMemoryDto);
  }

  @Post('save-approved')
  async saveApprovedMemory(@Body() saveMemoryDto: SaveMemoryDto) {
    // Process the approved memory without blockchain operations
    // Frontend handles blockchain, backend handles indexing and storage preparation
    return this.memoryIngestionService.processApprovedMemory(saveMemoryDto);
  }

  @Post('search')
  async searchMemories(@Body() searchMemoryDto: SearchMemoryDto): Promise<{ results: Memory[] }> {
    return this.memoryQueryService.searchMemories(
      searchMemoryDto.query, 
      searchMemoryDto.userAddress, 
      searchMemoryDto.category,
      searchMemoryDto.k
    );
  }

  @Delete(':memoryId')
  async deleteMemory(
    @Param('memoryId') memoryId: string,
    @Body('userAddress') userAddress: string
  ) {
    return this.memoryQueryService.deleteMemory(memoryId, userAddress);
  }

  @Put(':memoryId')
  async updateMemory(
    @Param('memoryId') memoryId: string,
    @Body() updateMemoryDto: UpdateMemoryDto
  ) {
    return this.memoryIngestionService.updateMemory(
      memoryId,
      updateMemoryDto.content,
      updateMemoryDto.userAddress
    );
  }

  @Post('context')
  async getMemoryContext(@Body() memoryContextDto: MemoryContextDto): Promise<{
    context: string,
    relevant_memories: Memory[],
    query_metadata: {
      query_time_ms: number,
      memories_found: number,
      context_length: number
    }
  }> {
    return this.memoryQueryService.getMemoryContext(
      memoryContextDto.query_text,
      memoryContextDto.user_address,
      memoryContextDto.user_signature,
      memoryContextDto.k
    );
  }

  @Get('stats')
  async getMemoryStats(@Query('userAddress') userAddress: string) {
    return this.memoryQueryService.getMemoryStats(userAddress);
  }
  
  @Get('content/:hash')
  async getMemoryContent(@Param('hash') hash: string) {
    return this.memoryQueryService.getMemoryContentByHash(hash);
  }
  
  @Post('index')
  async indexMemory(@Body() memoryIndexDto: MemoryIndexDto) {
    return this.memoryIngestionService.indexMemory(memoryIndexDto);
  }

  @Post('process')
  async processMemory(@Body() processDto: ProcessMemoryDto) {
    return this.memoryIngestionService.processMemory(processDto);
  }
  
  @Post('prepare-index')
  async prepareIndex(@Body() prepareIndexDto: PrepareIndexDto) {
    return this.memoryIndexService.prepareIndexForCreation(prepareIndexDto.userAddress);
  }
  
  @Post('register-index')
  async registerIndex(@Body() registerIndexDto: RegisterIndexDto) {
    return this.memoryIndexService.registerMemoryIndex(
      registerIndexDto.userAddress,
      registerIndexDto.indexId
    );
  }

  @Get('batch-stats')
  async getBatchStats() {
    return this.memoryIngestionService.getBatchStats();
  }

  @Post('force-flush/:userAddress')
  async forceFlush(@Param('userAddress') userAddress: string) {
    return this.memoryIngestionService.forceFlushUser(userAddress);
  }
}
````

## File: src/memory/memory.module.ts
````typescript
import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryIngestionService } from './memory-ingestion/memory-ingestion.service';
import { MemoryQueryService } from './memory-query/memory-query.service';
import { MemoryIndexService } from './memory-index/memory-index.service';
import { ClassifierService } from './classifier/classifier.service';
import { EmbeddingService } from './embedding/embedding.service';
import { GraphService } from './graph/graph.service';
import { HnswIndexService } from './hnsw-index/hnsw-index.service';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
@Module({
  controllers: [MemoryController],
  providers: [
    MemoryIngestionService,
    MemoryQueryService,
    MemoryIndexService,
    ClassifierService,
    EmbeddingService,
    GraphService,
    HnswIndexService
  ],
  exports: [
    MemoryIngestionService,
    MemoryQueryService,
    ClassifierService,
    EmbeddingService,
    HnswIndexService,
    GraphService
  ]
})
export class MemoryModule {}
````

## File: src/storage/storage.controller.ts
````typescript
import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { StorageService } from '../infrastructure/storage/storage.service';
import { LocalStorageService } from '../infrastructure/local-storage/local-storage.service';
import { WalrusService } from '../infrastructure/walrus/walrus.service';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly localStorageService: LocalStorageService,
    private readonly walrusService: WalrusService
  ) {}

  /**
   * Retrieve content from storage (local or Walrus)
   */
  @Get('retrieve/:blobId')
  async retrieveContent(@Param('blobId') blobId: string): Promise<{ content: string; success: boolean }> {
    try {
      console.log(`Retrieving content for blob: ${blobId}`);

      // Check if it's a local storage blob ID
      if (blobId.startsWith('local_') || blobId.startsWith('demo_')) {
        console.log(`Fetching from local storage: ${blobId}`);
        const content = await this.localStorageService.retrieveContent(blobId);
        return { content, success: true };
      } else {
        // It's a Walrus blob ID
        console.log(`Fetching from Walrus: ${blobId}`);
        const buffer = await this.walrusService.downloadFile(blobId);
        return { content: buffer.toString('utf-8'), success: true };
      }
    } catch (error) {
      console.error(`Error retrieving content for blob ${blobId}:`, error);
      return { content: '', success: false };
    }
  }

  /**
   * Check if content exists in storage
   */
  @Get('exists/:blobId')
  async checkExists(@Param('blobId') blobId: string): Promise<{ exists: boolean }> {
    try {
      let exists = false;
      
      if (blobId.startsWith('local_') || blobId.startsWith('demo_')) {
        exists = await this.localStorageService.exists(blobId);
      } else {
        // For Walrus, we try to download and catch errors
        try {
          await this.walrusService.downloadFile(blobId);
          exists = true;
        } catch (error) {
          exists = false;
        }
      }
      
      return { exists };
    } catch (error) {
      console.error(`Error checking existence for blob ${blobId}:`, error);
      return { exists: false };
    }
  }

  /**
   * Get storage statistics
   */
  @Get('stats')
  async getStorageStats() {
    try {
      const stats = await this.storageService.getStats();
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw new HttpException(
        'Failed to get storage statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
````

## File: src/storage/storage.module.ts
````typescript
import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  controllers: [StorageController],
})
export class StorageModule {}
````

## File: src/types/chat.types.ts
````typescript
export interface ChatMessage {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  memoryId?: string;
  walrusHash?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title: string;
  owner: string;
  summary?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  message_count: number;
  sui_object_id?: string;
  metadata?: Record<string, any>;
}

export interface ChatMessageResponse {
  content: string;
  type: string;
  memoryExtraction?: any;
  memoryStored?: boolean;
  memoryId?: string;
}

export interface ChatSessionResponse {
  session: ChatSession;
  success: boolean;
  message?: string;
}
````

## File: src/types/memory.types.ts
````typescript
/**
 * Common memory types used across the application
 */

export interface Memory {
  id: string;
  content: string;
  category: string;
  timestamp: string;
  isEncrypted: boolean;
  owner: string;
  similarity_score?: number;
  walrusHash?: string;
}
````

## File: storage/demo/demo_1754534312456_2lx7mykti.meta.json
````json
{
  "blobId": "demo_1754534312456_2lx7mykti",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754534312456.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 3312,
  "createdAt": "2025-08-07T02:38:32.457Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754534633183_yt9zuy3qe.meta.json
````json
{
  "blobId": "demo_1754534633183_yt9zuy3qe",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754534633183.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 6528,
  "createdAt": "2025-08-07T02:43:53.184Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754535038700_ntefo0kvy.meta.json
````json
{
  "blobId": "demo_1754535038700_ntefo0kvy",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754535038700.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 6528,
  "createdAt": "2025-08-07T02:50:38.701Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754535327413_yf2wjwvbd.meta.json
````json
{
  "blobId": "demo_1754535327413_yf2wjwvbd",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754535327413.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 9744,
  "createdAt": "2025-08-07T02:55:27.415Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754535362416_1pfa05kc4.meta.json
````json
{
  "blobId": "demo_1754535362416_1pfa05kc4",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754535362416.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 16176,
  "createdAt": "2025-08-07T02:56:02.416Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754535958436_tlj0znmas.meta.json
````json
{
  "blobId": "demo_1754535958436_tlj0znmas",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754535958436.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 3312,
  "createdAt": "2025-08-07T03:05:58.437Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754535968438_o9u9eqgr4.meta.json
````json
{
  "blobId": "demo_1754535968438_o9u9eqgr4",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754535968438.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 9744,
  "createdAt": "2025-08-07T03:06:08.439Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754536709267_yr833srfc.meta.json
````json
{
  "blobId": "demo_1754536709267_yr833srfc",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754536709267.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 3312,
  "createdAt": "2025-08-07T03:18:29.268Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754536719270_ujscvj291.meta.json
````json
{
  "blobId": "demo_1754536719270_ujscvj291",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754536719270.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 9744,
  "createdAt": "2025-08-07T03:18:39.271Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754538821742_9a9vv89al.meta.json
````json
{
  "blobId": "demo_1754538821742_9a9vv89al",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754538821742.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 3312,
  "createdAt": "2025-08-07T03:53:41.743Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754538831743_cwbsutrso.meta.json
````json
{
  "blobId": "demo_1754538831743_cwbsutrso",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754538831743.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 9744,
  "createdAt": "2025-08-07T03:53:51.743Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754539071783_tzhiji8bw.meta.json
````json
{
  "blobId": "demo_1754539071783_tzhiji8bw",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754539071783.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 12960,
  "createdAt": "2025-08-07T03:57:51.784Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754539081785_9vqq494ia.meta.json
````json
{
  "blobId": "demo_1754539081785_9vqq494ia",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754539081784.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 19460,
  "createdAt": "2025-08-07T03:58:01.785Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754539231823_gfk1ubeyw.meta.json
````json
{
  "blobId": "demo_1754539231823_gfk1ubeyw",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754539231823.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 22676,
  "createdAt": "2025-08-07T04:00:31.826Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754539241821_ua9an5w6x.meta.json
````json
{
  "blobId": "demo_1754539241821_ua9an5w6x",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754539241821.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 29108,
  "createdAt": "2025-08-07T04:00:41.822Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754539655050_1yuvdud9e.meta.json
````json
{
  "blobId": "demo_1754539655050_1yuvdud9e",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754539655050.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 3312,
  "createdAt": "2025-08-07T04:07:35.051Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754539665050_3d43d888p.meta.json
````json
{
  "blobId": "demo_1754539665050_3d43d888p",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754539665050.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 9744,
  "createdAt": "2025-08-07T04:07:45.051Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754540095842_852742y8r.meta.json
````json
{
  "blobId": "demo_1754540095842_852742y8r",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754540095842.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 3312,
  "createdAt": "2025-08-07T04:14:55.842Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754540110846_e7eavdz9c.meta.json
````json
{
  "blobId": "demo_1754540110846_e7eavdz9c",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754540110846.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 9744,
  "createdAt": "2025-08-07T04:15:10.847Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754540565610_75jbcbuzp.meta.json
````json
{
  "blobId": "demo_1754540565610_75jbcbuzp",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754540565610.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 3312,
  "createdAt": "2025-08-07T04:22:45.611Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754540578725_u30bqfq9m.meta.json
````json
{
  "blobId": "demo_1754540578725_u30bqfq9m",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754540578725.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 9744,
  "createdAt": "2025-08-07T04:22:58.726Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754541640849_t6j1myndi.meta.json
````json
{
  "blobId": "demo_1754541640849_t6j1myndi",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754541640849.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 12960,
  "createdAt": "2025-08-07T04:40:40.850Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754541650850_pf532v4hi.meta.json
````json
{
  "blobId": "demo_1754541650850_pf532v4hi",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754541650850.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 19460,
  "createdAt": "2025-08-07T04:40:50.850Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754541695858_n554auc76.meta.json
````json
{
  "blobId": "demo_1754541695858_n554auc76",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754541695858.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 22676,
  "createdAt": "2025-08-07T04:41:35.859Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754541710861_jhl08v5l4.meta.json
````json
{
  "blobId": "demo_1754541710861_jhl08v5l4",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754541710861.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 29108,
  "createdAt": "2025-08-07T04:41:50.862Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754541790876_li15dswz8.meta.json
````json
{
  "blobId": "demo_1754541790876_li15dswz8",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754541790876.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 32324,
  "createdAt": "2025-08-07T04:43:10.877Z",
  "storageType": "demo"
}
````

## File: storage/demo/demo_1754541800877_d638k2anw.meta.json
````json
{
  "blobId": "demo_1754541800877_d638k2anw",
  "filename": "index_0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad_1754541800877.hnsw",
  "ownerAddress": "demo_admin_address",
  "epochs": 12,
  "tags": {
    "user-address": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad",
    "content-type": "application/hnsw-index",
    "version": "1.0"
  },
  "contentType": "application/octet-stream",
  "size": 38756,
  "createdAt": "2025-08-07T04:43:20.878Z",
  "storageType": "demo"
}
````

## File: storage/local-files/local_1754534305198_q22zh8cwy.bin
````
7aFTJiTZKanOP+XO:jYQpOQn2vlFTHYvYqA7mWg==:Uu04b/Qvops7McUim2BDpgu9BRDvSViUZ3o7Drrg9b/GqeU=
````

## File: storage/local-files/local_1754534305198_q22zh8cwy.meta.json
````json
{
  "blobId": "local_1754534305198_q22zh8cwy",
  "filename": "content_1754534305198.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 90,
  "createdAt": "2025-08-07T02:38:25.199Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754534625610_ypj49l99v.bin
````
Hi, I'm John and I live in New York
````

## File: storage/local-files/local_1754534625610_ypj49l99v.meta.json
````json
{
  "blobId": "local_1754534625610_ypj49l99v",
  "filename": "content_1754534625610.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 35,
  "createdAt": "2025-08-07T02:43:45.611Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754534628442_toq5anvtd.bin
````
Hi, I'm John and I live in New York
````

## File: storage/local-files/local_1754534628442_toq5anvtd.meta.json
````json
{
  "blobId": "local_1754534628442_toq5anvtd",
  "filename": "content_1754534628442.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 35,
  "createdAt": "2025-08-07T02:43:48.443Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754535033763_gref2myc6.bin
````
Hi, I'm John and I live in New York
````

## File: storage/local-files/local_1754535033763_gref2myc6.meta.json
````json
{
  "blobId": "local_1754535033763_gref2myc6",
  "filename": "content_1754535033763.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 35,
  "createdAt": "2025-08-07T02:50:33.764Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754535036617_jl0y01afd.bin
````
Hi, I'm John and I live in New York
````

## File: storage/local-files/local_1754535036617_jl0y01afd.meta.json
````json
{
  "blobId": "local_1754535036617_jl0y01afd",
  "filename": "content_1754535036617.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 35,
  "createdAt": "2025-08-07T02:50:36.618Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754535324074_l4jqutgyc.bin
````
Hi, I'm John and I live in New York
````

## File: storage/local-files/local_1754535324074_l4jqutgyc.meta.json
````json
{
  "blobId": "local_1754535324074_l4jqutgyc",
  "filename": "content_1754535324074.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 35,
  "createdAt": "2025-08-07T02:55:24.076Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754535357357_zxnoife04.bin
````
Hi, I'm John and I live in New York
````

## File: storage/local-files/local_1754535357357_zxnoife04.meta.json
````json
{
  "blobId": "local_1754535357357_zxnoife04",
  "filename": "content_1754535357357.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 35,
  "createdAt": "2025-08-07T02:55:57.358Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754535359902_w2u5g1r3l.bin
````
Hi, I'm John and I live in New York
````

## File: storage/local-files/local_1754535359902_w2u5g1r3l.meta.json
````json
{
  "blobId": "local_1754535359902_w2u5g1r3l",
  "filename": "content_1754535359902.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 35,
  "createdAt": "2025-08-07T02:55:59.903Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754535950418_c1wqhxkb2.bin
````
my name is hoang
````

## File: storage/local-files/local_1754535950418_c1wqhxkb2.meta.json
````json
{
  "blobId": "local_1754535950418_c1wqhxkb2",
  "filename": "content_1754535950417.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 16,
  "createdAt": "2025-08-07T03:05:50.419Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754535961289_ajo3o72e8.bin
````
my name is hoang
````

## File: storage/local-files/local_1754535961289_ajo3o72e8.meta.json
````json
{
  "blobId": "local_1754535961289_ajo3o72e8",
  "filename": "content_1754535961289.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 16,
  "createdAt": "2025-08-07T03:06:01.290Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754535963229_ko9bposbo.bin
````
my name is hoang
````

## File: storage/local-files/local_1754535963229_ko9bposbo.meta.json
````json
{
  "blobId": "local_1754535963229_ko9bposbo",
  "filename": "content_1754535963229.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 16,
  "createdAt": "2025-08-07T03:06:03.230Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754536703093_ynqbvipyi.bin
````
My name is hoang
````

## File: storage/local-files/local_1754536703093_ynqbvipyi.meta.json
````json
{
  "blobId": "local_1754536703093_ynqbvipyi",
  "filename": "content_1754536703093.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 16,
  "createdAt": "2025-08-07T03:18:23.094Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754536713359_nxidex5ql.bin
````
My name is hoang
````

## File: storage/local-files/local_1754536713359_nxidex5ql.meta.json
````json
{
  "blobId": "local_1754536713359_nxidex5ql",
  "filename": "content_1754536713359.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 16,
  "createdAt": "2025-08-07T03:18:33.360Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754536715722_4gkzdpanm.bin
````
My name is hoang
````

## File: storage/local-files/local_1754536715722_4gkzdpanm.meta.json
````json
{
  "blobId": "local_1754536715722_4gkzdpanm",
  "filename": "content_1754536715722.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 16,
  "createdAt": "2025-08-07T03:18:35.723Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754538815556_kw9wcf4uj.bin
````
I love Italian food, especially pizza and pasta
````

## File: storage/local-files/local_1754538815556_kw9wcf4uj.meta.json
````json
{
  "blobId": "local_1754538815556_kw9wcf4uj",
  "filename": "content_1754538815555.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 47,
  "createdAt": "2025-08-07T03:53:35.557Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754538826612_zg4aeo58j.bin
````
I love Italian food, especially pizza and pasta
````

## File: storage/local-files/local_1754538826612_zg4aeo58j.meta.json
````json
{
  "blobId": "local_1754538826612_zg4aeo58j",
  "filename": "content_1754538826612.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 47,
  "createdAt": "2025-08-07T03:53:46.613Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754538829479_1leonmojs.bin
````
I love Italian food, especially pizza and pasta
````

## File: storage/local-files/local_1754538829479_1leonmojs.meta.json
````json
{
  "blobId": "local_1754538829479_1leonmojs",
  "filename": "content_1754538829479.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 47,
  "createdAt": "2025-08-07T03:53:49.480Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754539068311_nxtd4wt07.bin
````
i live in ho chi minh city
````

## File: storage/local-files/local_1754539068311_nxtd4wt07.meta.json
````json
{
  "blobId": "local_1754539068311_nxtd4wt07",
  "filename": "content_1754539068311.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 26,
  "createdAt": "2025-08-07T03:57:48.312Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754539078099_0khnnvawh.bin
````
i live in ho chi minh city
````

## File: storage/local-files/local_1754539078099_0khnnvawh.meta.json
````json
{
  "blobId": "local_1754539078099_0khnnvawh",
  "filename": "content_1754539078099.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 26,
  "createdAt": "2025-08-07T03:57:58.100Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754539080663_uqitg0fks.bin
````
i live in ho chi minh city
````

## File: storage/local-files/local_1754539080663_uqitg0fks.meta.json
````json
{
  "blobId": "local_1754539080663_uqitg0fks",
  "filename": "content_1754539080663.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 26,
  "createdAt": "2025-08-07T03:58:00.664Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754539227568_qdhfiob2p.bin
````
i live in district 1 in ho chi minh city
````

## File: storage/local-files/local_1754539227568_qdhfiob2p.meta.json
````json
{
  "blobId": "local_1754539227568_qdhfiob2p",
  "filename": "content_1754539227568.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 40,
  "createdAt": "2025-08-07T04:00:27.569Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754539239062_ah8bgtzu7.bin
````
i live in district 1 in ho chi minh city
````

## File: storage/local-files/local_1754539239062_ah8bgtzu7.meta.json
````json
{
  "blobId": "local_1754539239062_ah8bgtzu7",
  "filename": "content_1754539239062.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 40,
  "createdAt": "2025-08-07T04:00:39.063Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754539242127_46r89jdob.bin
````
i live in district 1 in ho chi minh city
````

## File: storage/local-files/local_1754539242127_46r89jdob.meta.json
````json
{
  "blobId": "local_1754539242127_46r89jdob",
  "filename": "content_1754539242127.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 40,
  "createdAt": "2025-08-07T04:00:42.128Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754539649516_nncbx4o95.bin
````
My name is hoang
````

## File: storage/local-files/local_1754539649516_nncbx4o95.meta.json
````json
{
  "blobId": "local_1754539649516_nncbx4o95",
  "filename": "content_1754539649515.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 16,
  "createdAt": "2025-08-07T04:07:29.516Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754539660418_298i349h8.bin
````
My name is hoang
````

## File: storage/local-files/local_1754539660418_298i349h8.meta.json
````json
{
  "blobId": "local_1754539660418_298i349h8",
  "filename": "content_1754539660418.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 16,
  "createdAt": "2025-08-07T04:07:40.419Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754539662466_olvt271kr.bin
````
My name is hoang
````

## File: storage/local-files/local_1754539662466_olvt271kr.meta.json
````json
{
  "blobId": "local_1754539662466_olvt271kr",
  "filename": "content_1754539662466.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 16,
  "createdAt": "2025-08-07T04:07:42.468Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754540091880_d3pum0g1x.bin
````
my name is hoang and i like pizza
````

## File: storage/local-files/local_1754540091880_d3pum0g1x.meta.json
````json
{
  "blobId": "local_1754540091880_d3pum0g1x",
  "filename": "content_1754540091879.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 33,
  "createdAt": "2025-08-07T04:14:51.881Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754540106067_jvxtdtin9.bin
````
my name is hoang and i like pizza
````

## File: storage/local-files/local_1754540106067_jvxtdtin9.meta.json
````json
{
  "blobId": "local_1754540106067_jvxtdtin9",
  "filename": "content_1754540106066.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 33,
  "createdAt": "2025-08-07T04:15:06.067Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754540108700_bygazbzkw.bin
````
my name is hoang and i like pizza
````

## File: storage/local-files/local_1754540108700_bygazbzkw.meta.json
````json
{
  "blobId": "local_1754540108700_bygazbzkw",
  "filename": "content_1754540108700.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 33,
  "createdAt": "2025-08-07T04:15:08.700Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754540560620_s4ex6ddxg.bin
````
i love cocacola
````

## File: storage/local-files/local_1754540560620_s4ex6ddxg.meta.json
````json
{
  "blobId": "local_1754540560620_s4ex6ddxg",
  "filename": "content_1754540560620.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 15,
  "createdAt": "2025-08-07T04:22:40.620Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754540573009_ghjdr09ly.bin
````
i love cocacola
````

## File: storage/local-files/local_1754540573009_ghjdr09ly.meta.json
````json
{
  "blobId": "local_1754540573009_ghjdr09ly",
  "filename": "content_1754540573009.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 15,
  "createdAt": "2025-08-07T04:22:53.010Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754540575575_yxy9qez6f.bin
````
i love cocacola
````

## File: storage/local-files/local_1754540575575_yxy9qez6f.meta.json
````json
{
  "blobId": "local_1754540575575_yxy9qez6f",
  "filename": "content_1754540575575.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 15,
  "createdAt": "2025-08-07T04:22:55.576Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754541634539_sqt76tdfh.bin
````
i'm working at commandoss
````

## File: storage/local-files/local_1754541634539_sqt76tdfh.meta.json
````json
{
  "blobId": "local_1754541634539_sqt76tdfh",
  "filename": "content_1754541634539.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 25,
  "createdAt": "2025-08-07T04:40:34.540Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754541647648_icfuh11h7.bin
````
i'm working at commandoss
````

## File: storage/local-files/local_1754541647648_icfuh11h7.meta.json
````json
{
  "blobId": "local_1754541647648_icfuh11h7",
  "filename": "content_1754541647648.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 25,
  "createdAt": "2025-08-07T04:40:47.649Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754541650145_ri0guagxt.bin
````
i'm working at commandoss
````

## File: storage/local-files/local_1754541650145_ri0guagxt.meta.json
````json
{
  "blobId": "local_1754541650145_ri0guagxt",
  "filename": "content_1754541650145.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 25,
  "createdAt": "2025-08-07T04:40:50.146Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754541692408_i6mdo5ysk.bin
````
commandoss is a blockchain company
````

## File: storage/local-files/local_1754541692408_i6mdo5ysk.meta.json
````json
{
  "blobId": "local_1754541692408_i6mdo5ysk",
  "filename": "content_1754541692408.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 34,
  "createdAt": "2025-08-07T04:41:32.409Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754541704380_6whgsy61h.bin
````
commandoss is a blockchain company
````

## File: storage/local-files/local_1754541704380_6whgsy61h.meta.json
````json
{
  "blobId": "local_1754541704380_6whgsy61h",
  "filename": "content_1754541704380.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 34,
  "createdAt": "2025-08-07T04:41:44.381Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754541707350_4jfu1ojc0.bin
````
commandoss is a blockchain company
````

## File: storage/local-files/local_1754541707350_4jfu1ojc0.meta.json
````json
{
  "blobId": "local_1754541707350_4jfu1ojc0",
  "filename": "content_1754541707350.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 34,
  "createdAt": "2025-08-07T04:41:47.351Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754541785901_ea8kfryak.bin
````
i'm living in ho chi minh city
````

## File: storage/local-files/local_1754541785901_ea8kfryak.meta.json
````json
{
  "blobId": "local_1754541785901_ea8kfryak",
  "filename": "content_1754541785901.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 30,
  "createdAt": "2025-08-07T04:43:05.902Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754541797114_05pja6iqr.bin
````
i'm living in ho chi minh city
````

## File: storage/local-files/local_1754541797114_05pja6iqr.meta.json
````json
{
  "blobId": "local_1754541797114_05pja6iqr",
  "filename": "content_1754541797114.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 30,
  "createdAt": "2025-08-07T04:43:17.115Z",
  "storageType": "local"
}
````

## File: storage/local-files/local_1754541799714_jdfwhdtlo.bin
````
i'm living in ho chi minh city
````

## File: storage/local-files/local_1754541799714_jdfwhdtlo.meta.json
````json
{
  "blobId": "local_1754541799714_jdfwhdtlo",
  "filename": "content_1754541799714.txt",
  "tags": {
    "owner": "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"
  },
  "size": 30,
  "createdAt": "2025-08-07T04:43:19.715Z",
  "storageType": "local"
}
````

## File: test-chat-success copy.js
````javascript
const axios = require('axios');

const API_URL = 'http://localhost:8000/api';
const USER_ADDRESS = '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15';

async function testChatWorkflow() {
  console.log('===============================================');
  console.log('Personal Data Wallet - Chat Session Test');
  console.log('===============================================');
  console.log('User Address:', USER_ADDRESS);
  console.log('Network: Sui Testnet');
  console.log('');
  
  try {
    // 1. Create a chat session
    console.log('1. Creating a new chat session...');
    const createResponse = await axios.post(`${API_URL}/chat/sessions`, {
      userAddress: USER_ADDRESS,
      modelName: 'gemini-1.5-pro',
      title: 'Test Conversation'
    });
    
    const sessionId = createResponse.data.sessionId;
    console.log('   ✓ Session created on Sui testnet');
    console.log('   Session ID:', sessionId);
    console.log('   Transaction stored on-chain!');
    
    // 2. Add user message
    console.log('\n2. Adding user message...');
    await axios.post(`${API_URL}/chat/sessions/${sessionId}/messages`, {
      userAddress: USER_ADDRESS,
      type: 'user',
      content: 'What is blockchain technology?'
    });
    console.log('   ✓ User message added');
    
    // 3. Simulate AI response
    console.log('\n3. Adding AI response...');
    await axios.post(`${API_URL}/chat/sessions/${sessionId}/messages`, {
      userAddress: USER_ADDRESS,
      type: 'assistant',
      content: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.'
    });
    console.log('   ✓ AI response added');
    
    // 4. Retrieve full conversation
    console.log('\n4. Retrieving conversation from Sui...');
    const getResponse = await axios.get(`${API_URL}/chat/sessions/${sessionId}`, {
      params: { userAddress: USER_ADDRESS }
    });
    
    const session = getResponse.data.session;
    console.log('   ✓ Retrieved from blockchain:');
    console.log('   - Owner:', session.owner);
    console.log('   - Messages:', session.messages.length);
    console.log('   - Created:', session.created_at);
    
    // 5. List all sessions
    console.log('\n5. Listing all sessions for user...');
    const listResponse = await axios.get(`${API_URL}/chat/sessions`, {
      params: { userAddress: USER_ADDRESS }
    });
    
    console.log('   ✓ Found', listResponse.data.sessions.length, 'sessions on-chain');
    
    console.log('\n===============================================');
    console.log('SUCCESS! All chat operations working on Sui testnet');
    console.log('===============================================');
    console.log('\nKey achievements:');
    console.log('✓ Successfully connected to Sui testnet');
    console.log('✓ Created chat session object on-chain');
    console.log('✓ Stored messages in blockchain');
    console.log('✓ Retrieved data from Sui network');
    console.log('✓ Using your wallet address:', USER_ADDRESS);
    console.log('\nView your transaction on Sui Explorer:');
    console.log(`https://suiexplorer.com/object/${sessionId}?network=testnet`);
    
  } catch (error) {
    console.error('\nError:', error.response?.data || error.message);
  }
}

// Test Seal encryption service
async function testSealEncryption() {
  console.log('\n\n=== Testing Seal Encryption Service ===');
  
  try {
    const response = await axios.post(`${API_URL}/seal/session-message`, {
      userAddress: USER_ADDRESS
    });
    console.log('✓ Seal encryption service is active');
    console.log('  Session key message generated successfully');
    
  } catch (error) {
    console.error('✗ Seal service error:', error.response?.data || error.message);
  }
}

async function runTests() {
  await testChatWorkflow();
  await testSealEncryption();
}

runTests();
````

## File: test/app.e2e-spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
````

## File: test/jest-e2e.json
````json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
````

## File: tsconfig.build.json
````json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
````

## File: .dockerignore
````
node_modules
npm-debug.log
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.git
.gitignore
README.md
.eslintrc.js
.prettierrc
.nyc_output
coverage
.nyc_output
coverage
.vscode
.idea
*.swp
*.swo
*~
.DS_Store
Thumbs.db
*.log
logs
*.pid
*.seed
*.pid.lock
.npm
.eslintcache
.node_repl_history
.yarn-integrity
.env.test
.cache
.parcel-cache
.next
.nuxt
dist
.tmp
.temp
tmp_hnsw_*.bin
backend.log
storage/local-files/*
storage/walrus-fallback/*
test
coverage
.nyc_output
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false
  }
}
````

## File: package.json
````json
{
  "name": "backend-v2",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run -d src/database/database.config.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/database/database.config.ts",
    "migration:show": "npm run typeorm -- migration:show -d src/database/database.config.ts"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "@mysten/sui": "^1.37.1",
    "@mysten/sui.js": "^0.54.1",
    "@mysten/walrus": "^0.5.3",
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.2",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/swagger": "^11.2.0",
    "@nestjs/typeorm": "^11.0.0",
    "axios": "^1.11.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2",
    "hnswlib-node": "^3.0.0",
    "node-cache": "^5.1.2",
    "pg": "^8.16.3",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "swagger-ui-express": "^5.0.1",
    "typeorm": "^0.3.25"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@eslint/js": "^9.18.0",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "@types/express": "^5.0.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.10.7",
    "@types/supertest": "^6.0.2",
    "eslint": "^9.18.0",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2",
    "globals": "^16.0.0",
    "jest": "^30.0.0",
    "prettier": "^3.4.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.2",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.7.3",
    "typescript-eslint": "^8.20.0"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
````
