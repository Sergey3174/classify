import axios, { type AxiosRequestConfig } from 'axios'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'

type QueryArgs = string | Pick<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params' | 'headers'>
interface QueryError {
  status: number | 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'CANCELED' | 'UNKNOWN_ERROR'
  message: string
}

/** Keep Axios objects out of Redux; pass RTK Query cancellation to the request. */
export function axiosBaseQuery(config: AxiosRequestConfig): BaseQueryFn<QueryArgs, unknown, QueryError> {
  const client = axios.create(config)
  return async (args, { signal }) => {
    try {
      const response = await client.request({
        ...(typeof args === 'string' ? { url: args } : args),
        signal,
      })
      return { data: response.data }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
          ?? (axios.isCancel(error) ? 'CANCELED'
            : error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' ? 'TIMEOUT_ERROR'
              : 'NETWORK_ERROR')
        return { error: { status, message: error.message } }
      }
      return { error: { status: 'UNKNOWN_ERROR', message: error instanceof Error ? error.message : 'Request failed' } }
    }
  }
}
