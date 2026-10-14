import { createApi } from '@reduxjs/toolkit/query/react'
import { apiClient } from './client'
import { axiosBaseQuery } from './axiosBaseQuery'
import type { tg } from '../telegram/telegram'

export interface AuthUser {
  id: number
  roles: Record<string, boolean>
}

export interface AuthResponse {
  user: AuthUser
}

type InitDataUnsafe = NonNullable<typeof tg>['initDataUnsafe']

export const backendApi = createApi({
  reducerPath: 'backendApi',
  baseQuery: axiosBaseQuery({}, apiClient),
  endpoints: (build) => ({
    authorize: build.mutation<AuthResponse, InitDataUnsafe>({
      query: (data) => ({ url: '/auth', method: 'POST', data }),
    }),
  }),
})
